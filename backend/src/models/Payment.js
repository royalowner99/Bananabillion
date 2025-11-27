const mongoose = require('mongoose');

// Payment Transaction Schema
const paymentSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true
  },
  type: {
    type: String,
    enum: ['booster', 'vip', 'wheel_spin', 'mystery_box', 'banana_pass', 'other'],
    required: true
  },
  itemId: {
    type: String,
    required: true
  },
  itemName: {
    type: String,
    required: true
  },
  amount: {
    type: Number,
    required: true // in INR
  },
  currency: {
    type: String,
    default: 'INR'
  },
  
  // Razorpay Details
  razorpayOrderId: {
    type: String,
    required: true,
    unique: true
  },
  razorpayPaymentId: {
    type: String,
    default: null
  },
  razorpaySignature: {
    type: String,
    default: null
  },
  
  status: {
    type: String,
    enum: ['created', 'pending', 'success', 'failed', 'refunded'],
    default: 'created'
  },
  
  paymentMethod: {
    type: String,
    default: null
  },
  
  // Metadata
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  
  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now
  },
  paidAt: {
    type: Date,
    default: null
  },
  refundedAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// Withdrawal Request Schema
const withdrawalSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true
  },
  username: {
    type: String,
    required: true
  },
  
  // Amounts
  bbnAmount: {
    type: Number,
    required: true
  },
  inrAmount: {
    type: Number,
    required: true
  },
  
  // Payment Details
  upiId: {
    type: String,
    required: true
  },
  accountHolderName: {
    type: String,
    default: null
  },
  
  // Status
  status: {
    type: String,
    enum: ['pending', 'approved', 'processing', 'completed', 'rejected', 'failed'],
    default: 'pending'
  },
  
  // Razorpay Payout
  razorpayPayoutId: {
    type: String,
    default: null
  },
  razorpayFundAccountId: {
    type: String,
    default: null
  },
  
  // Admin Notes
  adminNotes: {
    type: String,
    default: null
  },
  rejectionReason: {
    type: String,
    default: null
  },
  
  // Timestamps
  requestedAt: {
    type: Date,
    default: Date.now
  },
  approvedAt: {
    type: Date,
    default: null
  },
  processedAt: {
    type: Date,
    default: null
  },
  completedAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// Indexes
paymentSchema.index({ userId: 1, createdAt: -1 });
paymentSchema.index({ status: 1 });
paymentSchema.index({ razorpayOrderId: 1 });

withdrawalSchema.index({ userId: 1, createdAt: -1 });
withdrawalSchema.index({ status: 1 });
withdrawalSchema.index({ requestedAt: -1 });

const Payment = mongoose.model('Payment', paymentSchema);
const Withdrawal = mongoose.model('Withdrawal', withdrawalSchema);

module.exports = { Payment, Withdrawal };
