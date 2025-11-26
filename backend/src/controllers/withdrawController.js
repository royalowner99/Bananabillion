const User = require('../models/User');
const Withdraw = require('../models/Withdraw');

exports.requestWithdraw = async (req, res) => {
  try {
    const { upiId, amount } = req.body;
    
    if (!upiId || !amount) {
      return res.status(400).json({ error: 'UPI ID and amount required' });
    }
    
    if (amount < 100) {
      return res.status(400).json({ error: 'Minimum withdrawal is 100 coins' });
    }
    
    const user = await User.findOne({ userId: req.userId });
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    if (user.balance < amount) {
      return res.status(400).json({ error: 'Insufficient balance' });
    }
    
    // Check for pending withdrawals
    const pendingWithdraw = await Withdraw.findOne({
      userId: req.userId,
      status: 'pending'
    });
    
    if (pendingWithdraw) {
      return res.status(400).json({ error: 'You already have a pending withdrawal' });
    }
    
    // Deduct balance
    user.balance -= amount;
    await user.save();
    
    // Create withdrawal request
    const withdraw = new Withdraw({
      userId: req.userId,
      upiId,
      amount
    });
    
    await withdraw.save();
    
    res.json({
      success: true,
      withdrawId: withdraw._id,
      balance: user.balance
    });
    
  } catch (error) {
    console.error('Withdraw request error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.getWithdrawHistory = async (req, res) => {
  try {
    const withdrawals = await Withdraw.find({ userId: req.userId })
      .sort({ createdAt: -1 })
      .limit(50);
    
    res.json({ withdrawals });
    
  } catch (error) {
    console.error('Withdraw history error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.updateWithdrawStatus = async (req, res) => {
  try {
    const { withdrawId, status, adminNote } = req.body;
    
    if (!withdrawId || !status) {
      return res.status(400).json({ error: 'Withdraw ID and status required' });
    }
    
    if (!['approved', 'rejected', 'completed'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }
    
    const withdraw = await Withdraw.findById(withdrawId);
    
    if (!withdraw) {
      return res.status(404).json({ error: 'Withdrawal not found' });
    }
    
    // If rejecting, refund the amount
    if (status === 'rejected' && withdraw.status === 'pending') {
      const user = await User.findOne({ userId: withdraw.userId });
      if (user) {
        user.balance += withdraw.amount;
        await user.save();
      }
    }
    
    withdraw.status = status;
    withdraw.adminNote = adminNote || null;
    withdraw.processedBy = req.userId;
    withdraw.processedAt = new Date();
    
    await withdraw.save();
    
    res.json({ success: true, withdraw });
    
  } catch (error) {
    console.error('Update withdraw error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.getPendingWithdrawals = async (req, res) => {
  try {
    const withdrawals = await Withdraw.find({ status: 'pending' })
      .sort({ createdAt: 1 })
      .limit(100);
    
    res.json({ withdrawals });
    
  } catch (error) {
    console.error('Get pending withdrawals error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};
