const mongoose = require('mongoose');

const lotteryTicketSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true
  },
  ticketNumber: {
    type: String,
    required: true,
    unique: true
  },
  lotteryRound: {
    type: Number,
    required: true,
    index: true
  },
  purchased: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

const lotteryRoundSchema = new mongoose.Schema({
  roundNumber: {
    type: Number,
    required: true,
    unique: true,
    index: true
  },
  prizePool: {
    type: Number,
    default: 0
  },
  ticketPrice: {
    type: Number,
    default: 1000
  },
  winningTicket: {
    type: String,
    default: null
  },
  winnerId: {
    type: String,
    default: null
  },
  status: {
    type: String,
    enum: ['active', 'drawing', 'completed'],
    default: 'active'
  },
  startDate: {
    type: Date,
    default: Date.now
  },
  endDate: {
    type: Date,
    required: true
  },
  drawnAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

const LotteryTicket = mongoose.model('LotteryTicket', lotteryTicketSchema);
const LotteryRound = mongoose.model('LotteryRound', lotteryRoundSchema);

module.exports = { LotteryTicket, LotteryRound };
