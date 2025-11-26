const User = require('../models/User');
const Referral = require('../models/Referral');
const gameConfig = require('../config/game');

// Check if referral should be activated
async function checkReferralActivation(invitedUserId) {
  try {
    const referral = await Referral.findOne({ invitedId: invitedUserId });
    
    if (!referral || referral.isActive) return null;
    
    const invitedUser = await User.findOne({ userId: invitedUserId });
    
    if (!invitedUser) return null;
    
    // Check conditions
    const playTimeMinutes = invitedUser.totalPlayTime / 60;
    const hasEnoughPlayTime = playTimeMinutes >= gameConfig.REFERRAL_MIN_PLAYTIME_MINUTES;
    const hasCompletedTasks = invitedUser.tasksCompleted >= gameConfig.REFERRAL_MIN_TASKS_COMPLETED;
    
    if (hasEnoughPlayTime && hasCompletedTasks) {
      // Activate referral
      referral.isActive = true;
      referral.activatedAt = new Date();
      await referral.save();
      
      // Update inviter's referral count
      await User.updateOne(
        { userId: referral.inviterId },
        { $inc: { referralCount: 1 } }
      );
      
      return referral;
    }
    
    return null;
  } catch (error) {
    console.error('Error checking referral activation:', error);
    return null;
  }
}

// Distribute referral reward
async function distributeReferralReward(invitedUserId, earnings) {
  try {
    const referral = await Referral.findOne({ 
      invitedId: invitedUserId,
      isActive: true 
    });
    
    if (!referral) return null;
    
    const reward = Math.floor(earnings * gameConfig.REFERRAL_REWARD_PERCENTAGE);
    
    if (reward <= 0) return null;
    
    // Update referral record
    referral.rewardGiven += reward;
    referral.totalEarningsFromInvited += earnings;
    await referral.save();
    
    // Give reward to inviter
    const inviter = await User.findOne({ userId: referral.inviterId });
    
    if (inviter) {
      inviter.balance += reward;
      inviter.referralEarnings += reward;
      inviter.totalEarned += reward;
      await inviter.save();
      
      return {
        inviterId: referral.inviterId,
        reward
      };
    }
    
    return null;
  } catch (error) {
    console.error('Error distributing referral reward:', error);
    return null;
  }
}

// Check for duplicate IP/device (anti-fraud)
async function checkDuplicateUser(userId, ipAddress, deviceId) {
  try {
    // Check if another user has same IP and device
    const duplicate = await User.findOne({
      userId: { $ne: userId },
      $or: [
        { ipAddress, deviceId },
        { ipAddress, ipAddress: { $ne: null } }
      ]
    });
    
    return !!duplicate;
  } catch (error) {
    console.error('Error checking duplicate user:', error);
    return false;
  }
}

// Get referral stats
async function getReferralStats(userId) {
  try {
    const referrals = await Referral.find({ inviterId: userId });
    
    const stats = {
      totalReferrals: referrals.length,
      activeReferrals: referrals.filter(r => r.isActive).length,
      pendingReferrals: referrals.filter(r => !r.isActive).length,
      totalEarnings: referrals.reduce((sum, r) => sum + r.rewardGiven, 0),
      referrals: []
    };
    
    // Get detailed info for each referral
    for (const ref of referrals) {
      const invitedUser = await User.findOne({ userId: ref.invitedId });
      
      if (invitedUser) {
        stats.referrals.push({
          username: invitedUser.username || 'Anonymous',
          isActive: ref.isActive,
          earned: ref.rewardGiven,
          joinedAt: ref.createdAt
        });
      }
    }
    
    return stats;
  } catch (error) {
    console.error('Error getting referral stats:', error);
    return null;
  }
}

module.exports = {
  checkReferralActivation,
  distributeReferralReward,
  checkDuplicateUser,
  getReferralStats
};
