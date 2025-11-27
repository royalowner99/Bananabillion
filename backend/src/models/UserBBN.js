const mongoose = require('mongoose');

// BillionBanana (BBN) User Model
const userBBNSchema = new mongoose.Schema({
  // Basic Info
  userId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  username: {
    type: String,
    default: ''
  },
  firstName: {
    type: String,
    default: ''
  },
  lastName: {
    type: String,
    default: ''
  },
  
  // BBN Balance System
  balance: {
    type: Number,
    default: 0,
    min: 0
  },
  totalEarned: {
    type: Number,
    default: 0,
    min: 0
  },
  dailyMined: {
    type: Number,
    default: 0
  },
  dailyMiningLimit: {
    type: Number,
    default: 1500 // 1,500 BBN per day
  },
  lastMiningReset: {
    type: Date,
    default: Date.now
  },
  
  // Level & XP System
  xp: {
    type: Number,
    default: 0
  },
  level: {
    type: Number,
    default: 1
  },
  xpMultiplier: {
    type: Number,
    default: 1
  },
  levelRewardsClaimed: {
    type: [Number],
    default: []
  },
  
  // Mining Stats
  totalTaps: {
    type: Number,
    default: 0
  },
  energy: {
    type: Number,
    default: 1000
  },
  maxEnergy: {
    type: Number,
    default: 1000
  },
  energyRegen: {
    type: Number,
    default: 1 // +1 every X seconds
  },
  energyRegenSpeed: {
    type: Number,
    default: 30 // seconds (default 30s, can be reduced with boosters)
  },
  tapPower: {
    type: Number,
    default: 1
  },
  miningSpeedBonus: {
    type: Number,
    default: 0 // percentage bonus (e.g., 20 = 20% faster)
  },
  lastEnergyUpdate: {
    type: Date,
    default: Date.now
  },
  
  // Daily Streak System
  dailyStreak: {
    type: Number,
    default: 0
  },
  lastDailyLogin: {
    type: Date,
    default: null
  },
  streakRewardsClaimed: {
    type: [Number],
    default: []
  },
  
  // Daily Bonuses
  dailyBonusClaimed: {
    type: Boolean,
    default: false
  },
  adsWatchedToday: {
    type: Number,
    default: 0
  },
  lastAdWatch: {
    type: Date,
    default: null
  },
  
  // VIP System
  isVIP: {
    type: Boolean,
    default: false
  },
  vipExpiry: {
    type: Date,
    default: null
  },
  vipTier: {
    type: String,
    enum: ['none', 'basic', 'premium', 'ultimate'],
    default: 'none'
  },
  
  // Auto-Miner (VIP Feature)
  autoMinerActive: {
    type: Boolean,
    default: false
  },
  autoMinerRate: {
    type: Number,
    default: 0 // coins per second
  },
  lastAutoMineTime: {
    type: Date,
    default: Date.now
  },
  
  // Active Boosters
  activeBoosters: [{
    type: {
      type: String,
      enum: ['turbo', 'energy_refill', 'lucky_banana', 'mega_turbo', 'time_booster', 'mega_booster']
    },
    multiplier: Number,
    duration: Number, // seconds
    usesRemaining: Number,
    activatedAt: Date,
    expiresAt: Date
  }],
  
  // Permanent Boosters (Purchased)
  permanentBoosters: {
    superEnergy: { type: Boolean, default: false }, // Max energy 5000
    timeBooster: { type: Boolean, default: false }, // Energy regen 5s
    megaBooster: { type: Boolean, default: false }, // +20% speed, +10% XP
    goldenBadge: { type: Boolean, default: false }
  },
  
  // Shop & Purchases
  totalSpent: {
    type: Number,
    default: 0
  },
  purchaseHistory: [{
    item: String,
    price: Number,
    currency: String,
    razorpayOrderId: String,
    razorpayPaymentId: String,
    status: String,
    purchasedAt: { type: Date, default: Date.now }
  }],
  
  // Wheel Spins
  wheelSpinsToday: {
    type: Number,
    default: 0
  },
  lastWheelSpin: {
    type: Date,
    default: null
  },
  totalWheelSpins: {
    type: Number,
    default: 0
  },
  
  // Mystery Boxes
  mysteryBoxesOpened: {
    type: Number,
    default: 0
  },
  
  // Banana Pass
  bananaPassActive: {
    type: Boolean,
    default: false
  },
  bananaPassExpiry: {
    type: Date,
    default: null
  },
  bananaPassLevel: {
    type: Number,
    default: 0
  },
  
  // Referral System
  referredBy: {
    type: String,
    default: null
  },
  referralCode: {
    type: String,
    unique: true,
    sparse: true
  },
  referralCount: {
    type: Number,
    default: 0
  },
  referralEarnings: {
    type: Number,
    default: 0
  },
  referralMilestones: {
    milestone5: { type: Boolean, default: false }, // 5 invites: 1 day VIP
    milestone20: { type: Boolean, default: false } // 20 invites: 5% permanent boost
  },
  
  // Withdrawal System
  totalWithdrawn: {
    type: Number,
    default: 0
  },
  withdrawalRequests: [{
    amount: Number, // BBN amount
    inrAmount: Number, // INR amount
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'completed'],
      default: 'pending'
    },
    upiId: String,
    razorpayPayoutId: String,
    requestedAt: { type: Date, default: Date.now },
    processedAt: Date,
    rejectionReason: String
  }],
  
  // Tasks & Achievements
  tasksCompleted: {
    type: Number,
    default: 0
  },
  achievements: [{
    achievementId: String,
    unlockedAt: { type: Date, default: Date.now }
  }],
  
  // Account Status
  isBanned: {
    type: Boolean,
    default: false
  },
  banReason: {
    type: String,
    default: null
  },
  isAdmin: {
    type: Boolean,
    default: false
  },
  
  // Activity Tracking
  lastActive: {
    type: Date,
    default: Date.now
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  
  // Anti-Cheat
  suspiciousActivity: {
    type: Number,
    default: 0
  },
  lastTapTimestamp: {
    type: Date,
    default: null
  },
  tapsPerSecond: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Indexes for performance
userBBNSchema.index({ userId: 1 });
userBBNSchema.index({ referralCode: 1 });
userBBNSchema.index({ level: -1 });
userBBNSchema.index({ totalEarned: -1 });
userBBNSchema.index({ createdAt: -1 });

// Virtual for BBN to INR conversion
userBBNSchema.virtual('balanceInINR').get(function() {
  return (this.balance / 1000000) * 10; // 1,000,000 BBN = ₹10
});

// Method to check if user can mine
userBBNSchema.methods.canMine = function() {
  // Reset daily mining if new day
  const now = new Date();
  const lastReset = new Date(this.lastMiningReset);
  
  if (now.getDate() !== lastReset.getDate() || 
      now.getMonth() !== lastReset.getMonth() || 
      now.getFullYear() !== lastReset.getFullYear()) {
    this.dailyMined = 0;
    this.lastMiningReset = now;
  }
  
  return this.dailyMined < this.dailyMiningLimit;
};

// Method to calculate level from XP
userBBNSchema.methods.calculateLevel = function() {
  // Level formula: level = floor(sqrt(xp / 100))
  // Level 1 = 0 XP, Level 2 = 100 XP, Level 3 = 400 XP, Level 4 = 900 XP, etc.
  const calculatedLevel = Math.floor(Math.sqrt(this.xp / 100)) + 1;
  return Math.max(1, calculatedLevel);
};

// Method to get XP needed for next level
userBBNSchema.methods.xpForNextLevel = function() {
  const nextLevel = this.level + 1;
  return (nextLevel - 1) * (nextLevel - 1) * 100;
};

// Method to check and claim level rewards
userBBNSchema.methods.checkLevelRewards = function() {
  const rewards = [];
  const currentLevel = this.calculateLevel();
  
  for (let level = this.level + 1; level <= currentLevel; level++) {
    if (!this.levelRewardsClaimed.includes(level)) {
      let reward = 0;
      
      if (level >= 1 && level <= 10) {
        reward = 500;
      } else if (level >= 11 && level <= 20) {
        reward = 300;
      } else if (level >= 21 && level <= 50) {
        reward = 150;
      } else {
        reward = 50;
      }
      
      rewards.push({ level, reward });
      this.levelRewardsClaimed.push(level);
    }
  }
  
  this.level = currentLevel;
  return rewards;
};

// Method to add XP
userBBNSchema.methods.addXP = function(amount) {
  const multipliedXP = Math.floor(amount * this.xpMultiplier);
  this.xp += multipliedXP;
  return multipliedXP;
};

// Method to check VIP status
userBBNSchema.methods.isVIPActive = function() {
  if (!this.isVIP) return false;
  if (!this.vipExpiry) return false;
  return new Date() < new Date(this.vipExpiry);
};

// Method to activate booster
userBBNSchema.methods.activateBooster = function(type, multiplier, duration, uses = null) {
  const now = new Date();
  const expiresAt = new Date(now.getTime() + duration * 1000);
  
  this.activeBoosters.push({
    type,
    multiplier,
    duration,
    usesRemaining: uses,
    activatedAt: now,
    expiresAt
  });
};

// Method to get active booster multipliers
userBBNSchema.methods.getActiveMultipliers = function() {
  const now = new Date();
  let tapMultiplier = 1;
  let xpMultiplier = 1;
  
  // Remove expired boosters
  this.activeBoosters = this.activeBoosters.filter(booster => {
    return new Date(booster.expiresAt) > now;
  });
  
  // Calculate multipliers from active boosters
  this.activeBoosters.forEach(booster => {
    if (booster.type === 'turbo') {
      tapMultiplier *= booster.multiplier;
    } else if (booster.type === 'mega_turbo') {
      tapMultiplier *= booster.multiplier;
    }
  });
  
  // VIP bonus
  if (this.isVIPActive()) {
    xpMultiplier *= 2;
  }
  
  // Mega Booster bonus
  if (this.permanentBoosters.megaBooster) {
    xpMultiplier *= 1.1;
  }
  
  return { tapMultiplier, xpMultiplier };
};

const UserBBN = mongoose.model('UserBBN', userBBNSchema);

module.exports = UserBBN;
