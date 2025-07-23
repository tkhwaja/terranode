import { db } from "../db";
import { energyReadings, tokenLedger, userWallets } from "@shared/schema";
import type { InsertEnergyReading, InsertTokenLedgerEntry } from "@shared/schema";
import { eq } from "drizzle-orm";

interface SeederOptions {
  userId: string;
  days?: number;
  hoursPerDay?: number;
}

export class DemoDataSeeder {
  // Generate realistic energy data for demo purposes
  private generateEnergyData(timestamp: Date): {
    solarGenerated: number;
    energyConsumed: number;
    surplusExported: number;
    wattTokensEarned: number;
  } {
    // Solar generation varies by time of day (peak around noon)
    const hour = timestamp.getHours();
    const solarMultiplier = this.getSolarMultiplier(hour);
    
    // Base solar generation (2-10 kWh) adjusted by time of day
    const baseSolar = 2 + Math.random() * 8;
    const solarGenerated = parseFloat((baseSolar * solarMultiplier).toFixed(3));
    
    // Energy consumption (1-8 kWh) with some household patterns
    const baseConsumption = 1 + Math.random() * 7;
    const consumptionMultiplier = this.getConsumptionMultiplier(hour);
    const energyConsumed = parseFloat((baseConsumption * consumptionMultiplier).toFixed(3));
    
    // Calculate surplus (cannot be negative)
    const surplusExported = parseFloat(Math.max(solarGenerated - energyConsumed, 0).toFixed(3));
    
    // WATT tokens earned at 0.75 rate per kWh surplus
    const wattTokensEarned = parseFloat((surplusExported * 0.75).toFixed(3));
    
    return {
      solarGenerated,
      energyConsumed,
      surplusExported,
      wattTokensEarned
    };
  }

  // Solar generation peaks around noon, minimal at night
  private getSolarMultiplier(hour: number): number {
    if (hour >= 6 && hour <= 18) {
      // Daylight hours: bell curve peaking at noon
      const noonDistance = Math.abs(hour - 12);
      return Math.max(0.1, 1 - (noonDistance / 8));
    }
    return 0.05; // Minimal generation at night
  }

  // Consumption patterns: higher in morning/evening, lower midday
  private getConsumptionMultiplier(hour: number): number {
    if (hour >= 7 && hour <= 9) return 1.3; // Morning peak
    if (hour >= 18 && hour <= 21) return 1.4; // Evening peak
    if (hour >= 22 || hour <= 6) return 0.7; // Night/early morning
    return 1.0; // Normal daytime consumption
  }

  // Generate demo data for specified time period
  async seedDemoData({ userId, days = 7, hoursPerDay = 24 }: SeederOptions): Promise<{
    energyRecords: number;
    tokenEntries: number;
    totalTokensEarned: number;
  }> {
    const energyRecords: InsertEnergyReading[] = [];
    const tokenEntries: InsertTokenLedgerEntry[] = [];
    let totalTokensEarned = 0;

    const now = new Date();
    
    for (let day = days - 1; day >= 0; day--) {
      for (let hour = 0; hour < hoursPerDay; hour++) {
        const timestamp = new Date(now);
        timestamp.setDate(now.getDate() - day);
        timestamp.setHours(hour, 0, 0, 0);

        const energyData = this.generateEnergyData(timestamp);
        
        // Create energy reading record
        energyRecords.push({
          userId,
          solarGenerated: energyData.solarGenerated,
          energyConsumed: energyData.energyConsumed,
          surplusExported: energyData.surplusExported,
          wattTokensEarned: energyData.wattTokensEarned
        });

        // Create token ledger entry if tokens were earned
        if (energyData.wattTokensEarned > 0) {
          tokenEntries.push({
            userId,
            amount: energyData.wattTokensEarned,
            type: "generation",
            description: `Solar generation reward: ${energyData.surplusExported} kWh surplus exported`
          });
          totalTokensEarned += energyData.wattTokensEarned;
        }
      }
    }

    // Insert all records in batches for better performance
    const batchSize = 50;
    let insertedEnergyRecords = 0;
    let insertedTokenEntries = 0;

    // Insert energy readings in batches with timestamps
    for (let i = 0; i < energyRecords.length; i += batchSize) {
      const batch = energyRecords.slice(i, i + batchSize);
      const batchWithTimestamps = batch.map((record, index) => {
        const timestamp = new Date(now);
        const dayOffset = Math.floor((i + index) / hoursPerDay);
        const hourOffset = (i + index) % hoursPerDay;
        timestamp.setDate(now.getDate() - (days - 1 - dayOffset));
        timestamp.setHours(hourOffset, 0, 0, 0);
        return { ...record, timestamp };
      });
      await db.insert(energyReadings).values(batchWithTimestamps);
      insertedEnergyRecords += batch.length;
    }

    // Insert token ledger entries in batches
    for (let i = 0; i < tokenEntries.length; i += batchSize) {
      const batch = tokenEntries.slice(i, i + batchSize);
      await db.insert(tokenLedger).values(batch);
      insertedTokenEntries += batch.length;
    }

    // Update user wallet with new token balance
    await this.updateUserWallet(userId, totalTokensEarned);

    return {
      energyRecords: insertedEnergyRecords,
      tokenEntries: insertedTokenEntries,
      totalTokensEarned: parseFloat(totalTokensEarned.toFixed(3))
    };
  }

  // Update user wallet with new token earnings
  private async updateUserWallet(userId: string, newTokens: number): Promise<void> {
    const [existingWallet] = await db
      .select()
      .from(userWallets)
      .where(eq(userWallets.userId, userId));

    if (existingWallet) {
      // Update existing wallet
      await db
        .update(userWallets)
        .set({
          wattBalance: (existingWallet.wattBalance || 0) + newTokens,
          lifetimeEarnings: (existingWallet.lifetimeEarnings || 0) + newTokens,
          todaysEarnings: (existingWallet.todaysEarnings || 0) + newTokens,
          lastUpdated: new Date()
        })
        .where(eq(userWallets.userId, userId));
    } else {
      // Create new wallet
      await db.insert(userWallets).values({
        userId,
        wattBalance: newTokens,
        lifetimeEarnings: newTokens,
        todaysEarnings: newTokens,
        lastUpdated: new Date()
      });
    }
  }

  // Generate single data point for auto-seeding
  async seedSingleDataPoint(userId: string): Promise<{
    energyGenerated: boolean;
    tokensEarned: number;
  }> {
    const timestamp = new Date();
    const energyData = this.generateEnergyData(timestamp);

    // Insert energy reading
    await db.insert(energyReadings).values({
      userId,
      solarGenerated: energyData.solarGenerated,
      energyConsumed: energyData.energyConsumed,
      surplusExported: energyData.surplusExported,
      wattTokensEarned: energyData.wattTokensEarned
    });

    // Insert token ledger entry if tokens earned
    if (energyData.wattTokensEarned > 0) {
      await db.insert(tokenLedger).values({
        userId,
        amount: energyData.wattTokensEarned,
        type: "generation",
        description: `Real-time generation: ${energyData.surplusExported} kWh surplus`
      });

      // Update wallet
      await this.updateUserWallet(userId, energyData.wattTokensEarned);
    }

    return {
      energyGenerated: true,
      tokensEarned: energyData.wattTokensEarned
    };
  }
}

export const demoSeeder = new DemoDataSeeder();