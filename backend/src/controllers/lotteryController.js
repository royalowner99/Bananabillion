const User = require('../models/User');
const { LotteryTicket, LotteryRound } = require('../models/Lottery');
const crypto = require('crypto');

const TICKET_PRICE = 1000;
const ROUND_DURATION_HOURS = 24;

// Get current lottery round
exports.getCurrentRound = async (req, res) => {
  try {
    let currentRound = await LotteryRound.findOne({ status: 'active' })
      .sort({ roundNumber: -1 });
    
    if (!currentRound) {
      // Create first round
      currentRound = new LotteryRound({
        roundNumber: 1,
        ticketPrice: TICKET_PRICE,
        endDate: new Date(Date.now() + ROUND_DURATION_HOURS * 3600000)
      });
      await currentRound.save();
    }
    
    // Check if round should end
    if (new Date() >= currentRound.endDate && currentRound.status === 'active') {
      await drawWinner(currentRound);
      // Get new round
      currentRound = await LotteryRound.findOne({ status: 'active' })
        .sort({ roundNumber: -1 });
    }
    
    const ticketCount = await LotteryTicket.countDocuments({ 
      lotteryRound: currentRound.roundNumber 
    });
    
    const userTickets = await LotteryTicket.find({
      userId: req.userId,
      lotteryRound: currentRound.roundNumber
    });
    
    res.json({
      round: currentRound,
      ticketCount,
      userTickets: userTickets.length,
      userTicketNumbers: userTickets.map(t => t.ticketNumber)
    });
    
  } catch (error) {
    console.error('Get current round error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Buy lottery ticket
exports.buyTicket = async (req, res) => {
  try {
    const { quantity = 1 } = req.body;
    
    if (quantity < 1 || quantity > 10) {
      return res.status(400).json({ error: 'Can buy 1-10 tickets at once' });
    }
    
    const user = await User.findOne({ userId: req.userId });
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const totalCost = TICKET_PRICE * quantity;
    
    if (user.balance < totalCost) {
      return res.status(400).json({ error: 'Insufficient balance' });
    }
    
    let currentRound = await LotteryRound.findOne({ status: 'active' })
      .sort({ roundNumber: -1 });
    
    if (!currentRound) {
      return res.status(400).json({ error: 'No active lottery round' });
    }
    
    // Check if round ended
    if (new Date() >= currentRound.endDate) {
      return res.status(400).json({ error: 'Lottery round has ended' });
    }
    
    // Deduct cost
    user.balance -= totalCost;
    user.lotteryTicketsBought += quantity;
    await user.save();
    
    // Add to prize pool
    currentRound.prizePool += totalCost;
    await currentRound.save();
    
    // Generate tickets
    const tickets = [];
    for (let i = 0; i < quantity; i++) {
      const ticketNumber = crypto.randomBytes(4).toString('hex').toUpperCase();
      
      const ticket = new LotteryTicket({
        userId: req.userId,
        ticketNumber,
        lotteryRound: currentRound.roundNumber
      });
      
      await ticket.save();
      tickets.push(ticketNumber);
    }
    
    res.json({
      tickets,
      balance: user.balance,
      prizePool: currentRound.prizePool
    });
    
  } catch (error) {
    console.error('Buy ticket error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Get lottery history
exports.getHistory = async (req, res) => {
  try {
    const completedRounds = await LotteryRound.find({ status: 'completed' })
      .sort({ roundNumber: -1 })
      .limit(10);
    
    const history = await Promise.all(completedRounds.map(async (round) => {
      const winner = round.winnerId ? await User.findOne({ userId: round.winnerId }) : null;
      
      return {
        roundNumber: round.roundNumber,
        prizePool: round.prizePool,
        winningTicket: round.winningTicket,
        winner: winner ? winner.username || 'Anonymous' : 'No winner',
        drawnAt: round.drawnAt
      };
    }));
    
    res.json({ history });
    
  } catch (error) {
    console.error('Get history error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// Draw winner (called automatically)
async function drawWinner(round) {
  try {
    const tickets = await LotteryTicket.find({ lotteryRound: round.roundNumber });
    
    if (tickets.length === 0) {
      // No tickets sold, create new round
      round.status = 'completed';
      await round.save();
      
      const newRound = new LotteryRound({
        roundNumber: round.roundNumber + 1,
        ticketPrice: TICKET_PRICE,
        endDate: new Date(Date.now() + ROUND_DURATION_HOURS * 3600000)
      });
      await newRound.save();
      
      return;
    }
    
    // Select random winner
    const winningTicket = tickets[Math.floor(Math.random() * tickets.length)];
    
    // Update round
    round.status = 'completed';
    round.winningTicket = winningTicket.ticketNumber;
    round.winnerId = winningTicket.userId;
    round.drawnAt = new Date();
    await round.save();
    
    // Award prize to winner
    const winner = await User.findOne({ userId: winningTicket.userId });
    if (winner) {
      winner.balance += round.prizePool;
      winner.totalEarned += round.prizePool;
      await winner.save();
    }
    
    // Create new round
    const newRound = new LotteryRound({
      roundNumber: round.roundNumber + 1,
      ticketPrice: TICKET_PRICE,
      endDate: new Date(Date.now() + ROUND_DURATION_HOURS * 3600000)
    });
    await newRound.save();
    
    console.log(`✅ Lottery Round ${round.roundNumber} completed. Winner: ${winningTicket.userId}, Prize: ${round.prizePool}`);
    
  } catch (error) {
    console.error('Draw winner error:', error);
  }
}

module.exports = exports;
