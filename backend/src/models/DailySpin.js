const mongoose = require('mongoose');

const dailySpinSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true
  },
  lastSpin: {
    type: Date,
    default: null
  },
  spinCount: {
    type: Number,
    default: 0
  },
  totalWinnings: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

dailySpinSchema.index({ userId: 1 }, { unique: true });

module.exports = mongoose.model('DailySpin', dailySpinSchema);
