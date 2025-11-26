const mongoose = require('mongoose');

const battleSchema = new mongoose.Schema({
  battleId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  player1Id: {
    type: String,
    required: true,
    index: true
  },
  player2Id: {
    type: String,
    default: null,
    index: true
  },
  betAmount: {
    type: Number,
    required: true
  },
  winnerId: {
    type: String,
    default: null
  },
  status: {
    type: String,
    enum: ['waiting', 'active', 'completed', 'cancelled'],
    default: 'waiting'
  },
  player1Score: {
    type: Number,
    default: 0
  },
  player2Score: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  completedAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Battle', battleSchema);
