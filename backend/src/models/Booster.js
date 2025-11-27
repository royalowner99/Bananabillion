const mongoose = require('mongoose');

// Booster Products Schema
const boosterProductSchema = new mongoose.Schema({
  boosterId: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['free', 'paid_onetime', 'paid_subscription'],
    required: true
  },
  category: {
    type: String,
    enum: ['mining', 'energy', 'xp', 'vip', 'special'],
    required: true
  },
  price: {
    type: Number,
    default: 0 // in INR
  },
  priceUSD: {
    type: Number,
    default: 0
  },
  icon: {
    type: String,
    default: '⚡'
  },
  effect: {
    tapMultiplier: { type: Number, default: 1 },
    xpMultiplier: { type: Number, default: 1 },
    energyBonus: { type: Number, default: 0 },
    energyRegenBonus: { type: Number, default: 0 },
    miningSpeedBonus: { type: Number, default: 0 },
    autoMinerRate: { type: Number, default: 0 }
  },
  duration: {
    type: Number,
    default: 0 // in seconds, 0 = permanent
  },
  uses: {
    type: Number,
    default: null // null = unlimited
  },
  cooldown: {
    type: Number,
    default: 0 // in seconds
  },
  requiresAd: {
    type: Boolean,
    default: false
  },
  subscriptionPeriod: {
    type: String,
    enum: ['none', 'daily', 'weekly', 'monthly'],
    default: 'none'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  order: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

const BoosterProduct = mongoose.model('BoosterProduct', boosterProductSchema);

module.exports = { BoosterProduct };
