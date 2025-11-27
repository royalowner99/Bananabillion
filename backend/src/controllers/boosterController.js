const { BoosterProduct } = require('../models/Booster');
const UserBBN = require('../models/UserBBN');

// Get All Boosters
exports.getBoosters = async (req, res) => {
  try {
    const boosters = await BoosterProduct.find({ isActive: true })
      .sort({ category: 1, order: 1 });
    
    const user = await UserBBN.findOne({ userId: req.userId });
    
    // Group by category
    const grouped = {
      free: [],
      mining: [],
      energy: [],
      xp: [],
      vip: [],
      special: []
    };
    
    boosters.forEach(booster => {
      const boosterData = {
        ...booster.toObject(),
        owned: false,
        active: false
      };
      
      // Check if user owns this booster
      if (user) {
        switch (booster.boosterId) {
          case 'super_energy':
            boosterData.owned = user.permanentBoosters.superEnergy;
            break;
          case 'time_booster':
            boosterData.owned = user.permanentBoosters.timeBooster;
            break;
          case 'mega_booster':
            boosterData.owned = user.permanentBoosters.megaBooster;
            break;
          case 'vip_auto_miner':
            boosterData.owned = user.isVIPActive();
            boosterData.active = user.autoMinerActive;
            break;
        }
        
        // Check active boosters
        const activeBooster = user.activeBoosters.find(b => b.type === booster.boosterId);
        if (activeBooster) {
          boosterData.active = true;
          boosterData.expiresAt = activeBooster.expiresAt;
          boosterData.usesRemaining = activeBooster.usesRemaining;
        }
      }
      
      if (booster.type === 'free') {
        grouped.free.push(boosterData);
      } else {
        grouped[booster.category].push(boosterData);
      }
    });
    
    res.json({ boosters: grouped });
    
  } catch (error) {
    console.error('Get boosters error:', error);
    res.status(500).json({ error: 'Failed to get boosters' });
  }
};

// Activate Free Booster (Ad-based)
exports.activateFreeBooster = async (req, res) => {
  try {
    const { boosterId } = req.body;
    const userId = req.userId;
    
    if (!boosterId) {
      return res.status(400).json({ error: 'Booster ID required' });
    }
    
    const user = await UserBBN.findOne({ userId });
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const booster = await BoosterProduct.findOne({ boosterId, type: 'free' });
    
    if (!booster) {
      return res.status(404).json({ error: 'Booster not found' });
    }
    
    // Check if requires ad
    if (booster.requiresAd) {
      // TODO: Verify ad was watched
      user.adsWatchedToday += 1;
      user.lastAdWatch = new Date();
    }
    
    // Activate booster based on type
    switch (boosterId) {
      case 'turbo':
        user.activateBooster('turbo', 2, 30); // 2x for 30 seconds
        user.addXP(20); // +20 XP for watching ad
        break;
        
      case 'energy_refill':
        user.energy = user.maxEnergy;
        user.addXP(20);
        break;
        
      case 'lucky_banana':
        const reward = Math.floor(Math.random() * (2000 - 200 + 1)) + 200;
        user.balance += reward;
        user.totalEarned += reward;
        user.addXP(20);
        await user.save();
        return res.json({
          success: true,
          booster: boosterId,
          reward,
          message: `You won ${reward} BBN!`
        });
    }
    
    await user.save();
    
    res.json({
      success: true,
      booster: boosterId,
      message: 'Booster activated!',
      user: {
        energy: user.energy,
        maxEnergy: user.maxEnergy,
        activeBoosters: user.activeBoosters
      }
    });
    
  } catch (error) {
    console.error('Activate free booster error:', error);
    res.status(500).json({ error: 'Failed to activate booster' });
  }
};

// Get User's Active Boosters
exports.getActiveBoosters = async (req, res) => {
  try {
    const user = await UserBBN.findOne({ userId: req.userId });
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Clean up expired boosters
    const now = new Date();
    user.activeBoosters = user.activeBoosters.filter(booster => {
      return new Date(booster.expiresAt) > now;
    });
    
    await user.save();
    
    const multipliers = user.getActiveMultipliers();
    
    res.json({
      activeBoosters: user.activeBoosters,
      permanentBoosters: user.permanentBoosters,
      multipliers,
      vipActive: user.isVIPActive(),
      autoMinerActive: user.autoMinerActive,
      autoMinerRate: user.autoMinerRate
    });
    
  } catch (error) {
    console.error('Get active boosters error:', error);
    res.status(500).json({ error: 'Failed to get active boosters' });
  }
};

// Create Booster (Admin)
exports.createBooster = async (req, res) => {
  try {
    const {
      boosterId,
      name,
      description,
      type,
      category,
      price,
      icon,
      effect,
      duration,
      uses,
      cooldown,
      requiresAd,
      subscriptionPeriod
    } = req.body;
    
    if (!boosterId || !name || !description) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    const existingBooster = await BoosterProduct.findOne({ boosterId });
    
    if (existingBooster) {
      return res.status(400).json({ error: 'Booster ID already exists' });
    }
    
    const booster = new BoosterProduct({
      boosterId,
      name,
      description,
      type: type || 'paid_onetime',
      category: category || 'special',
      price: price || 0,
      icon: icon || '⚡',
      effect: effect || {},
      duration: duration || 0,
      uses: uses || null,
      cooldown: cooldown || 0,
      requiresAd: requiresAd || false,
      subscriptionPeriod: subscriptionPeriod || 'none'
    });
    
    await booster.save();
    
    res.json({ booster });
    
  } catch (error) {
    console.error('Create booster error:', error);
    res.status(500).json({ error: 'Failed to create booster' });
  }
};

// Update Booster (Admin)
exports.updateBooster = async (req, res) => {
  try {
    const { boosterId } = req.params;
    const updates = req.body;
    
    const booster = await BoosterProduct.findOneAndUpdate(
      { boosterId },
      updates,
      { new: true }
    );
    
    if (!booster) {
      return res.status(404).json({ error: 'Booster not found' });
    }
    
    res.json({ booster });
    
  } catch (error) {
    console.error('Update booster error:', error);
    res.status(500).json({ error: 'Failed to update booster' });
  }
};

// Delete Booster (Admin)
exports.deleteBooster = async (req, res) => {
  try {
    const { boosterId } = req.params;
    
    const booster = await BoosterProduct.findOneAndDelete({ boosterId });
    
    if (!booster) {
      return res.status(404).json({ error: 'Booster not found' });
    }
    
    res.json({ message: 'Booster deleted successfully' });
    
  } catch (error) {
    console.error('Delete booster error:', error);
    res.status(500).json({ error: 'Failed to delete booster' });
  }
};

// Initialize Default Boosters
exports.initializeDefaultBoosters = async () => {
  try {
    const defaultBoosters = [
      // Free Boosters
      {
        boosterId: 'turbo',
        name: 'Turbo',
        description: '2× mining speed for 30 seconds',
        type: 'free',
        category: 'mining',
        price: 0,
        icon: '🚀',
        effect: { tapMultiplier: 2 },
        duration: 30,
        requiresAd: true,
        order: 1
      },
      {
        boosterId: 'energy_refill',
        name: 'Energy Refill',
        description: 'Restore full energy instantly',
        type: 'free',
        category: 'energy',
        price: 0,
        icon: '⚡',
        effect: { energyBonus: 1000 },
        requiresAd: true,
        order: 2
      },
      {
        boosterId: 'lucky_banana',
        name: 'Lucky Banana',
        description: 'Win random 200-2,000 BBN',
        type: 'free',
        category: 'special',
        price: 0,
        icon: '🍌',
        effect: {},
        requiresAd: true,
        order: 3
      },
      
      // Paid Boosters
      {
        boosterId: 'vip_auto_miner',
        name: 'VIP Auto-Miner',
        description: 'Auto-mine 1 coin every 3 seconds + 2× XP',
        type: 'paid_subscription',
        category: 'vip',
        price: 49,
        icon: '👑',
        effect: { autoMinerRate: 0.33, xpMultiplier: 2 },
        subscriptionPeriod: 'monthly',
        order: 1
      },
      {
        boosterId: 'super_energy',
        name: 'Super Energy',
        description: 'Increase max energy from 1,000 to 5,000',
        type: 'paid_onetime',
        category: 'energy',
        price: 29,
        icon: '⚡',
        effect: { energyBonus: 4000 },
        duration: 0,
        order: 2
      },
      {
        boosterId: 'time_booster',
        name: 'Time Booster',
        description: 'Energy refills every 5 seconds instead of 30',
        type: 'paid_subscription',
        category: 'energy',
        price: 99,
        icon: '⏱️',
        effect: { energyRegenBonus: 25 },
        subscriptionPeriod: 'monthly',
        order: 3
      },
      {
        boosterId: 'mega_turbo',
        name: 'Mega Turbo',
        description: '3× mining for 60 seconds (3 uses per day)',
        type: 'paid_onetime',
        category: 'mining',
        price: 49,
        icon: '🔥',
        effect: { tapMultiplier: 3 },
        duration: 60,
        uses: 3,
        order: 4
      },
      {
        boosterId: 'mega_booster',
        name: 'Mega Booster',
        description: '+20% permanent mining speed + 10% XP + Golden Badge',
        type: 'paid_onetime',
        category: 'special',
        price: 149,
        icon: '💎',
        effect: { miningSpeedBonus: 20, xpMultiplier: 1.1 },
        duration: 0,
        order: 5
      }
    ];
    
    for (const boosterData of defaultBoosters) {
      const existing = await BoosterProduct.findOne({ boosterId: boosterData.boosterId });
      
      if (!existing) {
        const booster = new BoosterProduct(boosterData);
        await booster.save();
        console.log(`✅ Created booster: ${boosterData.name}`);
      }
    }
    
    console.log('✅ Default boosters initialized');
    
  } catch (error) {
    console.error('Initialize boosters error:', error);
  }
};
