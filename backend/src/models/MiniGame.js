const mongoose = require('mongoose');

const miniGameSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true
  },
  gameType: {
    type: String,
    enum: ['coinflip', 'dice', 'slots'],
    required: true
  },
  betAmount: {
    type: Number,
    required: true
  },
  result: {
    type: String,
    required: true
  },
  winAmount: {
    type: Number,
    default: 0
  },
  won: {
    type: Boolean,
    default: false
  },
  playedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

miniGameSchema.index({ userId: 1, playedAt: -1 });

module.exports = mongoose.model('MiniGame', miniGameSchema);
