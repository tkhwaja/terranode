import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { 
  insertEnergyReadingSchema, 
  insertSolarAllianceSchema, 
  insertAllianceMembershipSchema,
  insertTokenLedgerSchema,
  insertMilestoneSchema,
  insertUserMilestoneSchema,
  insertUptimeTrackerSchema,
  insertNotificationSchema,
  insertAllianceProposalSchema,
  insertAllianceVoteSchema
} from "@shared/schema";
import { z } from "zod";
import { dataGenerator } from "./services/dataGenerator";
import { testTokenUpdate } from "./testTokenUpdate";
import { demoSeeder } from "./services/demoSeeder";
import { autoSeeder } from "./services/autoSeeder";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Start data generator and auto seeder
  await dataGenerator.start();
  autoSeeder.start();

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      // Add user to data generation and auto seeder if not already added
      if (user) {
        await dataGenerator.addUser(userId);
        autoSeeder.addUser(userId);
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

  // Demo Data Seeder route
  app.post('/api/seed-demo-data', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { days = 7, hoursPerDay = 24 } = req.body;
      
      const result = await demoSeeder.seedDemoData({
        userId,
        days: Math.min(days, 30), // Limit to 30 days max
        hoursPerDay: Math.min(hoursPerDay, 24) // Limit to 24 hours max
      });
      
      // Broadcast updated balance via WebSocket
      const userWallet = await storage.getUserWallet(userId);
      if (userWallet && userConnections.has(userId)) {
        const userWs = userConnections.get(userId);
        if (userWs && userWs.readyState === WebSocket.OPEN) {
          userWs.send(JSON.stringify({
            type: 'balance_update',
            balance: userWallet.wattBalance,
            earned: result.totalTokensEarned,
            timestamp: new Date().toISOString()
          }));
        }
      }
      
      res.json({
        message: "Demo data seeded successfully",
        ...result
      });
    } catch (error) {
      console.error("Error seeding demo data:", error);
      res.status(500).json({ message: "Failed to seed demo data" });
    }
  });

  // Auto Seeder control routes
  app.get('/api/auto-seeder/status', isAuthenticated, async (req: any, res) => {
    try {
      const stats = autoSeeder.getStats();
      res.json(stats);
    } catch (error) {
      console.error("Error getting auto seeder status:", error);
      res.status(500).json({ message: "Failed to get auto seeder status" });
    }
  });

  app.post('/api/auto-seeder/toggle', isAuthenticated, async (req: any, res) => {
    try {
      const { enabled } = req.body;
      autoSeeder.updateConfig({ enabled });
      const stats = autoSeeder.getStats();
      res.json({ message: enabled ? "Auto seeder enabled" : "Auto seeder disabled", stats });
    } catch (error) {
      console.error("Error toggling auto seeder:", error);
      res.status(500).json({ message: "Failed to toggle auto seeder" });
    }
  });

  // Test token update route
  app.post('/api/test/token-update', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const result = await testTokenUpdate(userId);
      res.json(result);
    } catch (error) {
      console.error("Error testing token update:", error);
      res.status(500).json({ message: "Failed to test token update" });
    }
  });

  // User profile routes
  app.put('/api/user/profile', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { location, inverterBrand, profileVisibility } = req.body;
      
      const updatedUser = await storage.updateUserProfile(userId, {
        location,
        inverterBrand,
        profileVisibility,
      });
      
      res.json(updatedUser);
    } catch (error) {
      console.error("Error updating user profile:", error);
      res.status(500).json({ message: "Failed to update user profile" });
    }
  });

  // Token ledger routes
  app.get('/api/tokens/ledger', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const limit = req.query.limit ? parseInt(req.query.limit) : 50;
      const ledger = await storage.getUserTokenLedger(userId, limit);
      res.json(ledger);
    } catch (error) {
      console.error("Error fetching token ledger:", error);
      res.status(500).json({ message: "Failed to fetch token ledger" });
    }
  });

  // Milestone routes
  app.get('/api/milestones', isAuthenticated, async (req: any, res) => {
    try {
      const milestones = await storage.getMilestones();
      res.json(milestones);
    } catch (error) {
      console.error("Error fetching milestones:", error);
      res.status(500).json({ message: "Failed to fetch milestones" });
    }
  });

  app.get('/api/milestones/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const userMilestones = await storage.getUserMilestones(userId);
      res.json(userMilestones);
    } catch (error) {
      console.error("Error fetching user milestones:", error);
      res.status(500).json({ message: "Failed to fetch user milestones" });
    }
  });

  app.post('/api/milestones/:id/unlock', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const milestoneId = parseInt(req.params.id);
      
      const unlockedMilestone = await storage.unlockMilestone(userId, milestoneId);
      
      // Create notification for unlocked milestone
      await storage.createNotification({
        userId,
        type: 'milestone_unlocked',
        title: 'Milestone Unlocked!',
        message: `You've unlocked a new milestone!`,
      });
      
      res.json(unlockedMilestone);
    } catch (error) {
      console.error("Error unlocking milestone:", error);
      res.status(500).json({ message: "Failed to unlock milestone" });
    }
  });

  // Uptime tracking routes
  app.get('/api/uptime/stats', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const days = req.query.days ? parseInt(req.query.days) : 30;
      const uptimeStats = await storage.getUserUptimeStats(userId, days);
      res.json(uptimeStats);
    } catch (error) {
      console.error("Error fetching uptime stats:", error);
      res.status(500).json({ message: "Failed to fetch uptime stats" });
    }
  });

  app.post('/api/uptime/record', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { date, uptimeMinutes, isActive } = req.body;
      
      const record = await storage.recordUptime({
        userId,
        date,
        uptimeMinutes,
        isActive,
      });
      
      res.json(record);
    } catch (error) {
      console.error("Error recording uptime:", error);
      res.status(500).json({ message: "Failed to record uptime" });
    }
  });

  // Notification routes
  app.get('/api/notifications', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const limit = req.query.limit ? parseInt(req.query.limit) : 20;
      const notifications = await storage.getUserNotifications(userId, limit);
      res.json(notifications);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      res.status(500).json({ message: "Failed to fetch notifications" });
    }
  });

  app.post('/api/notifications/:id/read', isAuthenticated, async (req: any, res) => {
    try {
      const notificationId = parseInt(req.params.id);
      await storage.markNotificationAsRead(notificationId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error marking notification as read:", error);
      res.status(500).json({ message: "Failed to mark notification as read" });
    }
  });

  // Alliance governance routes
  app.get('/api/alliances/:id/proposals', isAuthenticated, async (req: any, res) => {
    try {
      const allianceId = parseInt(req.params.id);
      const proposals = await storage.getAllianceProposals(allianceId);
      res.json(proposals);
    } catch (error) {
      console.error("Error fetching alliance proposals:", error);
      res.status(500).json({ message: "Failed to fetch alliance proposals" });
    }
  });

  app.post('/api/alliances/:id/proposals', isAuthenticated, async (req: any, res) => {
    try {
      const allianceId = parseInt(req.params.id);
      const userId = req.user.claims.sub;
      const { title, description, type, endsAt } = req.body;
      
      const proposal = await storage.createProposal({
        allianceId,
        createdBy: userId,
        title,
        description,
        type,
        endsAt: endsAt ? new Date(endsAt) : undefined,
      });
      
      res.json(proposal);
    } catch (error) {
      console.error("Error creating alliance proposal:", error);
      res.status(500).json({ message: "Failed to create alliance proposal" });
    }
  });

  app.post('/api/proposals/:id/vote', isAuthenticated, async (req: any, res) => {
    try {
      const proposalId = parseInt(req.params.id);
      const userId = req.user.claims.sub;
      const { vote } = req.body;
      
      const voteRecord = await storage.voteOnProposal({
        proposalId,
        userId,
        vote,
      });
      
      res.json(voteRecord);
    } catch (error) {
      console.error("Error voting on proposal:", error);
      res.status(500).json({ message: "Failed to vote on proposal" });
    }
  });

  app.get('/api/proposals/:id/votes', isAuthenticated, async (req: any, res) => {
    try {
      const proposalId = parseInt(req.params.id);
      const votes = await storage.getProposalVotes(proposalId);
      res.json(votes);
    } catch (error) {
      console.error("Error fetching proposal votes:", error);
      res.status(500).json({ message: "Failed to fetch proposal votes" });
    }
  });

  const httpServer = createServer(app);
  
  // WebSocket server for real-time WATT token updates
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  
  // Store user WebSocket connections
  const userConnections = new Map<string, WebSocket>();
  
  wss.on('connection', (ws, req) => {
    console.log('WebSocket connection established');
    
    ws.on('message', (data) => {
      try {
        const message = JSON.parse(data.toString());
        if (message.type === 'subscribe' && message.userId) {
          userConnections.set(message.userId, ws);
          console.log(`User ${message.userId} subscribed to WATT ticker updates`);
          
          // Send current balance immediately
          storage.getUserWallet(message.userId).then(wallet => {
            ws.send(JSON.stringify({
              type: 'balance_update',
              balance: wallet.wattBalance,
              timestamp: new Date().toISOString()
            }));
          }).catch(err => {
            console.error('Error fetching initial wallet balance:', err);
          });
        }
      } catch (error) {
        console.error('WebSocket message error:', error);
      }
    });
    
    ws.on('close', () => {
      // Remove user connection when they disconnect
      for (const [userId, connection] of userConnections.entries()) {
        if (connection === ws) {
          userConnections.delete(userId);
          console.log(`User ${userId} disconnected from WATT ticker`);
          break;
        }
      }
    });
    
    ws.on('error', (error) => {
      console.error('WebSocket error:', error);
    });
  });
  
  // Function to broadcast balance updates to specific user
  const broadcastBalanceUpdate = (userId: string, newBalance: number, earned: number = 0) => {
    const connection = userConnections.get(userId);
    if (connection && connection.readyState === WebSocket.OPEN) {
      connection.send(JSON.stringify({
        type: 'balance_update',
        balance: newBalance,
        earned: earned,
        timestamp: new Date().toISOString()
      }));
      console.log(`Broadcasted balance update to user ${userId}: ${newBalance} WATT`);
    }
  };
  
  // Make broadcastBalanceUpdate available globally
  (global as any).broadcastBalanceUpdate = broadcastBalanceUpdate;
  
  return httpServer;
}
