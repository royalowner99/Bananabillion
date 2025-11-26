const User = require('../models/User');
const Referral = require('../models/Referral');
const { getReferralStats } = require('../utils/referralLogic');

exports.getReferralStats = async (req, res) => {
  try {
    const stats = await getReferralStats(req.userId);
    
    if (!stats) {
      return res.status(500).json({ error: 'Could not fetch stats' });
    }
    
    const user = await User.findOne({ userId: req.userId });
    
    res.json({
      ...stats,
      referralEarnings: user.referralEarnings,
      referralLink: `https://t.me/${process.env.BOT_USERNAME}?start=${req.userId}`
    });
    
  } catch (error) {
    console.error('Referral stats error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.activateReferral = async (req, res) => {
  try {
    const { referrerId } = req.body;
    
    if (!referrerId) {
      return res.status(400).json({ error: 'Referrer ID required' });
    }
    
    const user = await User.findOne({ userId: req.userId });
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    if (user.referredBy) {
      return res.status(400).json({ error: 'Already referred by someone' });
    }
    
    if (referrerId === req.userId) {
      return res.status(400).json({ error: 'Cannot refer yourself' });
    }
    
    const inviter = await User.findOne({ userId: referrerId });
    
    if (!inviter) {
      return res.status(404).json({ error: 'Referrer not found' });
    }
    
    // Create referral
    user.referredBy = referrerId;
    await user.save();
    
    await Referral.create({
      inviterId: referrerId,
      invitedId: req.userId
    });
    
    res.json({ success: true });
    
  } catch (error) {
    console.error('Activate referral error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};
