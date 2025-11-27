const { Withdrawal, Payment } = require('../models/Payment');
const UserBBN = require('../models/UserBBN');
const { razorpayInstance, razorpayConfig } = require('../config/razorpay');

// Request Withdrawal
exports.requestWithdrawal = async (req, res) => {
  try {
    const { bbnAmount, upiId, accountHolderName } = req.body;
    const userId = req.userId;
    
    if (!bbnAmount || !upiId) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    // Validate UPI ID format
    const upiRegex = /^[\w.-]+@[\w.-]+$/;
    if (!upiRegex.test(upiId)) {
      return res.status(400).json({ error: 'Invalid UPI ID format' });
    }
    
    const user = await UserBBN.findOne({ userId });
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Calculate INR amount
    const inrAmount = (bbnAmount / 1000000) * 10; // 1M BBN = ₹10
    
    // Validate minimum withdrawal
    if (inrAmount < razorpayConfig.minWithdrawalINR) {
      return res.status(400).json({
        error: `Minimum withdrawal is ₹${razorpayConfig.minWithdrawalINR} (${razorpayConfig.minWithdrawalBBN} BBN)`
      });
    }
    
    // Check if user has enough balance
    if (user.balance < bbnAmount) {
      return res.status(400).json({ error: 'Insufficient balance' });
    }
    
    // Check daily withdrawal limit
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todayWithdrawals = await Withdrawal.countDocuments({
      requestedAt: { $gte: today },
      status: { $in: ['pending', 'approved', 'processing', 'completed'] }
    });
    
    if (todayWithdrawals >= razorpayConfig.dailyWithdrawalSlots) {
      return res.status(400).json({
        error: 'Daily withdrawal limit reached. Please try tomorrow.'
      });
    }
    
    // Check if user has pending withdrawal
    const pendingWithdrawal = await Withdrawal.findOne({
      userId,
      status: { $in: ['pending', 'approved', 'processing'] }
    });
    
    if (pendingWithdrawal) {
      return res.status(400).json({
        error: 'You already have a pending withdrawal request'
      });
    }
    
    // Check revenue availability
    const canWithdraw = await checkWithdrawalAvailability(inrAmount);
    
    if (!canWithdraw) {
      return res.status(400).json({
        error: 'Withdrawal temporarily unavailable. Please try later.'
      });
    }
    
    // Deduct BBN from user balance
    user.balance -= bbnAmount;
    await user.save();
    
    // Create withdrawal request
    const withdrawal = new Withdrawal({
      userId,
      username: user.username || user.firstName,
      bbnAmount,
      inrAmount,
      upiId,
      accountHolderName: accountHolderName || user.firstName,
      status: 'pending'
    });
    
    await withdrawal.save();
    
    res.json({
      success: true,
      message: 'Withdrawal request submitted successfully',
      withdrawal: {
        id: withdrawal._id,
        bbnAmount,
        inrAmount,
        status: 'pending',
        requestedAt: withdrawal.requestedAt
      },
      newBalance: user.balance
    });
    
  } catch (error) {
    console.error('Request withdrawal error:', error);
    res.status(500).json({ error: 'Failed to request withdrawal' });
  }
};

// Check Withdrawal Availability
async function checkWithdrawalAvailability(requestedAmount) {
  try {
    // Calculate total revenue
    const totalRevenue = await calculateTotalRevenue();
    
    // Calculate pending withdrawals
    const pendingWithdrawals = await Withdrawal.aggregate([
      {
        $match: {
          status: { $in: ['pending', 'approved', 'processing'] }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$inrAmount' }
        }
      }
    ]);
    
    const pendingAmount = pendingWithdrawals[0]?.total || 0;
    
    // 60% of revenue available for withdrawals
    const withdrawalPool = totalRevenue * 0.6;
    const availableAmount = withdrawalPool - pendingAmount;
    
    return availableAmount >= requestedAmount;
    
  } catch (error) {
    console.error('Check withdrawal availability error:', error);
    return false;
  }
}

// Calculate Total Revenue
async function calculateTotalRevenue() {
  try {
    const revenue = await Payment.aggregate([
      {
        $match: {
          status: 'success'
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$amount' }
        }
      }
    ]);
    
    return revenue[0]?.total || 0;
    
  } catch (error) {
    console.error('Calculate revenue error:', error);
    return 0;
  }
}

// Get Withdrawal History
exports.getWithdrawalHistory = async (req, res) => {
  try {
    const userId = req.userId;
    
    const withdrawals = await Withdrawal.find({ userId })
      .sort({ requestedAt: -1 })
      .limit(50);
    
    res.json({ withdrawals });
    
  } catch (error) {
    console.error('Get withdrawal history error:', error);
    res.status(500).json({ error: 'Failed to get withdrawal history' });
  }
};

// Get Withdrawal Status
exports.getWithdrawalStatus = async (req, res) => {
  try {
    const { withdrawalId } = req.params;
    const userId = req.userId;
    
    const withdrawal = await Withdrawal.findOne({
      _id: withdrawalId,
      userId
    });
    
    if (!withdrawal) {
      return res.status(404).json({ error: 'Withdrawal not found' });
    }
    
    res.json({ withdrawal });
    
  } catch (error) {
    console.error('Get withdrawal status error:', error);
    res.status(500).json({ error: 'Failed to get withdrawal status' });
  }
};

// Admin: Get All Withdrawal Requests
exports.getAllWithdrawals = async (req, res) => {
  try {
    const { status, limit = 50, skip = 0 } = req.query;
    
    const query = status ? { status } : {};
    
    const withdrawals = await Withdrawal.find(query)
      .sort({ requestedAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip));
    
    const total = await Withdrawal.countDocuments(query);
    
    res.json({
      withdrawals,
      total,
      limit: parseInt(limit),
      skip: parseInt(skip)
    });
    
  } catch (error) {
    console.error('Get all withdrawals error:', error);
    res.status(500).json({ error: 'Failed to get withdrawals' });
  }
};

// Admin: Approve Withdrawal
exports.approveWithdrawal = async (req, res) => {
  try {
    const { withdrawalId } = req.params;
    const { adminNotes } = req.body;
    
    const withdrawal = await Withdrawal.findById(withdrawalId);
    
    if (!withdrawal) {
      return res.status(404).json({ error: 'Withdrawal not found' });
    }
    
    if (withdrawal.status !== 'pending') {
      return res.status(400).json({ error: 'Withdrawal already processed' });
    }
    
    withdrawal.status = 'approved';
    withdrawal.approvedAt = new Date();
    withdrawal.adminNotes = adminNotes || '';
    await withdrawal.save();
    
    // Process payout
    await processWithdrawalPayout(withdrawal);
    
    res.json({
      success: true,
      message: 'Withdrawal approved and processing',
      withdrawal
    });
    
  } catch (error) {
    console.error('Approve withdrawal error:', error);
    res.status(500).json({ error: 'Failed to approve withdrawal' });
  }
};

// Admin: Reject Withdrawal
exports.rejectWithdrawal = async (req, res) => {
  try {
    const { withdrawalId } = req.params;
    const { rejectionReason } = req.body;
    
    if (!rejectionReason) {
      return res.status(400).json({ error: 'Rejection reason required' });
    }
    
    const withdrawal = await Withdrawal.findById(withdrawalId);
    
    if (!withdrawal) {
      return res.status(404).json({ error: 'Withdrawal not found' });
    }
    
    if (withdrawal.status !== 'pending') {
      return res.status(400).json({ error: 'Withdrawal already processed' });
    }
    
    // Refund BBN to user
    const user = await UserBBN.findOne({ userId: withdrawal.userId });
    
    if (user) {
      user.balance += withdrawal.bbnAmount;
      await user.save();
    }
    
    withdrawal.status = 'rejected';
    withdrawal.rejectionReason = rejectionReason;
    withdrawal.processedAt = new Date();
    await withdrawal.save();
    
    res.json({
      success: true,
      message: 'Withdrawal rejected and BBN refunded',
      withdrawal
    });
    
  } catch (error) {
    console.error('Reject withdrawal error:', error);
    res.status(500).json({ error: 'Failed to reject withdrawal' });
  }
};

// Process Withdrawal Payout via Razorpay
async function processWithdrawalPayout(withdrawal) {
  try {
    withdrawal.status = 'processing';
    await withdrawal.save();
    
    // Create fund account for UPI
    const fundAccount = await razorpayInstance.fundAccount.create({
      contact_id: withdrawal.userId, // You need to create contact first
      account_type: 'vpa',
      vpa: {
        address: withdrawal.upiId
      }
    });
    
    withdrawal.razorpayFundAccountId = fundAccount.id;
    await withdrawal.save();
    
    // Create payout
    const payout = await razorpayInstance.payouts.create({
      account_number: process.env.RAZORPAY_ACCOUNT_NUMBER,
      fund_account_id: fundAccount.id,
      amount: Math.floor(withdrawal.inrAmount * 100), // Convert to paise
      currency: 'INR',
      mode: 'UPI',
      purpose: 'payout',
      queue_if_low_balance: false,
      reference_id: withdrawal._id.toString(),
      narration: 'BillionBanana Withdrawal'
    });
    
    withdrawal.razorpayPayoutId = payout.id;
    withdrawal.status = 'completed';
    withdrawal.completedAt = new Date();
    await withdrawal.save();
    
    // Update user's total withdrawn
    const user = await UserBBN.findOne({ userId: withdrawal.userId });
    if (user) {
      user.totalWithdrawn += withdrawal.inrAmount;
      await user.save();
    }
    
    console.log(`✅ Withdrawal completed: ${withdrawal._id}`);
    
  } catch (error) {
    console.error('Process payout error:', error);
    
    withdrawal.status = 'failed';
    withdrawal.processedAt = new Date();
    await withdrawal.save();
    
    // Refund BBN to user
    const user = await UserBBN.findOne({ userId: withdrawal.userId });
    if (user) {
      user.balance += withdrawal.bbnAmount;
      await user.save();
    }
    
    throw error;
  }
}

// Get Withdrawal Stats (Admin)
exports.getWithdrawalStats = async (req, res) => {
  try {
    const totalRevenue = await calculateTotalRevenue();
    
    const stats = await Withdrawal.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalAmount: { $sum: '$inrAmount' }
        }
      }
    ]);
    
    const pending = stats.find(s => s._id === 'pending') || { count: 0, totalAmount: 0 };
    const completed = stats.find(s => s._id === 'completed') || { count: 0, totalAmount: 0 };
    
    const withdrawalPool = totalRevenue * 0.6;
    const availableForWithdrawal = withdrawalPool - pending.totalAmount - completed.totalAmount;
    
    res.json({
      totalRevenue,
      withdrawalPool,
      availableForWithdrawal,
      pending: {
        count: pending.count,
        amount: pending.totalAmount
      },
      completed: {
        count: completed.count,
        amount: completed.totalAmount
      },
      profit: totalRevenue * 0.4
    });
    
  } catch (error) {
    console.error('Get withdrawal stats error:', error);
    res.status(500).json({ error: 'Failed to get stats' });
  }
};
