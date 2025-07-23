import {
  pgTable,
  text,
  varchar,
  timestamp,
  jsonb,
  index,
  serial,
  real,
  integer,
  boolean,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  referralCode: varchar("referral_code").unique(),
  referredBy: varchar("referred_by"),
  location: varchar("location"),
  inverterBrand: varchar("inverter_brand"),
  profileVisibility: varchar("profile_visibility").default("public"), // public, private
  termsAccepted: boolean("terms_accepted").default(false),
  kycCompleted: boolean("kyc_completed").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Energy readings table
export const energyReadings = pgTable("energy_readings", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  solarGenerated: real("solar_generated").notNull(),
  energyConsumed: real("energy_consumed").notNull(),
  surplusExported: real("surplus_exported").notNull(),
  wattTokensEarned: real("watt_tokens_earned").notNull(),
  timestamp: timestamp("timestamp").defaultNow(),
});

// Solar alliances table
export const solarAlliances = pgTable("solar_alliances", {
  id: serial("id").primaryKey(),
  name: varchar("name").notNull(),
  description: text("description"),
  createdBy: varchar("created_by").notNull().references(() => users.id),
  memberCount: integer("member_count").default(0),
  totalSurplus: real("total_surplus").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

// Alliance memberships table
export const allianceMemberships = pgTable("alliance_memberships", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  allianceId: integer("alliance_id").notNull().references(() => solarAlliances.id),
  joinedAt: timestamp("joined_at").defaultNow(),
  isActive: boolean("is_active").default(true),
});

// User wallets table
export const userWallets = pgTable("user_wallets", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  wattBalance: real("watt_balance").default(0),
  lifetimeEarnings: real("lifetime_earnings").default(0),
  todaysEarnings: real("todays_earnings").default(0),
  lastUpdated: timestamp("last_updated").defaultNow(),
});

// Token ledger table
export const tokenLedger = pgTable("token_ledger", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  amount: real("amount").notNull(),
  type: varchar("type").notNull(), // generation, referral, milestone
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Milestones table
export const milestones = pgTable("milestones", {
  id: serial("id").primaryKey(),
  name: varchar("name").notNull(),
  description: text("description"),
  type: varchar("type").notNull(), // uptime, energy, referral
  threshold: real("threshold").notNull(),
  badgeIcon: varchar("badge_icon"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// User milestones (achievement tracking)
export const userMilestones = pgTable("user_milestones", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  milestoneId: integer("milestone_id").notNull().references(() => milestones.id),
  unlockedAt: timestamp("unlocked_at").defaultNow(),
  progress: real("progress").default(0),
  isCompleted: boolean("is_completed").default(false),
});

// Uptime tracking table
export const uptimeTracker = pgTable("uptime_tracker", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  date: varchar("date").notNull(), // YYYY-MM-DD format
  uptimeMinutes: integer("uptime_minutes").default(0),
  totalMinutes: integer("total_minutes").default(1440), // 24 hours
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Notifications table
export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  type: varchar("type").notNull(), // token_threshold, referral_bonus, group_invite, milestone_unlocked
  title: varchar("title").notNull(),
  message: text("message"),
  isRead: boolean("is_read").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Alliance proposals table (for governance)
export const allianceProposals = pgTable("alliance_proposals", {
  id: serial("id").primaryKey(),
  allianceId: integer("alliance_id").notNull().references(() => solarAlliances.id),
  createdBy: varchar("created_by").notNull().references(() => users.id),
  title: varchar("title").notNull(),
  description: text("description"),
  type: varchar("type").notNull(), // general, staking, governance
  votesYes: integer("votes_yes").default(0),
  votesNo: integer("votes_no").default(0),
  votesAbstain: integer("votes_abstain").default(0),
  isActive: boolean("is_active").default(true),
  endsAt: timestamp("ends_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Alliance votes table
export const allianceVotes = pgTable("alliance_votes", {
  id: serial("id").primaryKey(),
  proposalId: integer("proposal_id").notNull().references(() => allianceProposals.id),
  userId: varchar("user_id").notNull().references(() => users.id),
  vote: varchar("vote").notNull(), // yes, no, abstain
  createdAt: timestamp("created_at").defaultNow(),
});

// Daily missions table
export const dailyMissions = pgTable("daily_missions", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  missionType: varchar("mission_type").notNull(), // 'generate_energy', 'invite_friend', 'stay_uptime', 'export_surplus'
  targetValue: real("target_value").notNull(),
  currentValue: real("current_value").default(0),
  status: varchar("status").default("incomplete"), // 'incomplete', 'complete'
  dateAssigned: timestamp("date_assigned").defaultNow(),
  completedAt: timestamp("completed_at")
});

// Relations
export const usersRelations = relations(users, ({ many, one }) => ({
  energyReadings: many(energyReadings),
  createdAlliances: many(solarAlliances),
  allianceMemberships: many(allianceMemberships),
  wallet: one(userWallets, {
    fields: [users.id],
    references: [userWallets.userId],
  }),
  referredUsers: many(users, {
    relationName: "referral",
  }),
  referrer: one(users, {
    fields: [users.referredBy],
    references: [users.id],
    relationName: "referral",
  }),
  tokenLedger: many(tokenLedger),
  milestones: many(userMilestones),
  uptimeRecords: many(uptimeTracker),
  notifications: many(notifications),
  createdProposals: many(allianceProposals),
  votes: many(allianceVotes),
  dailyMissions: many(dailyMissions),
}));

export const tokenLedgerRelations = relations(tokenLedger, ({ one }) => ({
  user: one(users, {
    fields: [tokenLedger.userId],
    references: [users.id],
  }),
}));

export const milestonesRelations = relations(milestones, ({ many }) => ({
  userMilestones: many(userMilestones),
}));

export const userMilestonesRelations = relations(userMilestones, ({ one }) => ({
  user: one(users, {
    fields: [userMilestones.userId],
    references: [users.id],
  }),
  milestone: one(milestones, {
    fields: [userMilestones.milestoneId],
    references: [milestones.id],
  }),
}));

export const uptimeTrackerRelations = relations(uptimeTracker, ({ one }) => ({
  user: one(users, {
    fields: [uptimeTracker.userId],
    references: [users.id],
  }),
}));

export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, {
    fields: [notifications.userId],
    references: [users.id],
  }),
}));

export const allianceProposalsRelations = relations(allianceProposals, ({ one, many }) => ({
  alliance: one(solarAlliances, {
    fields: [allianceProposals.allianceId],
    references: [solarAlliances.id],
  }),
  creator: one(users, {
    fields: [allianceProposals.createdBy],
    references: [users.id],
  }),
  votes: many(allianceVotes),
}));

export const allianceVotesRelations = relations(allianceVotes, ({ one }) => ({
  proposal: one(allianceProposals, {
    fields: [allianceVotes.proposalId],
    references: [allianceProposals.id],
  }),
  user: one(users, {
    fields: [allianceVotes.userId],
    references: [users.id],
  }),
}));

export const energyReadingsRelations = relations(energyReadings, ({ one }) => ({
  user: one(users, {
    fields: [energyReadings.userId],
    references: [users.id],
  }),
}));

export const solarAlliancesRelations = relations(solarAlliances, ({ one, many }) => ({
  creator: one(users, {
    fields: [solarAlliances.createdBy],
    references: [users.id],
  }),
  memberships: many(allianceMemberships),
}));

export const allianceMembershipsRelations = relations(allianceMemberships, ({ one }) => ({
  user: one(users, {
    fields: [allianceMemberships.userId],
    references: [users.id],
  }),
  alliance: one(solarAlliances, {
    fields: [allianceMemberships.allianceId],
    references: [solarAlliances.id],
  }),
}));

export const userWalletsRelations = relations(userWallets, ({ one }) => ({
  user: one(users, {
    fields: [userWallets.userId],
    references: [users.id],
  }),
}));

// Schema types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;

export const insertEnergyReadingSchema = createInsertSchema(energyReadings).omit({
  id: true,
  timestamp: true,
});

export const insertSolarAllianceSchema = createInsertSchema(solarAlliances).omit({
  id: true,
  memberCount: true,
  totalSurplus: true,
  createdAt: true,
});

export const insertAllianceMembershipSchema = createInsertSchema(allianceMemberships).omit({
  id: true,
  joinedAt: true,
  isActive: true,
});

export const insertTokenLedgerSchema = createInsertSchema(tokenLedger).omit({
  id: true,
  createdAt: true,
});

export const insertMilestoneSchema = createInsertSchema(milestones).omit({
  id: true,
  createdAt: true,
});

export const insertUserMilestoneSchema = createInsertSchema(userMilestones).omit({
  id: true,
  unlockedAt: true,
});

export const insertUptimeTrackerSchema = createInsertSchema(uptimeTracker).omit({
  id: true,
  createdAt: true,
});

export const insertNotificationSchema = createInsertSchema(notifications).omit({
  id: true,
  createdAt: true,
});

export const insertAllianceProposalSchema = createInsertSchema(allianceProposals).omit({
  id: true,
  votesYes: true,
  votesNo: true,
  votesAbstain: true,
  createdAt: true,
});

export const insertAllianceVoteSchema = createInsertSchema(allianceVotes).omit({
  id: true,
  createdAt: true,
});

export const insertDailyMissionSchema = createInsertSchema(dailyMissions).omit({
  id: true,
  dateAssigned: true,
  completedAt: true,
});

export type InsertEnergyReading = z.infer<typeof insertEnergyReadingSchema>;
export type EnergyReading = typeof energyReadings.$inferSelect;
export type SolarAlliance = typeof solarAlliances.$inferSelect;
export type AllianceMembership = typeof allianceMemberships.$inferSelect;
export type UserWallet = typeof userWallets.$inferSelect;
export type TokenLedgerEntry = typeof tokenLedger.$inferSelect;
export type Milestone = typeof milestones.$inferSelect;
export type UserMilestone = typeof userMilestones.$inferSelect;
export type UptimeRecord = typeof uptimeTracker.$inferSelect;
export type Notification = typeof notifications.$inferSelect;
export type AllianceProposal = typeof allianceProposals.$inferSelect;
export type AllianceVote = typeof allianceVotes.$inferSelect;
export type DailyMission = typeof dailyMissions.$inferSelect;
export type InsertDailyMission = z.infer<typeof insertDailyMissionSchema>;
export type InsertSolarAlliance = z.infer<typeof insertSolarAllianceSchema>;
export type InsertAllianceMembership = z.infer<typeof insertAllianceMembershipSchema>;
export type InsertTokenLedgerEntry = z.infer<typeof insertTokenLedgerSchema>;
export type InsertMilestone = z.infer<typeof insertMilestoneSchema>;
export type InsertUserMilestone = z.infer<typeof insertUserMilestoneSchema>;
export type InsertUptimeRecord = z.infer<typeof insertUptimeTrackerSchema>;
export type InsertNotification = z.infer<typeof insertNotificationSchema>;
export type InsertAllianceProposal = z.infer<typeof insertAllianceProposalSchema>;
export type InsertAllianceVote = z.infer<typeof insertAllianceVoteSchema>;

export const dailyMissionsRelations = relations(dailyMissions, ({ one }) => ({
  user: one(users, {
    fields: [dailyMissions.userId],
    references: [users.id],
  }),
}));
