import { storage } from "../storage";
import { InsertEnergyReading } from "@shared/schema";

export class DataGenerator {
  private intervalId: NodeJS.Timeout | null = null;
  private userIds: string[] = [];

  async start() {
    // Get all users to generate data for
    this.userIds = await this.getAllUserIds();
    
    // Generate initial readings for all users
    await this.generateInitialData();
    
    // Start periodic data generation (every 5 minutes)
    this.intervalId = setInterval(async () => {
      await this.generatePeriodicData();
    }, 5 * 60 * 1000);
    
    console.log("Data generator started");
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      console.log("Data generator stopped");
    }
  }

  private async getAllUserIds(): Promise<string[]> {
    // This is a simplified approach - in a real app you'd query the database
    // For now, return an empty array and populate as users log in
    return [];
  }

  private async generateInitialData() {
    // Generate some historical data for existing users
    for (const userId of this.userIds) {
      await this.generateHistoricalData(userId);
    }
  }

  private async generateHistoricalData(userId: string) {
    const now = new Date();
    const hours = 24;
    
    for (let i = hours; i >= 0; i--) {
      const timestamp = new Date(now.getTime() - i * 60 * 60 * 1000);
      const reading = this.generateEnergyReading(userId, timestamp);
      
      try {
        await storage.createEnergyReading(reading);
      } catch (error) {
        console.error("Error creating historical energy reading:", error);
      }
    }
  }

  private async generatePeriodicData() {
    // Refresh user list
    this.userIds = await this.getAllUserIds();
    
    for (const userId of this.userIds) {
      const reading = this.generateEnergyReading(userId);
      
      try {
        await storage.createEnergyReading(reading);
      } catch (error) {
        console.error("Error creating periodic energy reading:", error);
      }
    }
  }

  private generateEnergyReading(userId: string, timestamp?: Date): InsertEnergyReading {
    const currentHour = timestamp ? timestamp.getHours() : new Date().getHours();
    
    // Generate realistic solar production based on time of day
    let solarGenerated = 0;
    if (currentHour >= 6 && currentHour <= 18) {
      // Peak solar hours (10-14), with gradual ramp up/down
      const peakHours = [10, 11, 12, 13, 14];
      const goodHours = [8, 9, 15, 16];
      const lowHours = [6, 7, 17, 18];
      
      if (peakHours.includes(currentHour)) {
        solarGenerated = Math.random() * 3 + 7; // 7-10 kW
      } else if (goodHours.includes(currentHour)) {
        solarGenerated = Math.random() * 3 + 4; // 4-7 kW
      } else if (lowHours.includes(currentHour)) {
        solarGenerated = Math.random() * 2 + 1; // 1-3 kW
      }
    }
    
    // Generate realistic energy consumption (always some base load)
    const baseConsumption = 2; // 2kW base load
    const variableConsumption = Math.random() * 4; // 0-4kW variable
    const energyConsumed = baseConsumption + variableConsumption;
    
    // Calculate surplus (can be negative if consuming more than generating)
    const surplus = solarGenerated - energyConsumed;
    const surplusExported = Math.max(0, surplus);
    
    // Add some randomness to make it more realistic
    const jitter = (Math.random() - 0.5) * 0.2;
    
    return {
      userId,
      solarGenerated: Math.max(0, solarGenerated + jitter),
      energyConsumed: Math.max(0, energyConsumed + jitter),
      surplusExported: Math.max(0, surplusExported + jitter),
      wattTokensEarned: Math.max(0, surplusExported + jitter) * 0.75,
    };
  }

  // Method to add a user to the data generation
  async addUser(userId: string) {
    if (!this.userIds.includes(userId)) {
      this.userIds.push(userId);
      await this.generateHistoricalData(userId);
      console.log(`Added user ${userId} to data generation`);
    }
  }
}

export const dataGenerator = new DataGenerator();
