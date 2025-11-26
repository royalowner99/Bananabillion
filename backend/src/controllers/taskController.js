const { Task, UserTask } = require('../models/Task');
const User = require('../models/User');
const { checkReferralActivation } = require('../utils/referralLogic');

exports.getTasks = async (req, res) => {
  try {
    const tasks = await Task.find({ isActive: true }).sort({ order: 1 });
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
      
      if (userTask) {
        if (task.type === 'one-time' && userTask.completed) {
          canComplete = false;
        } else if (task.type === 'daily' || task.type === 'cooldown') {
          if (userTask.lastCompleted) {
            const timeSinceComplete = (now - userTask.lastCompleted.getTime()) / 1000;
            const cooldown = task.type === 'daily' ? 86400 : task.cooldownSeconds;
            
            if (timeSinceComplete < cooldown) {
              canComplete = false;
              timeRemaining = cooldown - timeSinceComplete;
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
        icon: task.icon,
        link: task.link,
        completed: userTask?.completed || false,
        completionCount: userTask?.completionCount || 0,
        canComplete,
        timeRemaining: Math.ceil(timeRemaining)
      };
    });
    
    res.json({ tasks: tasksWithStatus });
    
  } catch (error) {
    console.error('Get tasks error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.completeTask = async (req, res) => {
  try {
    const { taskId } = req.body;
    
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
    const { taskId, title, description, reward, type, cooldownSeconds, icon, link } = req.body;
    
    if (!taskId || !title || !description || !reward) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    const existingTask = await Task.findOne({ taskId });
    
    if (existingTask) {
      return res.status(400).json({ error: 'Task ID already exists' });
    }
    
    const task = new Task({
      taskId,
      title,
      description,
      reward,
      type: type || 'one-time',
      cooldownSeconds: cooldownSeconds || 0,
      icon: icon || '🎯',
      link: link || null
    });
    
    await task.save();
    
    res.json({ task });
    
  } catch (error) {
    console.error('Create task error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};
