import {
  users,
  energyReadings,
  solarAlliances,
  allianceMemberships,
  userWallets,
  type User,
  type UpsertUser,
  type EnergyReading,
  type InsertEnergyReading,
  type SolarAlliance,
  type InsertSolarAlliance,
  type AllianceMembership,
  type InsertAllianceMembership,
  type UserWallet,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, sql, and, isNull } from "drizzle-orm";

export interface IStorage {
  // User operations (mandatory for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Energy operations
  createEnergyReading(reading: InsertEnergyReading): Promise<EnergyReading>;
  getUserEnergyReadings(userId: string, limit?: number): Promise<EnergyReading[]>;
  getLatestEnergyReading(userId: string): Promise<EnergyReading | undefined>;
  
  // Alliance operations
  createAlliance(alliance: InsertSolarAlliance): Promise<SolarAlliance>;
  getAlliances(): Promise<SolarAlliance[]>;
  joinAlliance(membership: InsertAllianceMembership): Promise<AllianceMembership>;
  getUserAlliances(userId: string): Promise<SolarAlliance[]>;
  
  // Wallet operations
  getUserWallet(userId: string): Promise<UserWallet | undefined>;
  updateUserWallet(userId: string, wattBalance: number, lifetimeEarnings: number, todaysEarnings: number): Promise<UserWallet>;
  
  // Referral operations
  generateReferralCode(): Promise<string>;
  getReferralStats(userId: string): Promise<{ totalReferrals: number; referralBonus: number }>;
  getReferralLeaderboard(limit?: number): Promise<Array<{ userId: string; referralCount: number; firstName?: string; lastName?: string }>>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const referralCode = await this.generateReferralCode();
    
    const [user] = await db
      .insert(users)
      .values({
        ...userData,
        referralCode,
      })
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    
    // Create wallet for new user
    await db
      .insert(userWallets)
      .values({
        userId: user.id,
        wattBalance: 0,
        lifetimeEarnings: 0,
        todaysEarnings: 0,
      })
      .onConflictDoNothing();
    
    return user;
  }

  // Energy operations
  async createEnergyReading(reading: InsertEnergyReading): Promise<EnergyReading> {
    const wattTokensEarned = reading.surplusExported * 0.75;
    
    const [energyReading] = await db
      .insert(energyReadings)
      .values({
        ...reading,
        wattTokensEarned,
      })
      .returning();
    
    // Update user wallet
    await this.updateUserWalletBalance(reading.userId, wattTokensEarned);
    
    return energyReading;
  }

  async getUserEnergyReadings(userId: string, limit = 24): Promise<EnergyReading[]> {
    return await db
      .select()
      .from(energyReadings)
      .where(eq(energyReadings.userId, userId))
      .orderBy(desc(energyReadings.timestamp))
      .limit(limit);
  }

  async getLatestEnergyReading(userId: string): Promise<EnergyReading | undefined> {
    const [reading] = await db
      .select()
      .from(energyReadings)
      .where(eq(energyReadings.userId, userId))
      .orderBy(desc(energyReadings.timestamp))
      .limit(1);
    
    return reading;
  }

  // Alliance operations
  async createAlliance(alliance: InsertSolarAlliance): Promise<SolarAlliance> {
    const [newAlliance] = await db
      .insert(solarAlliances)
      .values({
        ...alliance,
        memberCount: 1,
      })
      .returning();
    
    // Auto-join creator to alliance
    await db.insert(allianceMemberships).values({
      userId: alliance.createdBy,
      allianceId: newAlliance.id,
    });
    
    return newAlliance;
  }

  async getAlliances(): Promise<SolarAlliance[]> {
    return await db.select().from(solarAlliances).orderBy(desc(solarAlliances.totalSurplus));
  }

  async joinAlliance(membership: InsertAllianceMembership): Promise<AllianceMembership> {
    const [newMembership] = await db
      .insert(allianceMemberships)
      .values(membership)
      .returning();
    
    // Update alliance member count
    await db
      .update(solarAlliances)
      .set({
        memberCount: sql`${solarAlliances.memberCount} + 1`,
      })
      .where(eq(solarAlliances.id, membership.allianceId));
    
    return newMembership;
  }

  async getUserAlliances(userId: string): Promise<SolarAlliance[]> {
    const result = await db
      .select({
        id: solarAlliances.id,
        name: solarAlliances.name,
        description: solarAlliances.description,
        createdBy: solarAlliances.createdBy,
        memberCount: solarAlliances.memberCount,
        totalSurplus: solarAlliances.totalSurplus,
        createdAt: solarAlliances.createdAt,
      })
      .from(solarAlliances)
      .innerJoin(allianceMemberships, eq(solarAlliances.id, allianceMemberships.allianceId))
      .where(and(
        eq(allianceMemberships.userId, userId),
        eq(allianceMemberships.isActive, true)
      ));
    
    return result;
  }

  // Wallet operations
  async getUserWallet(userId: string): Promise<UserWallet | undefined> {
    const [wallet] = await db
      .select()
      .from(userWallets)
      .where(eq(userWallets.userId, userId));
    
    return wallet;
  }

  async updateUserWallet(userId: string, wattBalance: number, lifetimeEarnings: number, todaysEarnings: number): Promise<UserWallet> {
    const [wallet] = await db
      .update(userWallets)
      .set({
        wattBalance,
        lifetimeEarnings,
        todaysEarnings,
        lastUpdated: new Date(),
      })
      .where(eq(userWallets.userId, userId))
      .returning();
    
    return wallet;
  }

  private async updateUserWalletBalance(userId: string, wattTokensEarned: number): Promise<void> {
    await db
      .update(userWallets)
      .set({
        wattBalance: sql`${userWallets.wattBalance} + ${wattTokensEarned}`,
        lifetimeEarnings: sql`${userWallets.lifetimeEarnings} + ${wattTokensEarned}`,
        todaysEarnings: sql`${userWallets.todaysEarnings} + ${wattTokensEarned}`,
        lastUpdated: new Date(),
      })
      .where(eq(userWallets.userId, userId));
  }

  // Referral operations
  async generateReferralCode(): Promise<string> {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code: string;
    let isUnique = false;
    
    do {
      code = 'TERRA-';
      for (let i = 0; i < 5; i++) {
        code += characters.charAt(Math.floor(Math.random() * characters.length));
      }
      
      const [existingUser] = await db
        .select()
        .from(users)
        .where(eq(users.referralCode, code))
        .limit(1);
      
      isUnique = !existingUser;
    } while (!isUnique);
    
    return code;
  }

  async getReferralStats(userId: string): Promise<{ totalReferrals: number; referralBonus: number }> {
    const [stats] = await db
      .select({
        totalReferrals: sql<number>`count(*)`,
      })
      .from(users)
      .where(eq(users.referredBy, userId));
    
    const totalReferrals = stats?.totalReferrals || 0;
    const referralBonus = totalReferrals * 20; // 20 WATT per referral
    
    return { totalReferrals, referralBonus };
  }

  async getReferralLeaderboard(limit = 10): Promise<Array<{ userId: string; referralCount: number; firstName?: string; lastName?: string }>> {
    const result = await db
      .select({
        userId: users.id,
        firstName: users.firstName,
        lastName: users.lastName,
        referralCount: sql<number>`count(referrals.id)`,
      })
      .from(users)
      .leftJoin(
        sql`${users} as referrals`,
        sql`referrals.referred_by = ${users.id}`
      )
      .groupBy(users.id, users.firstName, users.lastName)
      .orderBy(desc(sql`count(referrals.id)`))
      .limit(limit);
    
    return result;
  }
}

export const storage = new DatabaseStorage();
