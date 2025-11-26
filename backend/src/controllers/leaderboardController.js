const User = require('../models/User');
const gameConfig = require('../config/game');

exports.getLeaderboard = async (req, res) => {
  try {
    const { type } = req.params; // daily, weekly, global
    
    let query = { isBanned: false };
    let sortField = 'totalEarned';
    
    const now = new Date();
    
    if (type === 'daily') {
      const startOfDay = new Date(now.setHours(0, 0, 0, 0));
      query.lastActive = { $gte: startOfDay };
    } else if (type === 'weekly') {
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - now.getDay());
      startOfWeek.setHours(0, 0, 0, 0);
      query.lastActive = { $gte: startOfWeek };
    }
    
    const leaderboard = await User.find(query)
      .sort({ [sortField]: -1 })
      .limit(gameConfig.LEADERBOARD_SIZE)
      .select('userId username totalEarned balance referralCount');
    
    const formattedLeaderboard = leaderboard.map((user, index) => ({
      rank: index + 1,
      userId: user.userId,
      username: user.username || 'Anonymous',
      totalEarned: user.totalEarned,
      balance: user.balance,
      referralCount: user.referralCount
    }));
    
    // Find current user's rank
    const currentUser = await User.findOne({ userId: req.userId });
    let userRank = null;
    
    if (currentUser) {
      const usersAbove = await User.countDocuments({
        ...query,
        [sortField]: { $gt: currentUser[sortField] }
      });
      
      userRank = {
        rank: usersAbove + 1,
        totalEarned: currentUser.totalEarned,
        balance: currentUser.balance
      };
    }
    
    res.json({
      type,
      leaderboard: formattedLeaderboard,
      userRank
    });
    
  } catch (error) {
    console.error('Leaderboard error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.getReferralLeaderboard = async (req, res) => {
  try {
    const leaderboard = await User.find({ isBanned: false })
      .sort({ referralCount: -1 })
      .limit(gameConfig.LEADERBOARD_SIZE)
      .select('userId username referralCount referralEarnings');
    
    const formattedLeaderboard = leaderboard.map((user, index) => ({
      rank: index + 1,
      userId: user.userId,
      username: user.username || 'Anonymous',
      referralCount: user.referralCount,
      referralEarnings: user.referralEarnings
    }));
    
    res.json({ leaderboard: formattedLeaderboard });
    
  } catch (error) {
    console.error('Referral leaderboard error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};
