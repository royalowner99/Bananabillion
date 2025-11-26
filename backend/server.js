require('dotenv').config();
const app = require('./app');
const connectDB = require('./src/config/database');
const { Task } = require('./src/models/Task');

const PORT = process.env.PORT || 3000;

// Connect to database
connectDB();

// Initialize default tasks
async function initializeTasks() {
  try {
    const taskCount = await Task.countDocuments();
    
    if (taskCount === 0) {
      const defaultTasks = [
        {
          taskId: 'join_channel',
          title: 'Join Telegram Channel',
          description: 'Join our official Telegram channel',
          reward: 500,
          type: 'one-time',
          icon: '📢',
          link: 'https://t.me/your_channel'
        },
        {
          taskId: 'daily_login',
          title: 'Daily Login',
          description: 'Login to the game daily',
          reward: 100,
          type: 'daily',
          icon: '🎯'
        },
        {
          taskId: 'invite_friend',
          title: 'Invite a Friend',
          description: 'Invite a friend to play',
          reward: 1000,
          type: 'one-time',
          icon: '👥'
        },
        {
          taskId: 'reach_1000_taps',
          title: 'Reach 1000 Taps',
          description: 'Make 1000 total taps',
          reward: 300,
          type: 'one-time',
          icon: '👆'
        },
        {
          taskId: 'earn_10000_coins',
          title: 'Earn 10,000 Coins',
          description: 'Earn a total of 10,000 coins',
          reward: 500,
          type: 'one-time',
          icon: '💰'
        }
      ];
      
      await Task.insertMany(defaultTasks);
      console.log('✅ Default tasks initialized');
    }
  } catch (error) {
    console.error('❌ Error initializing tasks:', error);
  }
}

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📱 Environment: ${process.env.NODE_ENV || 'development'}`);
  
  // Initialize tasks after server starts
  initializeTasks();
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('👋 SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('👋 SIGINT received, shutting down gracefully');
  process.exit(0);
});
