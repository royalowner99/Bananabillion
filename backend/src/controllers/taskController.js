const { Task, UserTask } = require('../models/Task');
const User = require('../models/User');
const axios = require('axios');

// Helper: Get today's date string (YYYY-MM-DD)
function getTodayString() {
  return new Date().toISOString().split('T')[0];
}

// Helper: Check if 24 hours have passed
function has24HoursPassed(lastTime) {
  if (!lastTime) return true;
  const now = Date.now();
  const diff = now - new Date(lastTime).getTime();
  return diff >= 24 * 60 * 60 * 1000; // 24 hours in milliseconds
}

// Helper: Reset daily tasks if needed
async function resetDailyTasksIfNeeded(userId) {
  const today = getTodayString();
  
  // Find all user tasks that need daily reset
  const userTasks = await UserTask.find({ 
    userId,
    lastResetDate: { $ne: today }
  });
  
  for (const userTask of userTasks) {
    const task = await Task.findOne({ taskId: userTask.taskId });
    
    if (!task) continue;
    
    // Reset daily tasks
    if (task.taskType === 'daily_checkin' || task.taskType === 'watch_ad') {
      if (userTask.status === 'claimed' && has24HoursPassed(userTask.lastClaimTime)) {
        userTask.status = 'pending';
        userTask.dailyCompletionCount = 0;
        userTask.lastResetDate = today;
        await userTask.save();
      }
    }
  }
}

// GET /api/tasks/list - Get all tasks with proper sorting
exports.getTasks = async (req, res) => {
  try {
    const userId = req.userId;
    
    // Reset daily tasks if needed
    await resetDailyTasksIfNeeded(userId);
    
    // Get all active tasks
    const tasks = await Task.find({ isActive: true }).sort({ order: 1 });
    
    // Get user's task progress
    const userTasks = await UserTask.find({ userId });
    const userTaskMap = {};
    userTasks.forEach(ut => {
      userTaskMap[ut.taskId] = ut;
    });
    
    // Get user data for milestone checks
    const user = await User.findOne({ userId });
    
    const today = getTodayString();
    const tasksWithStatus = [];
    
    for (const task of tasks) {
      let userTask = userTaskMap[task.taskId];
      
      // Create user task if doesn't exist
      if (!userTask) {
        userTask = new UserTask({
          userId,
          taskId: task.taskId,
          status: 'pending',
          lastResetDate: today
        });
        await userTask.save();
        userTaskMap[task.taskId] = userTask;
      }
      
      // Check if daily task needs reset
      if ((task.taskType === 'daily_checkin' || task.taskType === 'watch_ad') && 
          userTask.lastResetDate !== today) {
        if (has24HoursPassed(userTask.lastClaimTime)) {
          userTask.status = 'pending';
          userTask.dailyCompletionCount = 0;
          userTask.lastResetDate = today;
          await userTask.save();
        }
      }
      
      // Check daily limit for watch_ad
      let canComplete = true;
      if (task.taskType === 'watch_ad' && task.dailyLimit) {
        if (userTask.dailyCompletionCount >= task.dailyLimit) {
          canComplete = false;
        }
      }
      
      // Check milestone requirements
      if (task.taskType === 'milestone' && task.requirement && userTask.status === 'pending') {
        const req = task.requirement;
        let requirementMet = false;
        
        switch (req.type) {
          case 'taps':
            requirementMet = (user?.totalTaps || 0) >= req.count;
            break;
          case 'referrals':
            requirementMet = (user?.referralCount || 0) >= req.count;
            break;
          case 'balance':
            requirementMet = (user?.balance || 0) >= req.count;
            break;
        }
        
        // Auto-complete milestone if requirement met
        if (requirementMet && userTask.status === 'pending') {
          userTask.status = 'completed';
          userTask.completedAt = new Date();
          await userTask.save();
        }
      }
      
      // Calculate sort priority
      let sortPriority = 0;
      if (userTask.status === 'pending') {
        sortPriority = 1; // Top
      } else if (userTask.status === 'completed') {
        sortPriority = 2; // Middle
      } else if (userTask.status === 'claimed') {
        sortPriority = 3; // Bottom
      }
      
      tasksWithStatus.push({
        taskId: task.taskId,
        taskName: task.taskName,
        taskType: task.taskType,
        description: task.description,
        reward: task.reward,
        icon: task.icon,
        link: task.link,
        verifyRequired: task.verifyRequired,
        dailyLimit: task.dailyLimit,
        status: userTask.status,
        sortPriority,
        canComplete,
        completedAt: userTask.completedAt,
        claimedAt: userTask.claimedAt,
        dailyCompletionCount: userTask.dailyCompletionCount,
        totalCompletions: userTask.totalCompletions
      });
    }
    
    // SORT: pending (1) → completed (2) → claimed (3)
    tasksWithStatus.sort((a, b) => {
      if (a.sortPriority !== b.sortPriority) {
        return a.sortPriority - b.sortPriority;
      }
      // Within same priority, sort by reward (higher first)
      return b.reward - a.reward;
    });
    
    res.json({ 
      tasks: tasksWithStatus,
      totalTasks: tasksWithStatus.length,
      pendingCount: tasksWithStatus.filter(t => t.status === 'pending').length,
      completedCount: tasksWithStatus.filter(t => t.status === 'completed').length,
      claimedCount: tasksWithStatus.filter(t => t.status === 'claimed').length
    });
    
  } catch (error) {
    console.error('Get tasks error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// POST /api/tasks/verify - Verify task completion (for join channel/group)
exports.verifyTask = async (req, res) => {
  try {
    const { taskId } = req.body;
    const userId = req.userId;
    
    const task = await Task.findOne({ taskId, isActive: true });
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }
    
    let userTask = await UserTask.findOne({ userId, taskId });
    if (!userTask) {
      userTask = new UserTask({ userId, taskId, status: 'pending' });
    }
    
    // Check if already completed or claimed
    if (userTask.status === 'completed' || userTask.status === 'claimed') {
      return res.json({ 
        verified: true, 
        status: userTask.status,
        message: 'Task already completed'
      });
    }
    
    let verified = false;
    let message = 'Verification failed';
    
    // Verify based on task type
    if (task.taskType === 'join_channel' || task.taskType === 'join_group') {
      if (!task.link) {
        return res.status(400).json({ error: 'Task has no link configured' });
      }
      
      try {
        // Extract channel/group username from link
        const linkParts = task.link.split('/');
        const channelUsername = linkParts[linkParts.length - 1].replace('@', '');
        
        // Check membership using Telegram Bot API
        const botToken = process.env.BOT_TOKEN;
        const response = await axios.get(
          `https://api.telegram.org/bot${botToken}/getChatMember`,
          {
            params: {
              chat_id: `@${channelUsername}`,
              user_id: userId
            }
          }
        );
        
        if (response.data.ok) {
          const status = response.data.result.status;
          verified = ['creator', 'administrator', 'member'].includes(status);
          message = verified ? 'Membership verified!' : 'You are not a member yet';
        } else {
          message = 'Could not verify membership';
        }
      } catch (error) {
        console.error('Telegram API error:', error.response?.data || error.message);
        message = 'Verification temporarily unavailable';
      }
    } else if (task.taskType === 'social') {
      // For social tasks, trust user confirmation
      verified = true;
      message = 'Task verified!';
    } else {
      // Other tasks don't need verification
      verified = true;
      message = 'Task ready to complete';
    }
    
    // Update status if verified
    if (verified && userTask.status === 'pending') {
      userTask.status = 'completed';
      userTask.completedAt = new Date();
      userTask.verified = true;
      await userTask.save();
    }
    
    res.json({ 
      verified,
      status: userTask.status,
      message
    });
    
  } catch (error) {
    console.error('Verify task error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// POST /api/tasks/claim - Claim task reward
exports.claimTask = async (req, res) => {
  try {
    const { taskId } = req.body;
    const userId = req.userId;
    
    const task = await Task.findOne({ taskId, isActive: true });
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }
    
    const user = await User.findOne({ userId });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    let userTask = await UserTask.findOne({ userId, taskId });
    if (!userTask) {
      return res.status(400).json({ error: 'Task not started' });
    }
    
    // Anti-cheat: Check status
    if (userTask.status === 'claimed') {
      return res.status(400).json({ error: 'Reward already claimed' });
    }
    
    if (userTask.status === 'pending') {
      return res.status(400).json({ error: 'Task not completed yet' });
    }
    
    // Check daily limit for watch_ad
    if (task.taskType === 'watch_ad' && task.dailyLimit) {
      if (userTask.dailyCompletionCount >= task.dailyLimit) {
        return res.status(400).json({ error: 'Daily limit reached' });
      }
    }
    
    // Update user task status
    userTask.status = 'claimed';
    userTask.claimedAt = new Date();
    userTask.lastClaimTime = new Date();
    userTask.totalCompletions += 1;
    
    if (task.taskType === 'watch_ad') {
      userTask.dailyCompletionCount += 1;
    }
    
    await userTask.save();
    
    // Add reward to user
    user.balance += task.reward;
    user.totalEarned += task.reward;
    user.tasksCompleted = (user.tasksCompleted || 0) + 1;
    await user.save();
    
    res.json({
      success: true,
      reward: task.reward,
      newBalance: user.balance,
      status: userTask.status,
      message: `Claimed ${task.reward} coins!`
    });
    
  } catch (error) {
    console.error('Claim task error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// POST /api/tasks/complete - Complete task without verification (for daily checkin, etc)
exports.completeTask = async (req, res) => {
  try {
    const { taskId } = req.body;
    const userId = req.userId;
    
    const task = await Task.findOne({ taskId, isActive: true });
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }
    
    let userTask = await UserTask.findOne({ userId, taskId });
    if (!userTask) {
      userTask = new UserTask({ userId, taskId, status: 'pending' });
    }
    
    // Check if already completed
    if (userTask.status === 'completed' || userTask.status === 'claimed') {
      return res.json({ 
        success: true,
        status: userTask.status,
        message: 'Task already completed'
      });
    }
    
    // Mark as completed
    userTask.status = 'completed';
    userTask.completedAt = new Date();
    await userTask.save();
    
    res.json({
      success: true,
      status: userTask.status,
      message: 'Task completed! Click claim to get your reward.'
    });
    
  } catch (error) {
    console.error('Complete task error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Admin: Create task
exports.createTask = async (req, res) => {
  try {
    const task = new Task(req.body);
    await task.save();
    res.json({ success: true, task });
  } catch (error) {
    console.error('Create task error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Admin: Delete task
exports.deleteTask = async (req, res) => {
  try {
    const { taskId } = req.body;
    await Task.findOneAndDelete({ taskId });
    await UserTask.deleteMany({ taskId });
    res.json({ success: true });
  } catch (error) {
    console.error('Delete task error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Admin: Get all tasks
exports.getAllTasks = async (req, res) => {
  try {
    const tasks = await Task.find().sort({ order: 1 });
    res.json({ tasks });
  } catch (error) {
    console.error('Get all tasks error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};
