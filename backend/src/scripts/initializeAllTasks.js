// Script to initialize ALL tasks and achievements in the database

const mongoose = require('mongoose');
const Task = require('../models/Task');
const allTasks = require('../config/allTasks');
require('dotenv').config();

async function initializeAllTasks() {
  try {
    console.log('🚀 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    console.log('🗑️  Clearing existing tasks...');
    await Task.deleteMany({});
    console.log('✅ Cleared existing tasks');

    const tasksToInsert = [];

    // 1️⃣ Add Daily Tasks
    console.log('📅 Adding Daily Tasks...');
    allTasks.dailyTasks.forEach(task => {
      tasksToInsert.push({
        ...task,
        isActive: true,
        createdAt: new Date()
      });
    });

    // 2️⃣ Add Social Tasks
    console.log('📱 Adding Social Tasks...');
    allTasks.socialTasks.forEach(task => {
      tasksToInsert.push({
        ...task,
        isActive: true,
        createdAt: new Date()
      });
    });

    // 3️⃣ Add Invite Tasks
    console.log('🫂 Adding Invite Tasks...');
    allTasks.inviteTasks.forEach(task => {
      tasksToInsert.push({
        ...task,
        isActive: true,
        createdAt: new Date()
      });
    });

    // 4️⃣ Add Mining Tasks
    console.log('⛏️  Adding Mining Tasks...');
    allTasks.miningTasks.forEach(task => {
      tasksToInsert.push({
        ...task,
        isActive: true,
        createdAt: new Date()
      });
    });

    // 5️⃣ Add Upgrade Tasks
    console.log('⚡ Adding Upgrade Tasks...');
    allTasks.upgradeTasks.forEach(task => {
      tasksToInsert.push({
        ...task,
        isActive: true,
        createdAt: new Date()
      });
    });

    // 6️⃣ Add Special Event Tasks (initially inactive)
    console.log('🎊 Adding Special Event Tasks...');
    allTasks.specialEventTasks.forEach(task => {
      tasksToInsert.push({
        ...task,
        isActive: false, // Activate manually when event starts
        createdAt: new Date()
      });
    });

    // 🏆 Add Achievements
    console.log('🏆 Adding Achievements...');
    
    // Tapping Achievements
    allTasks.tappingAchievements.forEach(achievement => {
      tasksToInsert.push({
        taskId: achievement.achievementId,
        title: achievement.title,
        description: achievement.description,
        icon: achievement.icon,
        reward: achievement.reward,
        type: 'milestone',
        category: 'achievement',
        requiresVerification: false,
        requirement: achievement.requirement,
        badge: achievement.badge,
        isActive: true,
        createdAt: new Date()
      });
    });

    // Mining Power Achievements
    allTasks.miningPowerAchievements.forEach(achievement => {
      tasksToInsert.push({
        taskId: achievement.achievementId,
        title: achievement.title,
        description: achievement.description,
        icon: achievement.icon,
        reward: achievement.reward,
        type: 'milestone',
        category: 'achievement',
        requiresVerification: false,
        requirement: achievement.requirement,
        badge: achievement.badge,
        isActive: true,
        createdAt: new Date()
      });
    });

    // Referral Achievements
    allTasks.referralAchievements.forEach(achievement => {
      tasksToInsert.push({
        taskId: achievement.achievementId,
        title: achievement.title,
        description: achievement.description,
        icon: achievement.icon,
        reward: achievement.reward,
        type: 'milestone',
        category: 'achievement',
        requiresVerification: false,
        requirement: achievement.requirement,
        badge: achievement.badge,
        isActive: true,
        createdAt: new Date()
      });
    });

    // Activity Achievements
    allTasks.activityAchievements.forEach(achievement => {
      tasksToInsert.push({
        taskId: achievement.achievementId,
        title: achievement.title,
        description: achievement.description,
        icon: achievement.icon,
        reward: achievement.reward,
        type: 'milestone',
        category: 'achievement',
        requiresVerification: false,
        requirement: achievement.requirement,
        badge: achievement.badge,
        isActive: true,
        createdAt: new Date()
      });
    });

    // Insert all tasks
    console.log(`💾 Inserting ${tasksToInsert.length} tasks...`);
    await Task.insertMany(tasksToInsert);

    console.log('✅ All tasks and achievements initialized successfully!');
    console.log(`\n📊 Summary:`);
    console.log(`   📅 Daily Tasks: ${allTasks.dailyTasks.length}`);
    console.log(`   📱 Social Tasks: ${allTasks.socialTasks.length}`);
    console.log(`   🫂 Invite Tasks: ${allTasks.inviteTasks.length}`);
    console.log(`   ⛏️  Mining Tasks: ${allTasks.miningTasks.length}`);
    console.log(`   ⚡ Upgrade Tasks: ${allTasks.upgradeTasks.length}`);
    console.log(`   🎊 Special Events: ${allTasks.specialEventTasks.length}`);
    console.log(`   🏆 Tapping Achievements: ${allTasks.tappingAchievements.length}`);
    console.log(`   💪 Power Achievements: ${allTasks.miningPowerAchievements.length}`);
    console.log(`   👥 Referral Achievements: ${allTasks.referralAchievements.length}`);
    console.log(`   📅 Activity Achievements: ${allTasks.activityAchievements.length}`);
    console.log(`   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    console.log(`   📦 Total: ${tasksToInsert.length} tasks`);

    await mongoose.disconnect();
    console.log('👋 Disconnected from MongoDB');
    process.exit(0);

  } catch (error) {
    console.error('❌ Error initializing tasks:', error);
    process.exit(1);
  }
}

// Run the script
initializeAllTasks();
