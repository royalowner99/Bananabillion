module.exports = {
  // Base Stats - Balanced for engagement
  BASE_TAP_POWER: parseInt(process.env.BASE_TAP_POWER) || 1,
  BASE_MAX_ENERGY: parseInt(process.env.BASE_MAX_ENERGY) || 500,
  BASE_ENERGY_REGEN: parseFloat(process.env.BASE_ENERGY_REGEN) || 0.5,
  BASE_CRITICAL_CHANCE: parseFloat(process.env.CRITICAL_BASE_CHANCE) || 0.05,
  BASE_COMBO_MULTIPLIER: 1,
  BASE_AUTO_MINER_RATE: 0,
  
  // Anti-Cheat
  MAX_TAPS_PER_SECOND: parseInt(process.env.MAX_TAPS_PER_SECOND) || 15,
  COMBO_TIMEOUT_MS: parseInt(process.env.COMBO_TIMEOUT_MS) || 500,
  MAX_TAP_BATCH_SIZE: 50,
  TIMESTAMP_TOLERANCE_MS: 5000,
  
  // Upgrades
  UPGRADES: {
    tapPower: {
      id: 'tapPower',
      name: 'Tap Power',
      description: 'Increase coins per tap',
      basePrice: 100,
      priceMultiplier: 1.5,
      effect: (level) => level,
      maxLevel: 100
    },
    maxEnergy: {
      id: 'maxEnergy',
      name: 'Max Energy',
      description: 'Increase energy capacity',
      basePrice: 150,
      priceMultiplier: 1.6,
      effect: (level) => level * 50, // Reduced from 100 to 50
      maxLevel: 100
    },
    energyRegen: {
      id: 'energyRegen',
      name: 'Energy Regen',
      description: 'Faster energy recovery',
      basePrice: 200,
      priceMultiplier: 1.7,
      effect: (level) => level * 0.3, // Reduced from 0.5 to 0.3
      maxLevel: 100
    },
    criticalChance: {
      id: 'criticalChance',
      name: 'Critical Chance',
      description: 'Higher critical hit chance',
      basePrice: 500,
      priceMultiplier: 2,
      effect: (level) => level * 0.01,
      maxLevel: 50
    },
    comboMultiplier: {
      id: 'comboMultiplier',
      name: 'Combo Multiplier',
      description: 'Better combo rewards',
      basePrice: 300,
      priceMultiplier: 1.8,
      effect: (level) => level * 0.1,
      maxLevel: 50
    },
    autoMiner: {
      id: 'autoMiner',
      name: 'Auto Miner',
      description: 'Passive income per minute',
      basePrice: 1000,
      priceMultiplier: 2.5,
      effect: (level) => level * 10,
      maxLevel: 100
    },
    streakBoost: {
      id: 'streakBoost',
      name: 'Streak Boost',
      description: 'Daily reward multiplier',
      basePrice: 800,
      priceMultiplier: 2.2,
      effect: (level) => level * 0.05,
      maxLevel: 30
    },
    offlineEarnings: {
      id: 'offlineEarnings',
      name: 'Offline Earnings',
      description: 'Earn while away (% of auto-miner)',
      basePrice: 2000,
      priceMultiplier: 3,
      effect: (level) => level * 0.1,
      maxLevel: 20
    }
  },
  
  // Daily Rewards
  DAILY_REWARDS: [
    { day: 1, coins: 100 },
    { day: 2, coins: 200 },
    { day: 3, coins: 300 },
    { day: 4, coins: 500 },
    { day: 5, coins: 800 },
    { day: 6, coins: 1200 },
    { day: 7, coins: 2000, bonus: true }
  ],
  
  // Referral System
  REFERRAL_REWARD_PERCENTAGE: 0.2,
  REFERRAL_MIN_PLAYTIME_MINUTES: 5,
  REFERRAL_MIN_TASKS_COMPLETED: 1,
  
  // Critical Hit
  CRITICAL_MULTIPLIER_MIN: 2,
  CRITICAL_MULTIPLIER_MAX: 5,
  
  // Auto Miner
  AUTO_MINER_INTERVAL_MS: 60000, // 1 minute
  
  // Leaderboard
  LEADERBOARD_SIZE: 100,
  
  // Rate Limits
  RATE_LIMIT_WINDOW_MS: 60000, // 1 minute
  RATE_LIMIT_MAX_REQUESTS: 100
};
