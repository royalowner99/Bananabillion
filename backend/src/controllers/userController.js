const User = require('../models/User');
const { 
  calculateUserStats, 
  regenerateEnergy, 
  calculateTapReward,
  calculateUpgradePrice,
  checkDailyReward,
  calculateDailyReward,
  calculateAutoMinerEarnings
} = require('../utils/gameLogic');
const { 
  checkReferralActivation, 
  distributeReferralReward 
} = require('../utils/referralLogic');
const gameConfig = require('../config/game');

exports.getProfile = async (req, res) => {
  try {
    const user = await User.findOne({ userId: req.userId });
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Regenerate energy
    regenerateEnergy(user);
    
    // Calculate auto-miner earnings
    const autoMinerEarnings = calculateAutoMinerEarnings(user);
    if (autoMinerEarnings > 0) {
      user.balance += autoMinerEarnings;
      user.totalEarned += autoMinerEarnings;
      user.lastAutoMinerClaim = new Date();
    }
    
    await user.save();
    
    const stats = calculateUserStats(user);
    
    res.json({
      userId: user.userId,
      username: user.username,
      balance: user.balance,
      totalEarned: user.totalEarned,
      energy: Math.floor(user.energy),
      maxEnergy: stats.maxEnergy,
      energyRegenRate: stats.energyRegenRate,
      tapPower: stats.tapPower,
      criticalChance: stats.criticalChance,
      comboMultiplier: stats.comboMultiplier,
      autoMinerRate: stats.autoMinerRate,
      upgrades: user.upgrades,
      referralCount: user.referralCount,
      referralEarnings: user.referralEarnings,
      dailyStreak: user.dailyStreak,
      totalTaps: user.totalTaps,
      tasksCompleted: user.tasksCompleted,
      autoMinerEarnings
    });
    
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.tap = async (req, res) => {
  try {
    const { tapCount, timestamps } = req.body;
    
    if (!tapCount || !timestamps || !Array.isArray(timestamps)) {
      return res.status(400).json({ error: 'Invalid tap data' });
    }
    
    if (tapCount !== timestamps.length) {
      return res.status(400).json({ error: 'Tap count mismatch' });
    }
    
    if (tapCount > gameConfig.MAX_TAP_BATCH_SIZE) {
      return res.status(400).json({ error: 'Too many taps in batch' });
    }
    
    const user = await User.findOne({ userId: req.userId });
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Regenerate energy first
    regenerateEnergy(user);
    
    // Calculate tap reward
    const result = calculateTapReward(user, tapCount, timestamps);
    
    if (result.error) {
      return res.status(400).json({ error: result.error });
    }
    
    // Update user
    user.balance += result.reward;
    user.totalEarned += result.reward;
    user.totalTaps += tapCount;
    user.lastTapTime = new Date();
    user.totalPlayTime += timestamps.length * 0.5; // Rough estimate
    
    await user.save();
    
    // Check referral activation
    await checkReferralActivation(user.userId);
    
    // Distribute referral reward
    if (result.reward > 0) {
      await distributeReferralReward(user.userId, result.reward);
    }
    
    res.json({
      balance: user.balance,
      energy: Math.floor(user.energy),
      reward: result.reward,
      criticalHits: result.criticalHits,
      maxCombo: result.maxCombo
    });
    
  } catch (error) {
    console.error('Tap error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.upgrade = async (req, res) => {
  try {
    const { upgradeId } = req.body;
    
    if (!upgradeId || !gameConfig.UPGRADES[upgradeId]) {
      return res.status(400).json({ error: 'Invalid upgrade' });
    }
    
    const user = await User.findOne({ userId: req.userId });
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const currentLevel = user.upgrades[upgradeId] || 0;
    const price = calculateUpgradePrice(upgradeId, currentLevel);
    
    if (!price) {
      return res.status(400).json({ error: 'Max level reached' });
    }
    
    if (user.balance < price) {
      return res.status(400).json({ error: 'Insufficient balance' });
    }
    
    // Purchase upgrade
    user.balance -= price;
    user.upgrades[upgradeId] = currentLevel + 1;
    
    // Recalculate stats
    const stats = calculateUserStats(user);
    user.tapPower = stats.tapPower;
    user.maxEnergy = stats.maxEnergy;
    user.energyRegenRate = stats.energyRegenRate;
    user.criticalChance = stats.criticalChance;
    user.comboMultiplier = stats.comboMultiplier;
    user.autoMinerRate = stats.autoMinerRate;
    
    await user.save();
    
    const nextPrice = calculateUpgradePrice(upgradeId, currentLevel + 1);
    
    res.json({
      balance: user.balance,
      upgrades: user.upgrades,
      newLevel: currentLevel + 1,
      nextPrice,
      stats
    });
    
  } catch (error) {
    console.error('Upgrade error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.claimDaily = async (req, res) => {
  try {
    const user = await User.findOne({ userId: req.userId });
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const dailyCheck = checkDailyReward(user);
    
    if (!dailyCheck.eligible) {
      return res.status(400).json({ 
        error: 'Daily reward not available yet',
        hoursRemaining: dailyCheck.hoursRemaining 
      });
    }
    
    const reward = calculateDailyReward(dailyCheck.streak, user);
    
    user.balance += reward;
    user.totalEarned += reward;
    user.dailyStreak = dailyCheck.streak;
    user.lastDailyClaim = new Date();
    
    await user.save();
    
    res.json({
      balance: user.balance,
      reward,
      streak: dailyCheck.streak,
      nextReward: calculateDailyReward(dailyCheck.streak === 7 ? 1 : dailyCheck.streak + 1, user)
    });
    
  } catch (error) {
    console.error('Daily claim error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.getUpgrades = async (req, res) => {
  try {
    const user = await User.findOne({ userId: req.userId });
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const upgrades = Object.keys(gameConfig.UPGRADES).map(key => {
      const upgrade = gameConfig.UPGRADES[key];
      const currentLevel = user.upgrades[key] || 0;
      const price = calculateUpgradePrice(key, currentLevel);
      
      return {
        id: key,
        name: upgrade.name,
        description: upgrade.description,
        currentLevel,
        maxLevel: upgrade.maxLevel,
        price,
        canAfford: price ? user.balance >= price : false,
        isMaxed: currentLevel >= upgrade.maxLevel
      };
    });
    
    res.json({ upgrades });
    
  } catch (error) {
    console.error('Get upgrades error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};
