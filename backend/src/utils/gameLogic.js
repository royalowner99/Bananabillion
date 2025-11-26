const gameConfig = require('../config/game');

// Calculate upgrade price
function calculateUpgradePrice(upgradeId, currentLevel) {
  const upgrade = gameConfig.UPGRADES[upgradeId];
  if (!upgrade) return null;
  
  if (currentLevel >= upgrade.maxLevel) return null;
  
  return Math.floor(upgrade.basePrice * Math.pow(upgrade.priceMultiplier, currentLevel));
}

// Apply upgrade effect
function applyUpgradeEffect(upgradeId, level) {
  const upgrade = gameConfig.UPGRADES[upgradeId];
  if (!upgrade) return 0;
  
  return upgrade.effect(level);
}

// Calculate user stats from upgrades
function calculateUserStats(user) {
  const stats = {
    tapPower: gameConfig.BASE_TAP_POWER + applyUpgradeEffect('tapPower', user.upgrades.tapPower),
    maxEnergy: gameConfig.BASE_MAX_ENERGY + applyUpgradeEffect('maxEnergy', user.upgrades.maxEnergy),
    energyRegenRate: gameConfig.BASE_ENERGY_REGEN + applyUpgradeEffect('energyRegen', user.upgrades.energyRegen),
    criticalChance: gameConfig.BASE_CRITICAL_CHANCE + applyUpgradeEffect('criticalChance', user.upgrades.criticalChance),
    comboMultiplier: gameConfig.BASE_COMBO_MULTIPLIER + applyUpgradeEffect('comboMultiplier', user.upgrades.comboMultiplier),
    autoMinerRate: gameConfig.BASE_AUTO_MINER_RATE + applyUpgradeEffect('autoMiner', user.upgrades.autoMiner),
    streakBoost: applyUpgradeEffect('streakBoost', user.upgrades.streakBoost),
    offlineEarnings: applyUpgradeEffect('offlineEarnings', user.upgrades.offlineEarnings)
  };
  
  return stats;
}

// Regenerate energy
function regenerateEnergy(user) {
  const now = Date.now();
  const lastUpdate = user.lastEnergyUpdate.getTime();
  const timeDiff = (now - lastUpdate) / 1000; // seconds
  
  const stats = calculateUserStats(user);
  const energyToAdd = timeDiff * stats.energyRegenRate;
  
  user.energy = Math.min(user.energy + energyToAdd, stats.maxEnergy);
  user.lastEnergyUpdate = new Date(now);
  
  return user;
}

// Calculate tap reward
function calculateTapReward(user, tapCount, timestamps) {
  const stats = calculateUserStats(user);
  let totalReward = 0;
  let comboCount = 0;
  let criticalHits = 0;
  
  // Validate timestamps
  const now = Date.now();
  for (let i = 0; i < timestamps.length; i++) {
    const timestamp = timestamps[i];
    
    // Check if timestamp is within tolerance
    if (Math.abs(now - timestamp) > gameConfig.TIMESTAMP_TOLERANCE_MS) {
      return { error: 'Invalid timestamp detected' };
    }
    
    // Check for duplicate timestamps (bot behavior)
    if (i > 0 && timestamp === timestamps[i - 1]) {
      return { error: 'Duplicate timestamps detected' };
    }
  }
  
  // Check tap rate
  if (timestamps.length > 1) {
    const duration = (timestamps[timestamps.length - 1] - timestamps[0]) / 1000;
    const tapsPerSecond = timestamps.length / duration;
    
    if (tapsPerSecond > gameConfig.MAX_TAPS_PER_SECOND) {
      return { error: 'Tap rate too high' };
    }
  }
  
  // Calculate rewards for each tap
  for (let i = 0; i < tapCount; i++) {
    if (user.energy < 1) break;
    
    let reward = stats.tapPower;
    
    // Check for combo
    if (i > 0) {
      const timeDiff = timestamps[i] - timestamps[i - 1];
      if (timeDiff < gameConfig.COMBO_TIMEOUT_MS) {
        comboCount++;
        reward *= (1 + stats.comboMultiplier * Math.min(comboCount, 10) / 10);
      } else {
        comboCount = 0;
      }
    }
    
    // Check for critical hit
    if (Math.random() < stats.criticalChance) {
      const critMultiplier = gameConfig.CRITICAL_MULTIPLIER_MIN + 
        Math.random() * (gameConfig.CRITICAL_MULTIPLIER_MAX - gameConfig.CRITICAL_MULTIPLIER_MIN);
      reward *= critMultiplier;
      criticalHits++;
    }
    
    totalReward += Math.floor(reward);
    user.energy -= 1;
  }
  
  return {
    reward: totalReward,
    energy: user.energy,
    criticalHits,
    maxCombo: comboCount
  };
}

// Calculate auto-miner earnings
function calculateAutoMinerEarnings(user) {
  const now = Date.now();
  const lastClaim = user.lastAutoMinerClaim.getTime();
  const timeDiff = (now - lastClaim) / 1000 / 60; // minutes
  
  const stats = calculateUserStats(user);
  
  if (stats.autoMinerRate === 0) return 0;
  
  const earnings = Math.floor(timeDiff * stats.autoMinerRate);
  return earnings;
}

// Calculate offline earnings
function calculateOfflineEarnings(user) {
  const now = Date.now();
  const lastActive = user.lastActive.getTime();
  const timeDiff = (now - lastActive) / 1000 / 60; // minutes
  
  // Only calculate if user was offline for more than 5 minutes
  if (timeDiff < 5) return 0;
  
  const stats = calculateUserStats(user);
  
  if (stats.autoMinerRate === 0 || stats.offlineEarnings === 0) return 0;
  
  // Offline earnings is a percentage of auto-miner rate
  const offlineRate = stats.autoMinerRate * stats.offlineEarnings;
  const maxOfflineMinutes = 480; // 8 hours max
  const actualMinutes = Math.min(timeDiff, maxOfflineMinutes);
  
  const earnings = Math.floor(actualMinutes * offlineRate);
  return earnings;
}

// Check daily reward eligibility
function checkDailyReward(user) {
  const now = new Date();
  const lastClaim = user.lastDailyClaim;
  
  if (!lastClaim) {
    return { eligible: true, streak: 1 };
  }
  
  const hoursSinceLastClaim = (now - lastClaim) / 1000 / 60 / 60;
  
  // Must wait 24 hours
  if (hoursSinceLastClaim < 24) {
    return { eligible: false, hoursRemaining: 24 - hoursSinceLastClaim };
  }
  
  // Check if streak continues (claimed within 48 hours)
  if (hoursSinceLastClaim < 48) {
    const newStreak = user.dailyStreak + 1;
    return { eligible: true, streak: newStreak > 7 ? 1 : newStreak };
  }
  
  // Streak broken
  return { eligible: true, streak: 1 };
}

// Calculate daily reward amount
function calculateDailyReward(streak, user) {
  const stats = calculateUserStats(user);
  const baseReward = gameConfig.DAILY_REWARDS[streak - 1]?.coins || 100;
  const boostedReward = Math.floor(baseReward * (1 + stats.streakBoost));
  
  return boostedReward;
}

module.exports = {
  calculateUpgradePrice,
  applyUpgradeEffect,
  calculateUserStats,
  regenerateEnergy,
  calculateTapReward,
  calculateAutoMinerEarnings,
  calculateOfflineEarnings,
  checkDailyReward,
  calculateDailyReward
};
