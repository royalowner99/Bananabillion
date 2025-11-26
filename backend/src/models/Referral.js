const mongoose = require('mongoose');

const referralSchema = new mongoose.Schema({
  inviterId: {
    type: String,
    required: true,
    index: true
  },
  invitedId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  rewardGiven: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: false
  },
  activatedAt: {
    type: Date,
    default: null
  },
  totalEarningsFromInvited: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Compound index for queries
referralSchema.index({ inviterId: 1, invitedId: 1 });

module.exports = mongoose.model('Referral', referralSchema);
