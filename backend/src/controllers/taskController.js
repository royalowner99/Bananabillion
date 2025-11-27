const { Task, UserTask } = require('../models/Task');
const User = require('../models/User');
const { checkReferralActivation } = require('../utils/referralLogic');

exports.getTasks = async (req, res) => {
  try {
    const tasks = await Task.find({ isActive: true }).sort({ category: 1, order: 1 });
    const userTasks = await UserTask.find({ userId: req.userId });
    
    const userTaskMap = {};
    userTasks.forEach(ut => {
      userTaskMap[ut.taskId] = ut;
    });
    
    const now = Date.now();
    
    const tasksWithStatus = tasks.map(task => {
      const userTask = userTaskMap[task.taskId];
      let canComplete = true;
      let timeRemaining = 0;
      let status = 'available'; // available, completed, cooldown
      
      if (userTask) {
        if (task.type === 'one-time' && userTask.completed) {
          canComplete = false;
          status = 'completed';
        } else if (task.type === 'daily' || task.type === 'cooldown') {
          if (userTask.lastCompleted) {
            const timeSinceComplete = (now - userTask.lastCompleted.getTime()) / 1000;
            const cooldown = task.type === 'daily' ? 86400 : task.cooldownSeconds;
            
            if (timeSinceComplete < cooldown) {
              canComplete = false;
              timeRemaining = cooldown - timeSinceComplete;
              status = 'cooldown';
            }
          }
        }
      }
      
      return {
        taskId: task.taskId,
        title: task.title,
        description: task.description,
        reward: task.reward,
        type: task.type,
        category: task.category || 'social',
        icon: task.icon,
        link: task.link,
        requiresVerification: task.requiresVerification || false,
        verificationMethod: task.verificationMethod || 'manual',
        completed: userTask?.completed || false,
        completionCount: userTask?.completionCount || 0,
        canComplete,
        status,
        timeRemaining: Math.ceil(timeRemaining)
      };
    });
    
    // Group tasks by category
    const groupedTasks = {
      social: tasksWithStatus.filter(t => t.category === 'social'),
      daily: tasksWithStatus.filter(t => t.category === 'daily'),
      special: tasksWithStatus.filter(t => t.category === 'special'),
      partner: tasksWithStatus.filter(t => t.category === 'partner'),
      achievement: tasksWithStatus.filter(t => t.category === 'achievement')
    };
    
    res.json({ 
      tasks: tasksWithStatus,
      groupedTasks
    });
    
  } catch (error) {
    console.error('Get tasks error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.completeTask = async (req, res) => {
  try {
    const { taskId, verification } = req.body;
    
    if (!taskId) {
      return res.status(400).json({ error: 'Task ID required' });
    }
    
    const task = await Task.findOne({ taskId, isActive: true });
    
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }
    
    const user = await User.findOne({ userId: req.userId });
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Find or create user task
    let userTask = await UserTask.findOne({ userId: req.userId, taskId });
    
    if (!userTask) {
      userTask = new UserTask({
        userId: req.userId,
        taskId
      });
    }
    
    // Check if can complete
    const now = Date.now();
    
    if (task.type === 'one-time' && userTask.completed) {
      return res.status(400).json({ error: 'Task already completed' });
    }
    
    if ((task.type === 'daily' || task.type === 'cooldown') && userTask.lastCompleted) {
      const timeSinceComplete = (now - userTask.lastCompleted.getTime()) / 1000;
      const cooldown = task.type === 'daily' ? 86400 : task.cooldownSeconds;
      
      if (timeSinceComplete < cooldown) {
        return res.status(400).json({ 
          error: 'Task on cooldown',
          timeRemaining: Math.ceil(cooldown - timeSinceComplete)
        });
      }
    }
    
    // Verify task completion for Telegram join tasks
    if (taskId.includes('join') && task.link) {
      // For Telegram join tasks, require verification
      // In production, you would check via Telegram Bot API if user is member
      // For now, we'll trust the frontend verification
      if (!verification || !verification.confirmed) {
        return res.status(400).json({ 
          error: 'Task verification required',
          message: 'Please confirm you have completed the task'
        });
      }
    }
    
    // Complete task
    userTask.completed = true;
    userTask.lastCompleted = new Date();
    userTask.completionCount += 1;
    await userTask.save();
    
    // Give reward
    user.balance += task.reward;
    user.totalEarned += task.reward;
    user.tasksCompleted += 1;
    await user.save();
    
    // Check referral activation
    await checkReferralActivation(user.userId);
    
    res.json({
      balance: user.balance,
      reward: task.reward,
      tasksCompleted: user.tasksCompleted
    });
    
  } catch (error) {
    console.error('Complete task error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.createTask = async (req, res) => {
  try {
    const { 
      taskId, 
      title, 
      description, 
      reward, 
      type, 
      category,
      cooldownSeconds, 
      icon, 
      link,
      requiresVerification,
      verificationMethod
    } = req.body;
    
    if (!taskId || !title || !description || !reward) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    const existingTask = await Task.findOne({ taskId });
    
    if (existingTask) {
      return res.status(400).json({ error: 'Task ID already exists' });
    }
    
    // Auto-detect verification method from link
    let autoVerificationMethod = verificationMethod || 'manual';
    let autoRequiresVerification = requiresVerification || false;
    
    if (link) {
      if (link.includes('t.me')) {
        autoVerificationMethod = 'telegram';
        autoRequiresVerification = true;
      } else if (link.includes('youtube.com')) {
        autoVerificationMethod = 'youtube';
        autoRequiresVerification = true;
      } else if (link.includes('twitter.com') || link.includes('x.com')) {
        autoVerificationMethod = 'twitter';
        autoRequiresVerification = true;
      }
    }
    
    const task = new Task({
      taskId,
      title,
      description,
      reward,
      type: type || 'one-time',
      category: category || 'social',
      cooldownSeconds: cooldownSeconds || 0,
      icon: icon || '🎯',
      link: link || null,
      requiresVerification: autoRequiresVerification,
      verificationMethod: autoVerificationMethod
    });
    
    await task.save();
    
    res.json({ task });
    
  } catch (error) {
    console.error('Create task error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.deleteTask = async (req, res) => {
  try {
    const { taskId } = req.body;
    
    if (!taskId) {
      return res.status(400).json({ error: 'Task ID required' });
    }
    
    const task = await Task.findOneAndDelete({ taskId });
    
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }
    
    // Also delete all user task records for this task
    await UserTask.deleteMany({ taskId });
    
    res.json({ message: 'Task deleted successfully' });
    
  } catch (error) {
    console.error('Delete task error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.verifyTask = async (req, res) => {
  try {
    const { taskId } = req.body;
    const axios = require('axios');
    
    if (!taskId) {
      return res.status(400).json({ error: 'Task ID required' });
    }
    
    const task = await Task.findOne({ taskId, isActive: true });
    
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }
    
    const user = await User.findOne({ userId: req.userId });
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    let verified = false;
    let message = 'Verification failed';
    
    // Verify based on task type
    if (task.link && task.link.includes('t.me')) {
      // Telegram verification
      try {
        const botToken = process.env.BOT_TOKEN;
        const channelUsername = task.link.split('t.me/')[1];
        
        const response = await axios.get(
          `https://api.telegram.org/bot${botToken}/getChatMember`,
          {
            params: {
              chat_id: `@${channelUsername}`,
              user_id: req.userId
            }
          }
        );
        
        if (response.data.ok) {
          const status = response.data.result.status;
          verified = ['creator', 'administrator', 'member'].includes(status);
          message = verified ? 'Telegram membership verified!' : 'You are not a member of the channel';
        }
      } catch (error) {
        console.error('Telegram verification error:', error);
        message = 'Could not verify Telegram membership';
      }
    } else if (task.link && task.link.includes('youtube.com')) {
      // YouTube verification (requires YouTube API key)
      // For now, we'll use manual verification
      verified = true;
      message = 'Please confirm you subscribed to the channel';
    } else if (task.link && task.link.includes('twitter.com')) {
      // Twitter verification (requires Twitter API)
      // For now, we'll use manual verification
      verified = true;
      message = 'Please confirm you followed the account';
    } else {
      // Generic task - manual verification
      verified = true;
      message = 'Task marked for verification';
    }
    
    res.json({ 
      verified,
      message,
      taskId: task.taskId
    });
    
  } catch (error) {
    console.error('Verify task error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.getAllTasks = async (req, res) => {
  try {
    const tasks = await Task.find().sort({ createdAt: -1 });
    res.json({ tasks });
  } catch (error) {
    console.error('Get all tasks error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};
