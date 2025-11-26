const mongoose = require('mongoose');

const withdrawSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true
  },
  upiId: {
    type: String,
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 100
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'completed'],
    default: 'pending',
    index: true
  },
  adminNote: {
    type: String,
    default: null
  },
  processedBy: {
    type: String,
    default: null
  },
  processedAt: {
    type: Date,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes
withdrawSchema.index({ userId: 1, createdAt: -1 });
withdrawSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model('Withdraw', withdrawSchema);
