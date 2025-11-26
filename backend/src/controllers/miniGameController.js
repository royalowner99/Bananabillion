const User = require('../models/User');
const MiniGame = require('../models/MiniGame');

const MIN_BET = 100;
const MAX_BET = 10000;

// Coin Flip - 48% win chance, 2x payout
exports.playCoinFlip = async (req, res) => {
  try {
    const { betAmount, choice } = req.body; // choice: 'heads' or 'tails'
    
    if (!betAmount || !choice) {
      return res.status(400).json({ error: 'Bet amount and choice required' });
    }
    
    if (betAmount < MIN_BET || betAmount > MAX_BET) {
      return res.status(400).json({ error: `Bet must be between ${MIN_BET} and ${MAX_BET}` });
    }
    
    if (!['heads', 'tails'].includes(choice)) {
      return res.status(400).json({ error: 'Invalid choice' });
    }
    
    const user = await User.findOne({ userId: req.userId });
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    if (user.balance < betAmount) {
      return res.status(400).json({ error: 'Insufficient balance' });
    }
    
    // Deduct bet
    user.balance -= betAmount;
    
    // Play game (48% win chance)
    const result = Math.random() < 0.48 ? choice : (choice === 'heads' ? 'tails' : 'heads');
    const won = result === choice;
    const winAmount = won ? betAmount * 2 : 0;
    
    if (won) {
      user.balance += winAmount;
      user.totalEarned += betAmount; // Net profit
      user.miniGamesWon += 1;
    }
    
    user.miniGamesPlayed += 1;
    await user.save();
    
    // Save game record
    await MiniGame.create({
      userId: req.userId,
      gameType: 'coinflip',
      betAmount,
      result,
      winAmount,
      won
    });
    
    res.json({
      won,
      result,
      winAmount,
      balance: user.balance,
      choice
    });
    
  } catch (error) {
    console.error('Coin flip error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Dice Roll - Roll 2 dice, win if sum >= 8 (42% chance), 2.2x payout
exports.playDice = async (req, res) => {
  try {
    const { betAmount } = req.body;
    
    if (!betAmount) {
      return res.status(400).json({ error: 'Bet amount required' });
    }
    
    if (betAmount < MIN_BET || betAmount > MAX_BET) {
      return res.status(400).json({ error: `Bet must be between ${MIN_BET} and ${MAX_BET}` });
    }
    
    const user = await User.findOne({ userId: req.userId });
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    if (user.balance < betAmount) {
      return res.status(400).json({ error: 'Insufficient balance' });
    }
    
    // Deduct bet
    user.balance -= betAmount;
    
    // Roll dice
    const dice1 = Math.floor(Math.random() * 6) + 1;
    const dice2 = Math.floor(Math.random() * 6) + 1;
    const sum = dice1 + dice2;
    const won = sum >= 8;
    const winAmount = won ? Math.floor(betAmount * 2.2) : 0;
    
    if (won) {
      user.balance += winAmount;
      user.totalEarned += (winAmount - betAmount);
      user.miniGamesWon += 1;
    }
    
    user.miniGamesPlayed += 1;
    await user.save();
    
    // Save game record
    await MiniGame.create({
      userId: req.userId,
      gameType: 'dice',
      betAmount,
      result: `${dice1},${dice2}`,
      winAmount,
      won
    });
    
    res.json({
      won,
      dice1,
      dice2,
      sum,
      winAmount,
      balance: user.balance
    });
    
  } catch (error) {
    console.error('Dice error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Slots - 3 symbols, various payouts
exports.playSlots = async (req, res) => {
  try {
    const { betAmount } = req.body;
    
    if (!betAmount) {
      return res.status(400).json({ error: 'Bet amount required' });
    }
    
    if (betAmount < MIN_BET || betAmount > MAX_BET) {
      return res.status(400).json({ error: `Bet must be between ${MIN_BET} and ${MAX_BET}` });
    }
    
    const user = await User.findOne({ userId: req.userId });
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    if (user.balance < betAmount) {
      return res.status(400).json({ error: 'Insufficient balance' });
    }
    
    // Deduct bet
    user.balance -= betAmount;
    
    // Slot symbols with weights
    const symbols = [
      { symbol: '🍒', weight: 40 },
      { symbol: '🍋', weight: 30 },
      { symbol: '🍊', weight: 20 },
      { symbol: '🍇', weight: 7 },
      { symbol: '💎', weight: 2 },
      { symbol: '🎰', weight: 1 }
    ];
    
    const totalWeight = symbols.reduce((sum, s) => sum + s.weight, 0);
    
    const spinReel = () => {
      let random = Math.random() * totalWeight;
      for (const s of symbols) {
        random -= s.weight;
        if (random <= 0) return s.symbol;
      }
      return symbols[0].symbol;
    };
    
    const reel1 = spinReel();
    const reel2 = spinReel();
    const reel3 = spinReel();
    
    // Calculate payout
    let multiplier = 0;
    let won = false;
    
    if (reel1 === reel2 && reel2 === reel3) {
      // Three of a kind
      won = true;
      switch (reel1) {
        case '🍒': multiplier = 3; break;
        case '🍋': multiplier = 5; break;
        case '🍊': multiplier = 8; break;
        case '🍇': multiplier = 15; break;
        case '💎': multiplier = 50; break;
        case '🎰': multiplier = 100; break;
      }
    } else if (reel1 === reel2 || reel2 === reel3 || reel1 === reel3) {
      // Two of a kind
      won = true;
      multiplier = 1.5;
    }
    
    const winAmount = won ? Math.floor(betAmount * multiplier) : 0;
    
    if (won) {
      user.balance += winAmount;
      user.totalEarned += (winAmount - betAmount);
      user.miniGamesWon += 1;
    }
    
    user.miniGamesPlayed += 1;
    await user.save();
    
    // Save game record
    await MiniGame.create({
      userId: req.userId,
      gameType: 'slots',
      betAmount,
      result: `${reel1},${reel2},${reel3}`,
      winAmount,
      won
    });
    
    res.json({
      won,
      reel1,
      reel2,
      reel3,
      multiplier,
      winAmount,
      balance: user.balance
    });
    
  } catch (error) {
    console.error('Slots error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get mini game stats
exports.getStats = async (req, res) => {
  try {
    const user = await User.findOne({ userId: req.userId });
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const recentGames = await MiniGame.find({ userId: req.userId })
      .sort({ playedAt: -1 })
      .limit(10);
    
    res.json({
      gamesPlayed: user.miniGamesPlayed,
      gamesWon: user.miniGamesWon,
      winRate: user.miniGamesPlayed > 0 ? (user.miniGamesWon / user.miniGamesPlayed * 100).toFixed(1) : 0,
      recentGames
    });
    
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};
