// Quick test to check if tasks are in database
const mongoose = require('mongoose');
const { Task } = require('./backend/src/models/Task');
require('dotenv').config();

async function testTasks() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected!');
    
    const tasks = await Task.find({});
    console.log(`\n📊 Total tasks in database: ${tasks.length}\n`);
    
    if (tasks.length === 0) {
      console.log('❌ NO TASKS FOUND! Run: npm run init-tasks');
    } else {
      console.log('✅ Tasks found! Here are the first 10:\n');
      tasks.slice(0, 10).forEach((task, i) => {
        console.log(`${i + 1}. ${task.icon} ${task.title} - ${task.reward} coins (${task.category})`);
      });
      
      console.log('\n📋 Tasks by category:');
      const categories = {};
      tasks.forEach(task => {
        const cat = task.category || 'unknown';
        categories[cat] = (categories[cat] || 0) + 1;
      });
      Object.keys(categories).forEach(cat => {
        console.log(`   ${cat}: ${categories[cat]} tasks`);
      });
    }
    
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

testTasks();
