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
  
  // Upgrades - Professionally Balanced
  UPGRADES: {
    tapPower: {
      id: 'tapPower',
      name: '💪 Tap Power',
      description: 'Increase coins earned per tap',
      icon: '💪',
      basePrice: 100,
      priceMultiplier: 1.5,
      effect: (level) => level, // +1 coin per tap per level
      maxLevel: 100,
      category: 'earning',
      priority: 1 // Most important upgrade
    },
    maxEnergy: {
      id: 'maxEnergy',
      name: '🔋 Max Energy',
      description: 'Increase maximum energy capacity',
      icon: '🔋',
      basePrice: 150,
      priceMultiplier: 1.6,
      effect: (level) => level * 50, // +50 energy per level
      maxLevel: 100,
      category: 'capacity',
      priority: 2
    },
    energyRegen: {
      id: 'energyRegen',
      name: '⚡ Energy Regen',
      description: 'Faster energy recovery rate',
      icon: '⚡',
      basePrice: 200,
      priceMultiplier: 1.7,
      effect: (level) => level * 0.3, // +0.3 energy/sec per level
      maxLevel: 100,
      category: 'efficiency',
      priority: 3
    },
    criticalChance: {
      id: 'criticalChance',
      name: '🎯 Critical Hit',
      description: 'Chance for 2-5x coin multiplier',
      icon: '🎯',
      basePrice: 500,
      priceMultiplier: 2.0,
      effect: (level) => level * 0.01, // +1% crit chance per level
      maxLevel: 50, // Max 50% crit chance
      category: 'bonus',
      priority: 4
    },
    comboMultiplier: {
      id: 'comboMultiplier',
      name: '🔥 Combo Master',
      description: 'Increase combo multiplier bonus',
      icon: '🔥',
      basePrice: 300,
      priceMultiplier: 1.8,
      effect: (level) => level * 0.1, // +0.1x combo per level
      maxLevel: 50,
      category: 'bonus',
      priority: 5
    },
    autoMiner: {
      id: 'autoMiner',
      name: '⛏️ Auto Miner',
      description: 'Earn coins passively per minute',
      icon: '⛏️',
      basePrice: 1000,
      priceMultiplier: 2.5,
      effect: (level) => level * 10, // +10 coins/min per level
      maxLevel: 100,
      category: 'passive',
      priority: 6
    },
    streakBoost: {
      id: 'streakBoost',
      name: '📅 Daily Streak',
      description: 'Multiply daily login rewards',
      icon: '📅',
      basePrice: 800,
      priceMultiplier: 2.2,
      effect: (level) => level * 0.05, // +5% daily reward per level
      maxLevel: 30, // Max 150% bonus
      category: 'bonus',
      priority: 7
    },
    offlineEarnings: {
      id: 'offlineEarnings',
      name: '💤 Offline Earnings',
      description: 'Earn % of auto-miner while offline',
      icon: '💤',
      basePrice: 2000,
      priceMultiplier: 3.0,
      effect: (level) => level * 0.1, // +10% offline earnings per level
      maxLevel: 20, // Max 200% (2x auto-miner rate)
      category: 'passive',
      priority: 8
    }
  },
  
  // Upgrade Categories for UI organization
  UPGRADE_CATEGORIES: {
    earning: { name: 'Earning Power', icon: '💰', color: '#FFD700' },
    capacity: { name: 'Energy & Capacity', icon: '🔋', color: '#4CAF50' },
    efficiency: { name: 'Efficiency', icon: '⚡', color: '#2196F3' },
    bonus: { name: 'Bonus & Multipliers', icon: '🎁', color: '#9C27B0' },
    passive: { name: 'Passive Income', icon: '💤', color: '#FF9800' }
  },
  
  // Daily Rewards - Progressive rewards
  DAILY_REWARDS: [
    { day: 1, coins: 100, icon: '🎁' },
    { day: 2, coins: 250, icon: '🎁' },
    { day: 3, coins: 500, icon: '🎁' },
    { day: 4, coins: 1000, icon: '🎁' },
    { day: 5, coins: 2000, icon: '🎁' },
    { day: 6, coins: 3500, icon: '🎁' },
    { day: 7, coins: 5000, icon: '🎉', bonus: true, special: 'JACKPOT!' }
  ],
  
  // Achievement Milestones
  ACHIEVEMENTS: {
    taps: [
      { milestone: 100, reward: 100, title: 'First Steps' },
      { milestone: 1000, reward: 500, title: 'Tapper' },
      { milestone: 10000, reward: 2000, title: 'Tap Master' },
      { milestone: 100000, reward: 10000, title: 'Tap Legend' }
    ],
    coins: [
      { milestone: 1000, reward: 100, title: 'First Thousand' },
      { milestone: 10000, reward: 500, title: 'Wealthy' },
      { milestone: 100000, reward: 2000, title: 'Rich' },
      { milestone: 1000000, reward: 10000, title: 'Millionaire' }
    ],
    referrals: [
      { milestone: 1, reward: 500, title: 'Social Butterfly' },
      { milestone: 5, reward: 2000, title: 'Influencer' },
      { milestone: 10, reward: 5000, title: 'Ambassador' },
      { milestone: 50, reward: 25000, title: 'Legend' }
    ]
  },
  
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
