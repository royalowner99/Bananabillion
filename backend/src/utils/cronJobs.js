const cron = require('node-cron');
const UserBBN = require('../models/UserBBN');

// Initialize all cron jobs
function initializeCronJobs() {
  console.log('🕐 Initializing cron jobs...');
  
  // Daily reset at midnight (00:00)
  cron.schedule('0 0 * * *', async () => {
    console.log('🔄 Running daily reset...');
    await dailyReset();
  });
  
  // Auto-miner processor (every 5 minutes)
  cron.schedule('*/5 * * * *', async () => {
    console.log('⛏️ Processing auto-miners...');
    await processAutoMiners();
  });
  
  // Cleanup expired boosters (every hour)
  cron.schedule('0 * * * *', async () => {
    console.log('🧹 Cleaning up expired boosters...');
    await cleanupExpiredBoosters();
  });
  
  // Check VIP expiry (every 6 hours)
  cron.schedule('0 */6 * * *', async () => {
    console.log('👑 Checking VIP expiries...');
    await checkVIPExpiry();
  });
  
  console.log('✅ Cron jobs initialized');
}

// Daily Reset
async function dailyReset() {
  try {
    const result = await UserBBN.updateMany(
      {},
      {
        $set: {
          dailyMined: 0,
          dailyBonusClaimed: false,
          adsWatchedToday: 0,
          wheelSpinsToday: 0,
          lastMiningReset: new Date()
        }
      }
    );
    
    console.log(`✅ Daily reset complete: ${result.modifiedCount} users updated`);
    
  } catch (error) {
    console.error('❌ Daily reset error:', error);
  }
}

// Process Auto-Miners
async function processAutoMiners() {
  try {
    const vipUsers = await UserBBN.find({
      isVIP: true,
      autoMinerActive: true,
      vipExpiry: { $gt: new Date() }
    });
    
    let processed = 0;
    
    for (const user of vipUsers) {
      // Calculate earnings since last claim
      const now = Date.now();
      const lastClaim = user.lastAutoMineTime.getTime();
      const secondsElapsed = (now - lastClaim) / 1000;
      
      // Only process if at least 5 minutes have passed
      if (secondsElapsed < 300) continue;
      
      // Max 8 hours of offline earnings
      const maxSeconds = 8 * 60 * 60;
      const claimableSeconds = Math.min(secondsElapsed, maxSeconds);
      
      let earnings = Math.floor(claimableSeconds * user.autoMinerRate);
      
      // Check daily limit
      const remainingDaily = user.dailyMiningLimit - user.dailyMined;
      if (earnings > remainingDaily) {
        earnings = remainingDaily;
      }
      
      if (earnings > 0) {
        user.balance += earnings;
        user.totalEarned += earnings;
        user.dailyMined += earnings;
        user.lastAutoMineTime = new Date();
        
        await user.save();
        processed++;
      }
    }
    
    if (processed > 0) {
      console.log(`✅ Auto-miner processed: ${processed} users`);
    }
    
  } catch (error) {
    console.error('❌ Auto-miner processing error:', error);
  }
}

// Cleanup Expired Boosters
async function cleanupExpiredBoosters() {
  try {
    const users = await UserBBN.find({
      'activeBoosters.0': { $exists: true }
    });
    
    let cleaned = 0;
    const now = new Date();
    
    for (const user of users) {
      const initialCount = user.activeBoosters.length;
      
      user.activeBoosters = user.activeBoosters.filter(booster => {
        return new Date(booster.expiresAt) > now;
      });
      
      if (user.activeBoosters.length < initialCount) {
        await user.save();
        cleaned++;
      }
    }
    
    if (cleaned > 0) {
      console.log(`✅ Cleaned expired boosters: ${cleaned} users`);
    }
    
  } catch (error) {
    console.error('❌ Cleanup boosters error:', error);
  }
}

// Check VIP Expiry
async function checkVIPExpiry() {
  try {
    const result = await UserBBN.updateMany(
      {
        isVIP: true,
        vipExpiry: { $lt: new Date() }
      },
      {
        $set: {
          isVIP: false,
          autoMinerActive: false,
          autoMinerRate: 0,
          xpMultiplier: 1
        }
      }
    );
    
    if (result.modifiedCount > 0) {
      console.log(`✅ VIP expired: ${result.modifiedCount} users`);
    }
    
  } catch (error) {
    console.error('❌ VIP expiry check error:', error);
  }
}

// Manual trigger functions (for testing)
async function triggerDailyReset() {
  console.log('🔄 Manual daily reset triggered');
  await dailyReset();
}

async function triggerAutoMinerProcess() {
  console.log('⛏️ Manual auto-miner process triggered');
  await processAutoMiners();
}

module.exports = {
  initializeCronJobs,
  triggerDailyReset,
  triggerAutoMinerProcess,
  dailyReset,
  processAutoMiners,
  cleanupExpiredBoosters,
  checkVIPExpiry
};
