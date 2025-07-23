import { demoSeeder } from "./demoSeeder";
import { storage } from "../storage";

interface AutoSeederConfig {
  enabled: boolean;
  intervalMinutes: number;
  maxUsersPerCycle: number;
}

export class AutoSeeder {
  private intervalId: NodeJS.Timeout | null = null;
  private config: AutoSeederConfig = {
    enabled: process.env.AUTO_SEEDER_ENABLED === 'true' || false,
    intervalMinutes: parseInt(process.env.AUTO_SEEDER_INTERVAL || '5'),
    maxUsersPerCycle: parseInt(process.env.AUTO_SEEDER_MAX_USERS || '10')
  };

  private activeUsers: Set<string> = new Set();

  constructor() {
    console.log('AutoSeeder initialized:', this.config);
  }

  // Start the auto-seeding process
  start(): void {
    if (!this.config.enabled) {
      console.log('AutoSeeder disabled via configuration');
      return;
    }

    if (this.intervalId) {
      console.log('AutoSeeder already running');
      return;
    }

    console.log(`Starting AutoSeeder with ${this.config.intervalMinutes} minute intervals`);
    
    this.intervalId = setInterval(async () => {
      await this.seedCycle();
    }, this.config.intervalMinutes * 60 * 1000);

    // Run initial seed cycle after 30 seconds
    setTimeout(() => {
      this.seedCycle();
    }, 30000);
  }

  // Stop the auto-seeding process
  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      console.log('AutoSeeder stopped');
    }
  }

  // Add user to active seeding list
  addUser(userId: string): void {
    this.activeUsers.add(userId);
    console.log(`Added user ${userId} to auto-seeding list (${this.activeUsers.size} total users)`);
  }

  // Remove user from active seeding list
  removeUser(userId: string): void {
    this.activeUsers.delete(userId);
    console.log(`Removed user ${userId} from auto-seeding list (${this.activeUsers.size} total users)`);
  }

  // Get current configuration
  getConfig(): AutoSeederConfig {
    return { ...this.config };
  }

  // Update configuration
  updateConfig(newConfig: Partial<AutoSeederConfig>): void {
    const wasEnabled = this.config.enabled;
    this.config = { ...this.config, ...newConfig };
    
    console.log('AutoSeeder configuration updated:', this.config);

    // Restart if enabled status changed
    if (wasEnabled !== this.config.enabled) {
      if (this.config.enabled) {
        this.start();
      } else {
        this.stop();
      }
    }
  }

  // Get active users count
  getActiveUsersCount(): number {
    return this.activeUsers.size;
  }

  // Perform a seeding cycle for active users
  private async seedCycle(): Promise<void> {
    if (this.activeUsers.size === 0) {
      console.log('AutoSeeder: No active users to seed');
      return;
    }

    console.log(`AutoSeeder: Starting cycle for ${this.activeUsers.size} users`);
    
    const usersToSeed = Array.from(this.activeUsers).slice(0, this.config.maxUsersPerCycle);
    let successCount = 0;
    let errorCount = 0;

    for (const userId of usersToSeed) {
      try {
        const result = await demoSeeder.seedSingleDataPoint(userId);
        
        if (result.tokensEarned > 0) {
          // Broadcast balance update via WebSocket if available
          const broadcastUpdate = (global as any).broadcastBalanceUpdate;
          if (broadcastUpdate) {
            const wallet = await storage.getUserWallet(userId);
            if (wallet) {
              broadcastUpdate(userId, wallet.wattBalance, result.tokensEarned);
            }
          }
        }
        
        successCount++;
        console.log(`AutoSeeder: Generated data for user ${userId} - ${result.tokensEarned} WATT earned`);
      } catch (error) {
        errorCount++;
        console.error(`AutoSeeder: Error seeding data for user ${userId}:`, error);
      }
    }

    console.log(`AutoSeeder: Cycle complete - ${successCount} success, ${errorCount} errors`);
  }

  // Get seeding statistics
  getStats(): {
    enabled: boolean;
    activeUsers: number;
    intervalMinutes: number;
    isRunning: boolean;
  } {
    return {
      enabled: this.config.enabled,
      activeUsers: this.activeUsers.size,
      intervalMinutes: this.config.intervalMinutes,
      isRunning: this.intervalId !== null
    };
  }
}

export const autoSeeder = new AutoSeeder();