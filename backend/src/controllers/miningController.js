const UserBBN = require('../models/UserBBN');

// Tap/Mine BBN
exports.tap = async (req, res) => {
  try {
    const { taps = 1 } = req.body;
    const userId = req.userId;
    
    if (taps < 1 || taps > 50) {
      return res.status(400).json({ error: 'Invalid tap count' });
    }
    
    const user = await UserBBN.findOne({ userId });
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Check if user can mine (daily limit)
    if (!user.canMine()) {
      return res.status(400).json({
        error: 'Daily mining limit reached',
        dailyMined: user.dailyMined,
        dailyLimit: user.dailyMiningLimit,
        resetTime: getNextResetTime()
      });
    }
    
    // Update energy
    updateEnergy(user);
    
    // Check if enough energy
    const energyNeeded = taps * user.tapPower;
    if (user.energy < energyNeeded) {
      return res.status(400).json({
        error: 'Not enough energy',
        energy: user.energy,
        needed: energyNeeded
      });
    }
    
    // Anti-cheat: Check taps per second
    const now = Date.now();
    if (user.lastTapTimestamp) {
      const timeDiff = (now - user.lastTapTimestamp) / 1000;
      const tapsPerSecond = taps / timeDiff;
      
      if (tapsPerSecond > 15) { // Max 15 taps/second
        user.suspiciousActivity += 1;
        
        if (user.suspiciousActivity > 10) {
          user.isBanned = true;
          user.banReason = 'Suspicious tapping activity detected';
          await user.save();
          return res.status(403).json({ error: 'Account banned for suspicious activity' });
        }
      }
    }
    
    user.lastTapTimestamp = now;
    
    // Get active multipliers
    const multipliers = user.getActiveMultipliers();
    
    // Calculate BBN earned
    let bbnEarned = taps * user.tapPower * multipliers.tapMultiplier;
    
    // Apply mining speed bonus
    if (user.miningSpeedBonus > 0) {
      bbnEarned *= (1 + user.miningSpeedBonus / 100);
    }
    
    bbnEarned = Math.floor(bbnEarned);
    
    // Check daily limit
    const remainingDaily = user.dailyMiningLimit - user.dailyMined;
    if (bbnEarned > remainingDaily) {
      bbnEarned = remainingDaily;
    }
    
    // Update user stats
    user.balance += bbnEarned;
    user.totalEarned += bbnEarned;
    user.dailyMined += bbnEarned;
    user.totalTaps += taps;
    user.energy -= energyNeeded;
    
    // Add XP (1 tap = 1 XP)
    const xpEarned = user.addXP(taps);
    
    // Check for level up
    const levelRewards = user.checkLevelRewards();
    
    // Give level rewards
    if (levelRewards.length > 0) {
      levelRewards.forEach(reward => {
        user.balance += reward.reward;
        user.totalEarned += reward.reward;
      });
    }
    
    user.lastActive = new Date();
    await user.save();
    
    res.json({
      success: true,
      bbnEarned,
      xpEarned,
      levelRewards,
      user: {
        balance: user.balance,
        energy: user.energy,
        maxEnergy: user.maxEnergy,
        level: user.level,
        xp: user.xp,
        xpForNextLevel: user.xpForNextLevel(),
        dailyMined: user.dailyMined,
        dailyLimit: user.dailyMiningLimit,
        totalTaps: user.totalTaps
      }
    });
    
  } catch (error) {
    console.error('Tap error:', error);
    res.status(500).json({ error: 'Mining failed' });
  }
};

// Get Mining Stats
exports.getMiningStats = async (req, res) => {
  try {
    const user = await UserBBN.findOne({ userId: req.userId });
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Update energy
    updateEnergy(user);
    await user.save();
    
    // Check if can mine
    const canMine = user.canMine();
    const multipliers = user.getActiveMultipliers();
    
    res.json({
      balance: user.balance,
      totalEarned: user.totalEarned,
      energy: user.energy,
      maxEnergy: user.maxEnergy,
      energyRegen: user.energyRegen,
      energyRegenSpeed: user.energyRegenSpeed,
      tapPower: user.tapPower,
      miningSpeedBonus: user.miningSpeedBonus,
      dailyMined: user.dailyMined,
      dailyLimit: user.dailyMiningLimit,
      canMine,
      resetTime: getNextResetTime(),
      multipliers,
      level: user.level,
      xp: user.xp,
      xpForNextLevel: user.xpForNextLevel(),
      totalTaps: user.totalTaps,
      vipActive: user.isVIPActive(),
      autoMinerActive: user.autoMinerActive,
      autoMinerRate: user.autoMinerRate
    });
    
  } catch (error) {
    console.error('Get mining stats error:', error);
    res.status(500).json({ error: 'Failed to get stats' });
  }
};

// Claim Auto-Miner Earnings
exports.claimAutoMiner = async (req, res) => {
  try {
    const user = await UserBBN.findOne({ userId: req.userId });
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    if (!user.autoMinerActive || !user.isVIPActive()) {
      return res.status(400).json({ error: 'Auto-miner not active' });
    }
    
    // Calculate earnings since last claim
    const now = Date.now();
    const lastClaim = user.lastAutoMineTime.getTime();
    const secondsElapsed = (now - lastClaim) / 1000;
    
    // Max 8 hours of offline earnings
    const maxSeconds = 8 * 60 * 60;
    const claimableSeconds = Math.min(secondsElapsed, maxSeconds);
    
    let earnings = Math.floor(claimableSeconds * user.autoMinerRate);
    
    // Check daily limit
    if (!user.canMine()) {
      return res.status(400).json({
        error: 'Daily mining limit reached',
        dailyMined: user.dailyMined,
        dailyLimit: user.dailyMiningLimit
      });
    }
    
    const remainingDaily = user.dailyMiningLimit - user.dailyMined;
    if (earnings > remainingDaily) {
      earnings = remainingDaily;
    }
    
    user.balance += earnings;
    user.totalEarned += earnings;
    user.dailyMined += earnings;
    user.lastAutoMineTime = new Date();
    
    await user.save();
    
    res.json({
      success: true,
      earnings,
      secondsClaimed: claimableSeconds,
      newBalance: user.balance,
      dailyMined: user.dailyMined
    });
    
  } catch (error) {
    console.error('Claim auto-miner error:', error);
    res.status(500).json({ error: 'Failed to claim earnings' });
  }
};

// Helper: Update Energy
function updateEnergy(user) {
  const now = Date.now();
  const lastUpdate = user.lastEnergyUpdate.getTime();
  const secondsElapsed = (now - lastUpdate) / 1000;
  
  // Calculate energy regenerated
  const regenIntervals = Math.floor(secondsElapsed / user.energyRegenSpeed);
  const energyRegened = regenIntervals * user.energyRegen;
  
  if (energyRegened > 0) {
    user.energy = Math.min(user.energy + energyRegened, user.maxEnergy);
    user.lastEnergyUpdate = new Date(lastUpdate + (regenIntervals * user.energyRegenSpeed * 1000));
  }
}

// Helper: Get Next Reset Time
function getNextResetTime() {
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);
  return tomorrow;
}

// Daily Bonus
exports.claimDailyBonus = async (req, res) => {
  try {
    const user = await UserBBN.findOne({ userId: req.userId });
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    if (user.dailyBonusClaimed) {
      return res.status(400).json({ error: 'Daily bonus already claimed today' });
    }
    
    const bonus = 50; // +50 BBN for opening bot
    user.balance += bonus;
    user.totalEarned += bonus;
    user.dailyBonusClaimed = true;
    
    // Update streak
    const now = new Date();
    const lastLogin = user.lastDailyLogin;
    
    if (lastLogin) {
      const daysDiff = Math.floor((now - lastLogin) / (1000 * 60 * 60 * 24));
      
      if (daysDiff === 1) {
        // Consecutive day
        user.dailyStreak += 1;
      } else if (daysDiff > 1) {
        // Streak broken
        user.dailyStreak = 1;
      }
    } else {
      user.dailyStreak = 1;
    }
    
    user.lastDailyLogin = now;
    
    await user.save();
    
    res.json({
      success: true,
      bonus,
      streak: user.dailyStreak,
      newBalance: user.balance
    });
    
  } catch (error) {
    console.error('Claim daily bonus error:', error);
    res.status(500).json({ error: 'Failed to claim bonus' });
  }
};

// Claim Streak Reward
exports.claimStreakReward = async (req, res) => {
  try {
    const { day } = req.body;
    const user = await UserBBN.findOne({ userId: req.userId });
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    if (user.dailyStreak < day) {
      return res.status(400).json({ error: 'Streak requirement not met' });
    }
    
    if (user.streakRewardsClaimed.includes(day)) {
      return res.status(400).json({ error: 'Reward already claimed' });
    }
    
    // Streak rewards
    const streakRewards = {
      1: 20,
      3: 100,
      7: 300,
      14: 800,
      30: 5000
    };
    
    const reward = streakRewards[day];
    
    if (!reward) {
      return res.status(400).json({ error: 'Invalid streak day' });
    }
    
    user.balance += reward;
    user.totalEarned += reward;
    user.streakRewardsClaimed.push(day);
    
    // Day 30 bonus: 1 day VIP
    if (day === 30) {
      const vipExpiry = user.vipExpiry && new Date(user.vipExpiry) > new Date() 
        ? new Date(user.vipExpiry) 
        : new Date();
      user.vipExpiry = new Date(vipExpiry.getTime() + 24 * 60 * 60 * 1000);
      user.isVIP = true;
    }
    
    await user.save();
    
    res.json({
      success: true,
      reward,
      day,
      newBalance: user.balance,
      vipBonus: day === 30
    });
    
  } catch (error) {
    console.error('Claim streak reward error:', error);
    res.status(500).json({ error: 'Failed to claim reward' });
  }
};
