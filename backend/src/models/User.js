const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
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
  balance: {
    type: Number,
    default: 0,
    min: 0
    // Supports unlimited balance up to JavaScript's MAX_SAFE_INTEGER (9,007,199,254,740,991)
  },
  totalEarned: {
    type: Number,
    default: 0,
    min: 0
    // Supports unlimited earnings tracking
  },
  energy: {
    type: Number,
    default: 1000
  },
  maxEnergy: {
    type: Number,
    default: 1000
  },
  energyRegenRate: {
    type: Number,
    default: 1
  },
  tapPower: {
    type: Number,
    default: 1
  },
  criticalChance: {
    type: Number,
    default: 0.05
  },
  comboMultiplier: {
    type: Number,
    default: 1
  },
  autoMinerRate: {
    type: Number,
    default: 0
  },
  streakBoost: {
    type: Number,
    default: 0
  },
  offlineEarnings: {
    type: Number,
    default: 0
  },
  upgrades: {
    tapPower: { type: Number, default: 0 },
    maxEnergy: { type: Number, default: 0 },
    energyRegen: { type: Number, default: 0 },
    criticalChance: { type: Number, default: 0 },
    comboMultiplier: { type: Number, default: 0 },
    autoMiner: { type: Number, default: 0 },
    streakBoost: { type: Number, default: 0 },
    offlineEarnings: { type: Number, default: 0 }
  },
  referredBy: {
    type: String,
    default: null
  },
  referralCount: {
    type: Number,
    default: 0
  },
  referralEarnings: {
    type: Number,
    default: 0
  },
  lastTapTime: {
    type: Date,
    default: null
  },
  lastEnergyUpdate: {
    type: Date,
    default: Date.now
  },
  lastAutoMinerClaim: {
    type: Date,
    default: Date.now
  },
  dailyStreak: {
    type: Number,
    default: 0
  },
  lastDailyClaim: {
    type: Date,
    default: null
  },
  totalTaps: {
    type: Number,
    default: 0
  },
  totalPlayTime: {
    type: Number,
    default: 0
  },
  tasksCompleted: {
    type: Number,
    default: 0
  },
  miniGamesPlayed: {
    type: Number,
    default: 0
  },
  miniGamesWon: {
    type: Number,
    default: 0
  },
  battlesPlayed: {
    type: Number,
    default: 0
  },
  battlesWon: {
    type: Number,
    default: 0
  },
  lotteryTicketsBought: {
    type: Number,
    default: 0
  },
  dailySpinsUsed: {
    type: Number,
    default: 0
  },
  isBanned: {
    type: Boolean,
    default: false
  },
  banReason: {
    type: String,
    default: null
  },
  ipAddress: {
    type: String,
    default: null
  },
  deviceId: {
    type: String,
    default: null
  },
  lastActive: {
    type: Date,
    default: Date.now
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes for performance
userSchema.index({ totalEarned: -1 });
userSchema.index({ referralCount: -1 });
userSchema.index({ createdAt: -1 });
userSchema.index({ referredBy: 1 });

module.exports = mongoose.model('User', userSchema);
