const mongoose = require('mongoose');
const { Task } = require('../models/Task');
require('dotenv').config();

const tasks = [
  // 1. Join Channel
  {
    taskId: 'join_telegram_channel',
    taskName: 'Join Telegram Channel',
    taskType: 'join_channel',
    description: 'Join @bananabillionx channel',
    reward: 2000,
    icon: '📢',
    link: 'https://t.me/bananabillionx',
    verifyRequired: true,
    dailyLimit: null,
    isActive: true,
    order: 1
  },
  
  // 2. Join Group
  {
    taskId: 'join_telegram_group',
    taskName: 'Join Telegram Group',
    taskType: 'join_group',
    description: 'Join @bananabillioninvite group',
    reward: 1500,
    icon: '👥',
    link: 'https://t.me/bananabillioninvite',
    verifyRequired: true,
    dailyLimit: null,
    isActive: true,
    order: 2
  },
  
  // 3. Daily Check-in
  {
    taskId: 'daily_checkin',
    taskName: 'Daily Check-in',
    taskType: 'daily_checkin',
    description: 'Log in once per day',
    reward: 500,
    icon: '📅',
    link: null,
    verifyRequired: false,
    dailyLimit: 1,
    isActive: true,
    order: 3
  },
  
  // 4. Watch Ad (3 times per day)
  {
    taskId: 'watch_ad',
    taskName: 'Watch Ad',
    taskType: 'watch_ad',
    description: 'Watch a short advertisement',
    reward: 300,
    icon: '📺',
    link: null,
    verifyRequired: false,
    dailyLimit: 3,
    isActive: true,
    order: 4
  },
  
  // 5. Invite Friend
  {
    taskId: 'invite_1_friend',
    taskName: 'Invite 1 Friend',
    taskType: 'invite_friend',
    description: 'Invite your first friend',
    reward: 2000,
    icon: '🫂',
    link: null,
    verifyRequired: false,
    dailyLimit: null,
    requirement: { type: 'referrals', count: 1 },
    isActive: true,
    order: 5
  },
  
  // 6. Follow Twitter
  {
    taskId: 'follow_twitter',
    taskName: 'Follow X/Twitter',
    taskType: 'social',
    description: 'Follow us on Twitter/X',
    reward: 2500,
    icon: '🐦',
    link: process.env.TWITTER_HANDLE || 'https://twitter.com/your_account',
    verifyRequired: true,
    dailyLimit: null,
    isActive: true,
    order: 6
  },
  
  // 7. Subscribe YouTube
  {
    taskId: 'subscribe_youtube',
    taskName: 'Subscribe YouTube',
    taskType: 'social',
    description: 'Subscribe to our YouTube channel',
    reward: 2000,
    icon: '📹',
    link: process.env.YOUTUBE_CHANNEL || 'https://youtube.com/@your_channel',
    verifyRequired: true,
    dailyLimit: null,
    isActive: true,
    order: 7
  },
  
  // 8. Join Discord
  {
    taskId: 'join_discord',
    taskName: 'Join Discord',
    taskType: 'social',
    description: 'Join our Discord server',
    reward: 2000,
    icon: '💬',
    link: 'https://discord.gg/your_server',
    verifyRequired: true,
    dailyLimit: null,
    isActive: true,
    order: 8
  },
  
  // 9-13. Milestone Tasks
  {
    taskId: 'reach_1k_taps',
    taskName: 'Reach 1,000 Taps',
    taskType: 'milestone',
    description: 'Make your first 1,000 taps',
    reward: 1000,
    icon: '🍌',
    link: null,
    verifyRequired: false,
    dailyLimit: null,
    requirement: { type: 'taps', count: 1000 },
    isActive: true,
    order: 9
  },
  {
    taskId: 'reach_10k_taps',
    taskName: 'Reach 10,000 Taps',
    taskType: 'milestone',
    description: 'Make 10,000 total taps',
    reward: 5000,
    icon: '🎯',
    link: null,
    verifyRequired: false,
    dailyLimit: null,
    requirement: { type: 'taps', count: 10000 },
    isActive: true,
    order: 10
  },
  {
    taskId: 'invite_5_friends',
    taskName: 'Invite 5 Friends',
    taskType: 'milestone',
    description: 'Invite 5 friends to join',
    reward: 10000,
    icon: '👥',
    link: null,
    verifyRequired: false,
    dailyLimit: null,
    requirement: { type: 'referrals', count: 5 },
    isActive: true,
    order: 11
  },
  {
    taskId: 'invite_10_friends',
    taskName: 'Invite 10 Friends',
    taskType: 'milestone',
    description: 'Invite 10 friends to join',
    reward: 20000,
    icon: '🎉',
    link: null,
    verifyRequired: false,
    dailyLimit: null,
    requirement: { type: 'referrals', count: 10 },
    isActive: true,
    order: 12
  },
  {
    taskId: 'earn_100k_coins',
    taskName: 'Earn 100,000 Coins',
    taskType: 'milestone',
    description: 'Reach 100,000 total coins',
    reward: 50000,
    icon: '💰',
    link: null,
    verifyRequired: false,
    dailyLimit: null,
    requirement: { type: 'balance', count: 100000 },
    isActive: true,
    order: 13
  }
];

async function initializeTasks() {
  try {
    console.log('🚀 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    console.log('🗑️  Clearing existing tasks...');
    await Task.deleteMany({});
    console.log('✅ Cleared existing tasks');

    console.log('💾 Inserting tasks...');
    await Task.insertMany(tasks);
    console.log(`✅ Inserted ${tasks.length} tasks`);

    console.log('\n📊 Task Summary:');
    console.log(`   📢 Join Channel: 1`);
    console.log(`   👥 Join Group: 1`);
    console.log(`   📅 Daily Check-in: 1`);
    console.log(`   📺 Watch Ad: 1 (3x per day)`);
    console.log(`   🫂 Invite Friend: 1`);
    console.log(`   🐦 Social Tasks: 3`);
    console.log(`   🎯 Milestone Tasks: 5`);
    console.log(`   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    console.log(`   📦 Total: ${tasks.length} tasks`);

    await mongoose.disconnect();
    console.log('👋 Disconnected from MongoDB');
    process.exit(0);

  } catch (error) {
    console.error('❌ Error initializing tasks:', error);
    process.exit(1);
  }
}

initializeTasks();
