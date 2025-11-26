const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Referral = require('../models/Referral');
const { validateTelegramWebAppData, extractUserData } = require('../middleware/auth');
const { calculateUserStats, regenerateEnergy, calculateOfflineEarnings } = require('../utils/gameLogic');

exports.telegramAuth = async (req, res) => {
  try {
    const { initData, referrerId, ipAddress, deviceId } = req.body;
    
    // Validate Telegram data
    if (!validateTelegramWebAppData(initData)) {
      return res.status(401).json({ error: 'Invalid Telegram data' });
    }
    
    // Extract user data
    const userData = extractUserData(initData);
    
    if (!userData) {
      return res.status(400).json({ error: 'Could not extract user data' });
    }
    
    // Find or create user
    let user = await User.findOne({ userId: userData.userId });
    
    if (!user) {
      // Create new user
      user = new User({
        userId: userData.userId,
        username: userData.username,
        firstName: userData.firstName,
        lastName: userData.lastName,
        ipAddress,
        deviceId
      });
      
      // Handle referral
      if (referrerId && referrerId !== userData.userId) {
        const inviter = await User.findOne({ userId: referrerId });
        
        if (inviter) {
          user.referredBy = referrerId;
          
          // Create referral record
          await Referral.create({
            inviterId: referrerId,
            invitedId: userData.userId
          });
        }
      }
      
      await user.save();
    } else {
      // Update existing user info
      user.username = userData.username;
      user.firstName = userData.firstName;
      user.lastName = userData.lastName;
      
      // Regenerate energy
      regenerateEnergy(user);
      
      // Calculate offline earnings
      const offlineEarnings = calculateOfflineEarnings(user);
      if (offlineEarnings > 0) {
        user.balance += offlineEarnings;
        user.totalEarned += offlineEarnings;
      }
      
      user.lastActive = new Date();
      await user.save();
    }
    
    // Generate JWT token
    const token = jwt.sign(
      { userId: user.userId },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );
    
    // Calculate current stats
    const stats = calculateUserStats(user);
    
    // Return user data
    res.json({
      token,
      user: {
        userId: user.userId,
        username: user.username,
        balance: user.balance,
        totalEarned: user.totalEarned,
        energy: Math.floor(user.energy),
        maxEnergy: stats.maxEnergy,
        tapPower: stats.tapPower,
        referralCount: user.referralCount,
        dailyStreak: user.dailyStreak,
        offlineEarnings: offlineEarnings || 0
      }
    });
    
  } catch (error) {
    console.error('Auth error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};
