const User = require('../models/User');
const DailySpin = require('../models/DailySpin');

// Spin rewards (weighted probabilities)
const SPIN_REWARDS = [
  { coins: 50, weight: 30, label: '50 Coins' },
  { coins: 100, weight: 25, label: '100 Coins' },
  { coins: 200, weight: 20, label: '200 Coins' },
  { coins: 500, weight: 15, label: '500 Coins' },
  { coins: 1000, weight: 7, label: '1000 Coins' },
  { coins: 2000, weight: 2, label: '2000 Coins' },
  { coins: 5000, weight: 1, label: '🎉 JACKPOT 5000!' }
];

exports.getSpinStatus = async (req, res) => {
  try {
    const user = await User.findOne({ userId: req.userId });
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    let spinData = await DailySpin.findOne({ userId: req.userId });
    
    if (!spinData) {
      spinData = new DailySpin({ userId: req.userId });
      await spinData.save();
    }
    
    // Check if can spin (once per 24 hours)
    const now = Date.now();
    const canSpin = !spinData.lastSpin || (now - spinData.lastSpin.getTime()) >= 86400000;
    
    const timeUntilNextSpin = spinData.lastSpin 
      ? Math.max(0, 86400000 - (now - spinData.lastSpin.getTime()))
      : 0;
    
    res.json({
      canSpin,
      timeUntilNextSpin: Math.ceil(timeUntilNextSpin / 1000),
      spinCount: spinData.spinCount,
      totalWinnings: spinData.totalWinnings,
      lastSpin: spinData.lastSpin
    });
    
  } catch (error) {
    console.error('Get spin status error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.spin = async (req, res) => {
  try {
    const user = await User.findOne({ userId: req.userId });
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    let spinData = await DailySpin.findOne({ userId: req.userId });
    
    if (!spinData) {
      spinData = new DailySpin({ userId: req.userId });
    }
    
    // Check if can spin
    const now = Date.now();
    if (spinData.lastSpin && (now - spinData.lastSpin.getTime()) < 86400000) {
      return res.status(400).json({ 
        error: 'Already spun today',
        timeUntilNextSpin: Math.ceil((86400000 - (now - spinData.lastSpin.getTime())) / 1000)
      });
    }
    
    // Select reward based on weighted probability
    const totalWeight = SPIN_REWARDS.reduce((sum, r) => sum + r.weight, 0);
    let random = Math.random() * totalWeight;
    
    let selectedReward = SPIN_REWARDS[0];
    for (const reward of SPIN_REWARDS) {
      random -= reward.weight;
      if (random <= 0) {
        selectedReward = reward;
        break;
      }
    }
    
    // Update user
    user.balance += selectedReward.coins;
    user.totalEarned += selectedReward.coins;
    user.dailySpinsUsed += 1;
    await user.save();
    
    // Update spin data
    spinData.lastSpin = new Date();
    spinData.spinCount += 1;
    spinData.totalWinnings += selectedReward.coins;
    await spinData.save();
    
    res.json({
      reward: selectedReward.coins,
      label: selectedReward.label,
      balance: user.balance,
      spinCount: spinData.spinCount,
      totalWinnings: spinData.totalWinnings
    });
    
  } catch (error) {
    console.error('Spin error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};
