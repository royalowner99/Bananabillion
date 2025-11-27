const UserBBN = require('../models/UserBBN');
const { Payment } = require('../models/Payment');

// Wheel Spin Configuration
const WHEEL_PRIZES = [
  { reward: 500, probability: 0.30, label: '500 BBN' },
  { reward: 1000, probability: 0.25, label: '1,000 BBN' },
  { reward: 2000, probability: 0.20, label: '2,000 BBN' },
  { reward: 5000, probability: 0.15, label: '5,000 BBN' },
  { reward: 10000, probability: 0.09, label: '10,000 BBN' },
  { reward: 25000, probability: 0.01, label: '🎉 JACKPOT! 25,000 BBN' }
];

const WHEEL_SPIN_PRICE = 10; // ₹10 per spin

// Spin Wheel
exports.spinWheel = async (req, res) => {
  try {
    const userId = req.userId;
    const { paymentVerified = false } = req.body;
    
    const user = await UserBBN.findOne({ userId });
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Check if payment was verified (this should be called after payment success)
    if (!paymentVerified) {
      return res.status(400).json({ 
        error: 'Payment required',
        price: WHEEL_SPIN_PRICE
      });
    }
    
    // Select prize based on probability
    const prize = selectWheelPrize();
    
    // Award prize
    user.balance += prize.reward;
    user.totalEarned += prize.reward;
    user.wheelSpinsToday += 1;
    user.totalWheelSpins += 1;
    user.lastWheelSpin = new Date();
    
    await user.save();
    
    res.json({
      success: true,
      prize: {
        reward: prize.reward,
        label: prize.label,
        isJackpot: prize.reward === 25000
      },
      newBalance: user.balance,
      totalSpins: user.totalWheelSpins
    });
    
  } catch (error) {
    console.error('Spin wheel error:', error);
    res.status(500).json({ error: 'Spin failed' });
  }
};

// Select Prize Based on Probability
function selectWheelPrize() {
  const random = Math.random();
  let cumulativeProbability = 0;
  
  for (const prize of WHEEL_PRIZES) {
    cumulativeProbability += prize.probability;
    if (random <= cumulativeProbability) {
      return prize;
    }
  }
  
  // Fallback (should never reach here)
  return WHEEL_PRIZES[0];
}

// Get Wheel Configuration
exports.getWheelConfig = async (req, res) => {
  try {
    const user = await UserBBN.findOne({ userId: req.userId });
    
    res.json({
      price: WHEEL_SPIN_PRICE,
      prizes: WHEEL_PRIZES.map(p => ({
        reward: p.reward,
        label: p.label,
        probability: p.probability * 100 // Convert to percentage
      })),
      userSpins: {
        today: user?.wheelSpinsToday || 0,
        total: user?.totalWheelSpins || 0
      }
    });
    
  } catch (error) {
    console.error('Get wheel config error:', error);
    res.status(500).json({ error: 'Failed to get config' });
  }
};

// Open Mystery Box
exports.openMysteryBox = async (req, res) => {
  try {
    const userId = req.userId;
    const { paymentVerified = false } = req.body;
    
    const user = await UserBBN.findOne({ userId });
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Check if payment was verified
    if (!paymentVerified) {
      return res.status(400).json({ 
        error: 'Payment required',
        price: 49
      });
    }
    
    // Guaranteed rewards
    const rewards = {
      bbn: 10000,
      vipDays: 7,
      megaBooster: true,
      rareIcon: true
    };
    
    // Award BBN
    user.balance += rewards.bbn;
    user.totalEarned += rewards.bbn;
    
    // Award VIP
    const vipExpiry = user.vipExpiry && new Date(user.vipExpiry) > new Date() 
      ? new Date(user.vipExpiry) 
      : new Date();
    user.vipExpiry = new Date(vipExpiry.getTime() + rewards.vipDays * 24 * 60 * 60 * 1000);
    user.isVIP = true;
    user.vipTier = 'basic';
    
    // Award Mega Booster
    if (!user.permanentBoosters.megaBooster) {
      user.permanentBoosters.megaBooster = true;
      user.miningSpeedBonus = Math.max(user.miningSpeedBonus, 20);
      user.xpMultiplier = Math.max(user.xpMultiplier, 1.1);
    }
    
    // Award Golden Badge
    user.permanentBoosters.goldenBadge = true;
    
    user.mysteryBoxesOpened += 1;
    
    await user.save();
    
    res.json({
      success: true,
      rewards: {
        bbn: rewards.bbn,
        vipDays: rewards.vipDays,
        megaBooster: rewards.megaBooster,
        rareIcon: rewards.rareIcon
      },
      newBalance: user.balance,
      vipExpiry: user.vipExpiry,
      totalBoxesOpened: user.mysteryBoxesOpened
    });
    
  } catch (error) {
    console.error('Open mystery box error:', error);
    res.status(500).json({ error: 'Failed to open box' });
  }
};

// Get Mystery Box Info
exports.getMysteryBoxInfo = async (req, res) => {
  try {
    const user = await UserBBN.findOne({ userId: req.userId });
    
    res.json({
      price: 49,
      guaranteedRewards: [
        { type: 'bbn', amount: 10000, label: '10,000 BBN' },
        { type: 'vip', days: 7, label: '7 Days VIP' },
        { type: 'booster', name: 'Mega Booster', label: '+20% Speed, +10% XP' },
        { type: 'icon', name: 'Golden Banana', label: 'Rare Icon' }
      ],
      userBoxes: {
        opened: user?.mysteryBoxesOpened || 0
      }
    });
    
  } catch (error) {
    console.error('Get mystery box info error:', error);
    res.status(500).json({ error: 'Failed to get info' });
  }
};

// Activate Banana Pass
exports.activateBananaPass = async (req, res) => {
  try {
    const userId = req.userId;
    const { paymentVerified = false } = req.body;
    
    const user = await UserBBN.findOne({ userId });
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Check if payment was verified
    if (!paymentVerified) {
      return res.status(400).json({ 
        error: 'Payment required',
        price: 79
      });
    }
    
    // Check if already active
    if (user.bananaPassActive && user.bananaPassExpiry > new Date()) {
      // Extend expiry
      user.bananaPassExpiry = new Date(user.bananaPassExpiry.getTime() + 30 * 24 * 60 * 60 * 1000);
    } else {
      // Activate new pass
      user.bananaPassActive = true;
      user.bananaPassExpiry = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
      user.bananaPassLevel = 0;
    }
    
    await user.save();
    
    res.json({
      success: true,
      bananaPass: {
        active: user.bananaPassActive,
        expiry: user.bananaPassExpiry,
        level: user.bananaPassLevel
      }
    });
    
  } catch (error) {
    console.error('Activate banana pass error:', error);
    res.status(500).json({ error: 'Failed to activate pass' });
  }
};

// Get Banana Pass Info
exports.getBananaPassInfo = async (req, res) => {
  try {
    const user = await UserBBN.findOne({ userId: req.userId });
    
    const isActive = user?.bananaPassActive && user?.bananaPassExpiry > new Date();
    
    res.json({
      price: 79,
      duration: '30 days',
      benefits: [
        'Extra rewards per level',
        'Exclusive skins',
        'Double daily bonus',
        'Priority support',
        'Special badge'
      ],
      userPass: {
        active: isActive,
        expiry: user?.bananaPassExpiry || null,
        level: user?.bananaPassLevel || 0
      }
    });
    
  } catch (error) {
    console.error('Get banana pass info error:', error);
    res.status(500).json({ error: 'Failed to get info' });
  }
};

// Claim Banana Pass Level Reward
exports.claimPassReward = async (req, res) => {
  try {
    const { level } = req.body;
    const user = await UserBBN.findOne({ userId: req.userId });
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Check if pass is active
    if (!user.bananaPassActive || user.bananaPassExpiry < new Date()) {
      return res.status(400).json({ error: 'Banana Pass not active' });
    }
    
    // Check if user has reached this level
    if (user.level < level) {
      return res.status(400).json({ error: 'Level requirement not met' });
    }
    
    // Check if already claimed
    if (user.bananaPassLevel >= level) {
      return res.status(400).json({ error: 'Reward already claimed' });
    }
    
    // Calculate reward (100 BBN per level + bonus)
    const baseReward = 100 * level;
    const bonusReward = level % 5 === 0 ? 500 : 0; // Bonus every 5 levels
    const totalReward = baseReward + bonusReward;
    
    user.balance += totalReward;
    user.totalEarned += totalReward;
    user.bananaPassLevel = level;
    
    await user.save();
    
    res.json({
      success: true,
      reward: totalReward,
      level,
      newBalance: user.balance
    });
    
  } catch (error) {
    console.error('Claim pass reward error:', error);
    res.status(500).json({ error: 'Failed to claim reward' });
  }
};

// Get Shop Stats (Admin)
exports.getShopStats = async (req, res) => {
  try {
    // Wheel spin stats
    const wheelSpins = await UserBBN.aggregate([
      {
        $group: {
          _id: null,
          totalSpins: { $sum: '$totalWheelSpins' },
          totalUsers: { $sum: { $cond: [{ $gt: ['$totalWheelSpins', 0] }, 1, 0] } }
        }
      }
    ]);
    
    // Mystery box stats
    const mysteryBoxes = await UserBBN.aggregate([
      {
        $group: {
          _id: null,
          totalBoxes: { $sum: '$mysteryBoxesOpened' },
          totalUsers: { $sum: { $cond: [{ $gt: ['$mysteryBoxesOpened', 0] }, 1, 0] } }
        }
      }
    ]);
    
    // Banana pass stats
    const bananaPasses = await UserBBN.countDocuments({
      bananaPassActive: true,
      bananaPassExpiry: { $gt: new Date() }
    });
    
    // Revenue from shop
    const shopRevenue = await Payment.aggregate([
      {
        $match: {
          type: { $in: ['wheel_spin', 'mystery_box', 'banana_pass'] },
          status: 'success'
        }
      },
      {
        $group: {
          _id: '$type',
          totalRevenue: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      }
    ]);
    
    res.json({
      wheelSpins: {
        total: wheelSpins[0]?.totalSpins || 0,
        users: wheelSpins[0]?.totalUsers || 0,
        revenue: shopRevenue.find(r => r._id === 'wheel_spin')?.totalRevenue || 0
      },
      mysteryBoxes: {
        total: mysteryBoxes[0]?.totalBoxes || 0,
        users: mysteryBoxes[0]?.totalUsers || 0,
        revenue: shopRevenue.find(r => r._id === 'mystery_box')?.totalRevenue || 0
      },
      bananaPasses: {
        active: bananaPasses,
        revenue: shopRevenue.find(r => r._id === 'banana_pass')?.totalRevenue || 0
      }
    });
    
  } catch (error) {
    console.error('Get shop stats error:', error);
    res.status(500).json({ error: 'Failed to get stats' });
  }
};
