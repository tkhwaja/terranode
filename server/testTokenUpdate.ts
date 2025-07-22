// Test script to simulate token updates for testing the live ticker
import { storage } from "./storage";

export async function testTokenUpdate(userId: string) {
  try {
    console.log(`Testing token update for user: ${userId}`);
    
    // Get current wallet
    const currentWallet = await storage.getUserWallet(userId);
    console.log(`Current balance: ${currentWallet?.wattBalance || 0} WATT`);
    
    // Add some test tokens (simulate earning from surplus energy)
    const testEarnings = Math.random() * 5 + 1; // 1-6 WATT tokens
    await storage.updateUserTokenBalance(userId, testEarnings);
    
    const newBalance = (currentWallet?.wattBalance || 0) + testEarnings;
    
    // Broadcast the update via WebSocket
    const broadcastBalanceUpdate = (global as any).broadcastBalanceUpdate;
    if (broadcastBalanceUpdate) {
      broadcastBalanceUpdate(userId, newBalance, testEarnings);
      console.log(`✅ Broadcasted test update: +${testEarnings.toFixed(2)} WATT, new balance: ${newBalance.toFixed(2)}`);
    } else {
      console.log('❌ Broadcast function not available');
    }
    
    // Also create a fake surplus log entry for testing
    await storage.createSurplusLog({
      userId,
      amount: testEarnings / 0.75, // Reverse calculate surplus amount
      wattTokensEarned: testEarnings,
    });
    
    return { 
      success: true, 
      earnings: testEarnings, 
      newBalance: newBalance,
      message: `Test successful: +${testEarnings.toFixed(2)} WATT tokens earned`
    };
    
  } catch (error) {
    console.error('Test token update failed:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}