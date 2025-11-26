const User = require('../models/User');
const { Task } = require('../models/Task');
const Withdraw = require('../models/Withdraw');

exports.getStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({
      lastActive: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
    });
    const bannedUsers = await User.countDocuments({ isBanned: true });
    const pendingWithdrawals = await Withdraw.countDocuments({ status: 'pending' });
    
    const totalBalance = await User.aggregate([
      { $group: { _id: null, total: { $sum: '$balance' } } }
    ]);
    
    const totalEarned = await User.aggregate([
      { $group: { _id: null, total: { $sum: '$totalEarned' } } }
    ]);
    
    res.json({
      totalUsers,
      activeUsers,
      bannedUsers,
      pendingWithdrawals,
      totalBalance: totalBalance[0]?.total || 0,
      totalEarned: totalEarned[0]?.total || 0
    });
    
  } catch (error) {
    console.error('Admin stats error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.getUsers = async (req, res) => {
  try {
    const { page = 1, limit = 50, search = '' } = req.query;
    
    let query = {};
    
    if (search) {
      query = {
        $or: [
          { userId: { $regex: search, $options: 'i' } },
          { username: { $regex: search, $options: 'i' } }
        ]
      };
    }
    
    const users = await User.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));
    
    const total = await User.countDocuments(query);
    
    res.json({
      users,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit))
    });
    
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.banUser = async (req, res) => {
  try {
    const { userId, reason } = req.body;
    
    if (!userId) {
      return res.status(400).json({ error: 'User ID required' });
    }
    
    const user = await User.findOne({ userId });
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    user.isBanned = true;
    user.banReason = reason || 'Violation of terms';
    await user.save();
    
    res.json({ success: true });
    
  } catch (error) {
    console.error('Ban user error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.unbanUser = async (req, res) => {
  try {
    const { userId } = req.body;
    
    if (!userId) {
      return res.status(400).json({ error: 'User ID required' });
    }
    
    const user = await User.findOne({ userId });
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    user.isBanned = false;
    user.banReason = null;
    await user.save();
    
    res.json({ success: true });
    
  } catch (error) {
    console.error('Unban user error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.editBalance = async (req, res) => {
  try {
    const { userId, amount } = req.body;
    
    if (!userId || amount === undefined) {
      return res.status(400).json({ error: 'User ID and amount required' });
    }
    
    const user = await User.findOne({ userId });
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    user.balance = Math.max(0, amount);
    await user.save();
    
    res.json({ success: true, balance: user.balance });
    
  } catch (error) {
    console.error('Edit balance error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.broadcast = async (req, res) => {
  try {
    const { message } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'Message required' });
    }
    
    // This will be handled by the bot
    // Store broadcast in a collection or send directly
    
    res.json({ 
      success: true,
      message: 'Broadcast queued. Use bot to send.'
    });
    
  } catch (error) {
    console.error('Broadcast error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};
