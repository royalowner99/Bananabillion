const mongoose = require('mongoose');

// Task Schema - Defines available tasks
const taskSchema = new mongoose.Schema({
  taskId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  taskName: {
    type: String,
    required: true
  },
  taskType: {
    type: String,
    required: true,
    enum: ['join_channel', 'join_group', 'daily_checkin', 'watch_ad', 'invite_friend', 'social', 'milestone']
  },
  description: {
    type: String,
    required: true
  },
  reward: {
    type: Number,
    required: true
  },
  icon: {
    type: String,
    default: '🎯'
  },
  link: {
    type: String,
    default: null
  },
  verifyRequired: {
    type: Boolean,
    default: false
  },
  dailyLimit: {
    type: Number,
    default: null // null = no limit, number = max times per day
  },
  requirement: {
    type: Object,
    default: null // For milestone tasks: { type: 'taps', count: 1000 }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  order: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// UserTask Schema - Tracks user's task progress
const userTaskSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true
  },
  taskId: {
    type: String,
    required: true,
    index: true
  },
  status: {
    type: String,
    required: true,
    enum: ['pending', 'completed', 'claimed'],
    default: 'pending'
  },
  completedAt: {
    type: Date,
    default: null
  },
  claimedAt: {
    type: Date,
    default: null
  },
  lastClaimTime: {
    type: Date,
    default: null
  },
  dailyCompletionCount: {
    type: Number,
    default: 0
  },
  lastResetDate: {
    type: String,
    default: null // Format: YYYY-MM-DD
  },
  totalCompletions: {
    type: Number,
    default: 0
  },
  verified: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Compound index for efficient queries
userTaskSchema.index({ userId: 1, taskId: 1 }, { unique: true });
userTaskSchema.index({ userId: 1, status: 1 });

// Update timestamp on save
userTaskSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

const Task = mongoose.model('Task', taskSchema);
const UserTask = mongoose.model('UserTask', userTaskSchema);

module.exports = { Task, UserTask };
