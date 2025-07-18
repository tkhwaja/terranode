import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { insertEnergyReadingSchema, insertSolarAllianceSchema, insertAllianceMembershipSchema } from "@shared/schema";
import { z } from "zod";
import { dataGenerator } from "./services/dataGenerator";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Start data generator
  await dataGenerator.start();

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      // Add user to data generation if not already added
      if (user) {
        await dataGenerator.addUser(userId);
      }
      
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Energy routes
  app.post('/api/energy/reading', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const validatedData = insertEnergyReadingSchema.parse({
        ...req.body,
        userId,
      });
      
      const reading = await storage.createEnergyReading(validatedData);
      res.json(reading);
    } catch (error) {
      console.error("Error creating energy reading:", error);
      res.status(500).json({ message: "Failed to create energy reading" });
    }
  });

  app.get('/api/energy/readings', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const limit = req.query.limit ? parseInt(req.query.limit) : 24;
      const readings = await storage.getUserEnergyReadings(userId, limit);
      res.json(readings);
    } catch (error) {
      console.error("Error fetching energy readings:", error);
      res.status(500).json({ message: "Failed to fetch energy readings" });
    }
  });

  app.get('/api/energy/latest', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const reading = await storage.getLatestEnergyReading(userId);
      if (!reading) {
        return res.json({ 
          solarGenerated: 0,
          energyConsumed: 0,
          surplusExported: 0,
          wattTokensEarned: 0
        });
      }
      res.json(reading);
    } catch (error) {
      console.error("Error fetching latest energy reading:", error);
      res.status(500).json({ message: "Failed to fetch latest energy reading" });
    }
  });

  // Wallet routes
  app.get('/api/wallet', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const wallet = await storage.getUserWallet(userId);
      if (!wallet) {
        return res.json({
          wattBalance: 0,
          lifetimeEarnings: 0,
          todaysEarnings: 0
        });
      }
      res.json(wallet);
    } catch (error) {
      console.error("Error fetching wallet:", error);
      res.status(500).json({ message: "Failed to fetch wallet" });
    }
  });

  // Alliance routes
  app.post('/api/alliances', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const validatedData = insertSolarAllianceSchema.parse({
        ...req.body,
        createdBy: userId,
      });
      
      const alliance = await storage.createAlliance(validatedData);
      res.json(alliance);
    } catch (error) {
      console.error("Error creating alliance:", error);
      res.status(500).json({ message: "Failed to create alliance" });
    }
  });

  app.get('/api/alliances', isAuthenticated, async (req: any, res) => {
    try {
      const alliances = await storage.getAlliances();
      res.json(alliances);
    } catch (error) {
      console.error("Error fetching alliances:", error);
      res.status(500).json({ message: "Failed to fetch alliances" });
    }
  });

  app.post('/api/alliances/:id/join', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const allianceId = parseInt(req.params.id);
      
      const membership = await storage.joinAlliance({
        userId,
        allianceId,
      });
      
      res.json(membership);
    } catch (error) {
      console.error("Error joining alliance:", error);
      res.status(500).json({ message: "Failed to join alliance" });
    }
  });

  app.get('/api/alliances/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const alliances = await storage.getUserAlliances(userId);
      res.json(alliances);
    } catch (error) {
      console.error("Error fetching user alliances:", error);
      res.status(500).json({ message: "Failed to fetch user alliances" });
    }
  });

  // Referral routes
  app.get('/api/referrals/stats', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const stats = await storage.getReferralStats(userId);
      res.json(stats);
    } catch (error) {
      console.error("Error fetching referral stats:", error);
      res.status(500).json({ message: "Failed to fetch referral stats" });
    }
  });

  app.get('/api/referrals/leaderboard', isAuthenticated, async (req: any, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit) : 10;
      const leaderboard = await storage.getReferralLeaderboard(limit);
      res.json(leaderboard);
    } catch (error) {
      console.error("Error fetching referral leaderboard:", error);
      res.status(500).json({ message: "Failed to fetch referral leaderboard" });
    }
  });

  // Demo data route for testing
  app.post('/api/energy/generate-demo', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      await dataGenerator.addUser(userId);
      res.json({ message: "Demo data generated successfully" });
    } catch (error) {
      console.error("Error generating demo data:", error);
      res.status(500).json({ message: "Failed to generate demo data" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
