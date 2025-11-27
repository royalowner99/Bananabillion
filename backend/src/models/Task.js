const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  taskId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  reward: {
    type: Number,
    required: true
  },
  type: {
    type: String,
    enum: ['daily', 'one-time', 'partner', 'cooldown', 'milestone', 'special'],
    default: 'one-time'
  },
  category: {
    type: String,
    enum: ['social', 'daily', 'special', 'partner', 'achievement'],
    default: 'social'
  },
  requirement: {
    type: mongoose.Schema.Types.Mixed,
    default: null
  },
  rewardRange: {
    min: { type: Number, default: 0 },
    max: { type: Number, default: 0 }
  },
  badge: {
    type: String,
    default: null
  },
  duration: {
    type: Number,
    default: 0
  },
  cooldownSeconds: {
    type: Number,
    default: 0
  },
  icon: {
    type: String,
    default: '🎯'
  },
  link: {
    type: String,
    default: null
  },
  requiresVerification: {
    type: Boolean,
    default: false
  },
  verificationMethod: {
    type: String,
    enum: ['telegram', 'youtube', 'twitter', 'manual', 'auto'],
    default: 'manual'
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
}, {
  timestamps: true
});

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
  completed: {
    type: Boolean,
    default: false
  },
  lastCompleted: {
    type: Date,
    default: null
  },
  completionCount: {
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

// Compound index
userTaskSchema.index({ userId: 1, taskId: 1 }, { unique: true });

const Task = mongoose.model('Task', taskSchema);
const UserTask = mongoose.model('UserTask', userTaskSchema);

module.exports = { Task, UserTask };
