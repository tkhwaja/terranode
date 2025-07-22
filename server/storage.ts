import {
  users,
  energyReadings,
  solarAlliances,
  allianceMemberships,
  userWallets,
  tokenLedger,
  milestones,
  userMilestones,
  uptimeTracker,
  notifications,
  allianceProposals,
  allianceVotes,
  type User,
  type UpsertUser,
  type EnergyReading,
  type InsertEnergyReading,
  type SolarAlliance,
  type InsertSolarAlliance,
  type AllianceMembership,
  type InsertAllianceMembership,
  type UserWallet,
  type TokenLedgerEntry,
  type InsertTokenLedgerEntry,
  type Milestone,
  type InsertMilestone,
  type UserMilestone,
  type InsertUserMilestone,
  type UptimeRecord,
  type InsertUptimeRecord,
  type Notification,
  type InsertNotification,
  type AllianceProposal,
  type InsertAllianceProposal,
  type AllianceVote,
  type InsertAllianceVote,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, sql, and, isNull } from "drizzle-orm";

export interface IStorage {
  // User operations (mandatory for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  updateUserProfile(userId: string, profileData: Partial<User>): Promise<User>;
  
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
  
  // Token ledger operations
  createTokenEntry(entry: InsertTokenLedgerEntry): Promise<TokenLedgerEntry>;
  getUserTokenLedger(userId: string, limit?: number): Promise<TokenLedgerEntry[]>;
  
  // Milestone operations
  getMilestones(): Promise<Milestone[]>;
  createMilestone(milestone: InsertMilestone): Promise<Milestone>;
  getUserMilestones(userId: string): Promise<UserMilestone[]>;
  updateMilestoneProgress(userId: string, milestoneId: number, progress: number): Promise<UserMilestone>;
  unlockMilestone(userId: string, milestoneId: number): Promise<UserMilestone>;
  
  // Uptime operations
  recordUptime(record: InsertUptimeRecord): Promise<UptimeRecord>;
  getUserUptimeStats(userId: string, days?: number): Promise<UptimeRecord[]>;
  
  // Notification operations
  createNotification(notification: InsertNotification): Promise<Notification>;
  getUserNotifications(userId: string, limit?: number): Promise<Notification[]>;
  markNotificationAsRead(notificationId: number): Promise<void>;
  
  // Alliance governance operations
  createProposal(proposal: InsertAllianceProposal): Promise<AllianceProposal>;
  getAllianceProposals(allianceId: number): Promise<AllianceProposal[]>;
  voteOnProposal(vote: InsertAllianceVote): Promise<AllianceVote>;
  getProposalVotes(proposalId: number): Promise<AllianceVote[]>;
  
  // Referral operations
  generateReferralCode(): Promise<string>;
  getReferralStats(userId: string): Promise<{ totalReferrals: number; referralBonus: number }>;
  getReferralLeaderboard(limit?: number): Promise<Array<{ userId: string; referralCount: number; firstName?: string; lastName?: string }>>;
  
  // Additional wallet operations
  updateUserTokenBalance(userId: string, tokensEarned: number): Promise<void>;
  createSurplusLog(data: { userId: string; amount: number; wattTokensEarned: number }): Promise<any>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async updateUserProfile(userId: string, profileData: Partial<User>): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ ...profileData, updatedAt: new Date() })
      .where(eq(users.id, userId))
      .returning();
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
    
    return result.map(item => ({
      userId: item.userId,
      referralCount: item.referralCount,
      firstName: item.firstName || undefined,
      lastName: item.lastName || undefined,
    }));
  }

  // Token ledger operations
  async createTokenEntry(entry: InsertTokenLedgerEntry): Promise<TokenLedgerEntry> {
    const [tokenEntry] = await db
      .insert(tokenLedger)
      .values(entry)
      .returning();
    return tokenEntry;
  }

  async getUserTokenLedger(userId: string, limit = 50): Promise<TokenLedgerEntry[]> {
    return await db
      .select()
      .from(tokenLedger)
      .where(eq(tokenLedger.userId, userId))
      .orderBy(desc(tokenLedger.createdAt))
      .limit(limit);
  }

  // Milestone operations
  async getMilestones(): Promise<Milestone[]> {
    return await db
      .select()
      .from(milestones)
      .where(eq(milestones.isActive, true))
      .orderBy(milestones.threshold);
  }

  async createMilestone(milestone: InsertMilestone): Promise<Milestone> {
    const [newMilestone] = await db
      .insert(milestones)
      .values(milestone)
      .returning();
    return newMilestone;
  }

  async getUserMilestones(userId: string): Promise<UserMilestone[]> {
    return await db
      .select()
      .from(userMilestones)
      .where(eq(userMilestones.userId, userId))
      .orderBy(userMilestones.progress);
  }

  async updateMilestoneProgress(userId: string, milestoneId: number, progress: number): Promise<UserMilestone> {
    const [updated] = await db
      .update(userMilestones)
      .set({ progress, isCompleted: progress >= 100 })
      .where(and(eq(userMilestones.userId, userId), eq(userMilestones.milestoneId, milestoneId)))
      .returning();
    return updated;
  }

  async unlockMilestone(userId: string, milestoneId: number): Promise<UserMilestone> {
    const [unlocked] = await db
      .update(userMilestones)
      .set({ isCompleted: true, progress: 100, unlockedAt: new Date() })
      .where(and(eq(userMilestones.userId, userId), eq(userMilestones.milestoneId, milestoneId)))
      .returning();
    return unlocked;
  }

  // Uptime operations
  async recordUptime(record: InsertUptimeRecord): Promise<UptimeRecord> {
    const [uptimeRecord] = await db
      .insert(uptimeTracker)
      .values(record)
      .onConflictDoUpdate({
        target: [uptimeTracker.userId, uptimeTracker.date],
        set: {
          uptimeMinutes: record.uptimeMinutes,
          isActive: record.isActive,
        },
      })
      .returning();
    return uptimeRecord;
  }

  async getUserUptimeStats(userId: string, days = 30): Promise<UptimeRecord[]> {
    return await db
      .select()
      .from(uptimeTracker)
      .where(eq(uptimeTracker.userId, userId))
      .orderBy(desc(uptimeTracker.date))
      .limit(days);
  }

  // Notification operations
  async createNotification(notification: InsertNotification): Promise<Notification> {
    const [newNotification] = await db
      .insert(notifications)
      .values(notification)
      .returning();
    return newNotification;
  }

  async getUserNotifications(userId: string, limit = 20): Promise<Notification[]> {
    return await db
      .select()
      .from(notifications)
      .where(eq(notifications.userId, userId))
      .orderBy(desc(notifications.createdAt))
      .limit(limit);
  }

  async markNotificationAsRead(notificationId: number): Promise<void> {
    await db
      .update(notifications)
      .set({ isRead: true })
      .where(eq(notifications.id, notificationId));
  }

  // Alliance governance operations
  async createProposal(proposal: InsertAllianceProposal): Promise<AllianceProposal> {
    const [newProposal] = await db
      .insert(allianceProposals)
      .values(proposal)
      .returning();
    return newProposal;
  }

  async getAllianceProposals(allianceId: number): Promise<AllianceProposal[]> {
    return await db
      .select()
      .from(allianceProposals)
      .where(eq(allianceProposals.allianceId, allianceId))
      .orderBy(desc(allianceProposals.createdAt));
  }

  async voteOnProposal(vote: InsertAllianceVote): Promise<AllianceVote> {
    const [newVote] = await db
      .insert(allianceVotes)
      .values(vote)
      .returning();
    
    // Update proposal vote counts
    await db
      .update(allianceProposals)
      .set({
        votesYes: sql`${allianceProposals.votesYes} + CASE WHEN ${vote.vote} = 'yes' THEN 1 ELSE 0 END`,
        votesNo: sql`${allianceProposals.votesNo} + CASE WHEN ${vote.vote} = 'no' THEN 1 ELSE 0 END`,
        votesAbstain: sql`${allianceProposals.votesAbstain} + CASE WHEN ${vote.vote} = 'abstain' THEN 1 ELSE 0 END`,
      })
      .where(eq(allianceProposals.id, vote.proposalId));
    
    return newVote;
  }

  async getProposalVotes(proposalId: number): Promise<AllianceVote[]> {
    return await db
      .select()
      .from(allianceVotes)
      .where(eq(allianceVotes.proposalId, proposalId))
      .orderBy(desc(allianceVotes.createdAt));
  }

  // Additional wallet operations for WATT ticker
  async updateUserTokenBalance(userId: string, tokensEarned: number): Promise<void> {
    // First ensure user has a wallet
    const existingWallet = await this.getUserWallet(userId);
    
    if (!existingWallet) {
      // Create wallet if it doesn't exist
      await db.insert(userWallets).values({
        userId,
        wattBalance: tokensEarned,
        lifetimeEarnings: tokensEarned,
        todaysEarnings: tokensEarned,
      });
    } else {
      // Update existing wallet
      await db
        .update(userWallets)
        .set({
          wattBalance: sql`${userWallets.wattBalance} + ${tokensEarned}`,
          lifetimeEarnings: sql`${userWallets.lifetimeEarnings} + ${tokensEarned}`,
          todaysEarnings: sql`${userWallets.todaysEarnings} + ${tokensEarned}`,
          lastUpdated: new Date(),
        })
        .where(eq(userWallets.userId, userId));
    }
  }

  async createSurplusLog(data: { userId: string; amount: number; wattTokensEarned: number }): Promise<any> {
    // Create a token ledger entry for the surplus log
    const [entry] = await db
      .insert(tokenLedger)
      .values({
        userId: data.userId,
        transactionType: 'surplus_sale',
        amount: data.wattTokensEarned,
        description: `Surplus energy sale: ${data.amount.toFixed(2)} kWh`,
      })
      .returning();
    
    return entry;
  }
}

export const storage = new DatabaseStorage();
