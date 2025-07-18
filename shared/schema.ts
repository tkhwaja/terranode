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
  referredBy: varchar("referred_by").references(() => users.id),
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

export type InsertEnergyReading = z.infer<typeof insertEnergyReadingSchema>;
export type EnergyReading = typeof energyReadings.$inferSelect;
export type SolarAlliance = typeof solarAlliances.$inferSelect;
export type AllianceMembership = typeof allianceMemberships.$inferSelect;
export type UserWallet = typeof userWallets.$inferSelect;
export type InsertSolarAlliance = z.infer<typeof insertSolarAllianceSchema>;
export type InsertAllianceMembership = z.infer<typeof insertAllianceMembershipSchema>;
