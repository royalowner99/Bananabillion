const { razorpayInstance, razorpayConfig } = require('../config/razorpay');
const { Payment } = require('../models/Payment');
const UserBBN = require('../models/UserBBN');
const { BoosterProduct } = require('../models/Booster');
const crypto = require('crypto');

// Create Razorpay Order
exports.createOrder = async (req, res) => {
  try {
    const { itemType, itemId, amount } = req.body;
    const userId = req.userId;
    
    if (!itemType || !amount) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    // Validate amount
    if (amount < 1) {
      return res.status(400).json({ error: 'Invalid amount' });
    }
    
    // Get item details
    let itemName = itemId;
    if (itemType === 'booster') {
      const booster = await BoosterProduct.findOne({ boosterId: itemId });
      if (booster) itemName = booster.name;
    }
    
    // Create Razorpay order
    const options = {
      amount: amount * 100, // Convert to paise
      currency: razorpayConfig.currency,
      receipt: `order_${userId}_${Date.now()}`,
      notes: {
        userId,
        itemType,
        itemId
      }
    };
    
    const order = await razorpayInstance.orders.create(options);
    
    // Save payment record
    const payment = new Payment({
      userId,
      type: itemType,
      itemId,
      itemName,
      amount,
      currency: razorpayConfig.currency,
      razorpayOrderId: order.id,
      status: 'created'
    });
    
    await payment.save();
    
    res.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: razorpayConfig.keyId
    });
    
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ error: 'Failed to create order' });
  }
};

// Verify Payment
exports.verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    } = req.body;
    
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ error: 'Missing payment details' });
    }
    
    // Verify signature
    const text = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', razorpayConfig.keySecret)
      .update(text)
      .digest('hex');
    
    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ error: 'Invalid signature' });
    }
    
    // Find payment record
    const payment = await Payment.findOne({ razorpayOrderId: razorpay_order_id });
    
    if (!payment) {
      return res.status(404).json({ error: 'Payment not found' });
    }
    
    // Update payment status
    payment.razorpayPaymentId = razorpay_payment_id;
    payment.razorpaySignature = razorpay_signature;
    payment.status = 'success';
    payment.paidAt = new Date();
    await payment.save();
    
    // Process the purchase
    await processPurchase(payment);
    
    res.json({
      success: true,
      message: 'Payment verified successfully',
      payment: {
        orderId: payment.razorpayOrderId,
        paymentId: payment.razorpayPaymentId,
        amount: payment.amount,
        itemName: payment.itemName
      }
    });
    
  } catch (error) {
    console.error('Verify payment error:', error);
    res.status(500).json({ error: 'Payment verification failed' });
  }
};

// Process Purchase (Activate booster/item)
async function processPurchase(payment) {
  try {
    const user = await UserBBN.findOne({ userId: payment.userId });
    
    if (!user) {
      throw new Error('User not found');
    }
    
    // Add to purchase history
    user.purchaseHistory.push({
      item: payment.itemName,
      price: payment.amount,
      currency: payment.currency,
      razorpayOrderId: payment.razorpayOrderId,
      razorpayPaymentId: payment.razorpayPaymentId,
      status: 'success'
    });
    
    user.totalSpent += payment.amount;
    
    // Process based on item type
    switch (payment.type) {
      case 'booster':
        await activateBooster(user, payment.itemId);
        break;
        
      case 'vip':
        await activateVIP(user, payment.itemId);
        break;
        
      case 'wheel_spin':
        // Wheel spin will be processed separately
        break;
        
      case 'mystery_box':
        await openMysteryBox(user);
        break;
        
      case 'banana_pass':
        await activateBananaPass(user);
        break;
    }
    
    await user.save();
    
    console.log(`✅ Purchase processed for user ${user.userId}: ${payment.itemName}`);
    
  } catch (error) {
    console.error('Process purchase error:', error);
    throw error;
  }
}

// Activate Booster
async function activateBooster(user, boosterId) {
  const booster = await BoosterProduct.findOne({ boosterId });
  
  if (!booster) {
    throw new Error('Booster not found');
  }
  
  switch (boosterId) {
    case 'vip_auto_miner':
      user.isVIP = true;
      user.vipTier = 'basic';
      user.vipExpiry = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
      user.autoMinerActive = true;
      user.autoMinerRate = 0.33; // 1 coin every 3 seconds
      user.xpMultiplier = 2;
      break;
      
    case 'super_energy':
      user.permanentBoosters.superEnergy = true;
      user.maxEnergy = 5000;
      user.energy = 5000;
      break;
      
    case 'time_booster':
      user.permanentBoosters.timeBooster = true;
      user.energyRegenSpeed = 5; // 30s → 5s
      break;
      
    case 'mega_turbo':
      user.activateBooster('mega_turbo', 3, 60, 3); // 3x for 60s, 3 uses
      break;
      
    case 'mega_booster':
      user.permanentBoosters.megaBooster = true;
      user.permanentBoosters.goldenBadge = true;
      user.miningSpeedBonus = 20; // +20%
      user.xpMultiplier *= 1.1; // +10%
      break;
  }
}

// Activate VIP
async function activateVIP(user, duration) {
  const days = parseInt(duration) || 30;
  user.isVIP = true;
  user.vipTier = 'basic';
  user.vipExpiry = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
  user.autoMinerActive = true;
  user.autoMinerRate = 0.33;
  user.xpMultiplier = 2;
}

// Open Mystery Box
async function openMysteryBox(user) {
  // Guaranteed rewards
  user.balance += 10000; // 10,000 BBN
  user.totalEarned += 10000;
  
  // 7 days VIP
  const vipExpiry = user.vipExpiry && new Date(user.vipExpiry) > new Date() 
    ? new Date(user.vipExpiry) 
    : new Date();
  user.vipExpiry = new Date(vipExpiry.getTime() + 7 * 24 * 60 * 60 * 1000);
  user.isVIP = true;
  
  // Mega Booster
  user.permanentBoosters.megaBooster = true;
  user.miningSpeedBonus = Math.max(user.miningSpeedBonus, 20);
  
  // Rare Icon
  user.permanentBoosters.goldenBadge = true;
  
  user.mysteryBoxesOpened += 1;
}

// Activate Banana Pass
async function activateBananaPass(user) {
  user.bananaPassActive = true;
  user.bananaPassExpiry = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  user.bananaPassLevel = 0;
}

// Webhook Handler
exports.webhook = async (req, res) => {
  try {
    const webhookSignature = req.headers['x-razorpay-signature'];
    const webhookBody = JSON.stringify(req.body);
    
    // Verify webhook signature
    const expectedSignature = crypto
      .createHmac('sha256', razorpayConfig.webhookSecret)
      .update(webhookBody)
      .digest('hex');
    
    if (webhookSignature !== expectedSignature) {
      return res.status(400).json({ error: 'Invalid signature' });
    }
    
    const event = req.body.event;
    const paymentEntity = req.body.payload.payment.entity;
    
    console.log(`📥 Webhook received: ${event}`);
    
    // Handle different events
    switch (event) {
      case 'payment.captured':
        await handlePaymentCaptured(paymentEntity);
        break;
        
      case 'payment.failed':
        await handlePaymentFailed(paymentEntity);
        break;
        
      case 'refund.created':
        await handleRefund(paymentEntity);
        break;
    }
    
    res.json({ status: 'ok' });
    
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
};

async function handlePaymentCaptured(paymentEntity) {
  const payment = await Payment.findOne({ razorpayOrderId: paymentEntity.order_id });
  
  if (payment && payment.status !== 'success') {
    payment.status = 'success';
    payment.razorpayPaymentId = paymentEntity.id;
    payment.paidAt = new Date();
    await payment.save();
    
    await processPurchase(payment);
  }
}

async function handlePaymentFailed(paymentEntity) {
  const payment = await Payment.findOne({ razorpayOrderId: paymentEntity.order_id });
  
  if (payment) {
    payment.status = 'failed';
    await payment.save();
  }
}

async function handleRefund(paymentEntity) {
  const payment = await Payment.findOne({ razorpayPaymentId: paymentEntity.payment_id });
  
  if (payment) {
    payment.status = 'refunded';
    payment.refundedAt = new Date();
    await payment.save();
    
    // TODO: Reverse the purchase (remove booster, etc.)
  }
}

// Get Payment History
exports.getPaymentHistory = async (req, res) => {
  try {
    const userId = req.userId;
    
    const payments = await Payment.find({ userId })
      .sort({ createdAt: -1 })
      .limit(50);
    
    res.json({ payments });
    
  } catch (error) {
    console.error('Get payment history error:', error);
    res.status(500).json({ error: 'Failed to get payment history' });
  }
};

// Get Razorpay Key (for frontend)
exports.getRazorpayKey = async (req, res) => {
  try {
    res.json({ keyId: razorpayConfig.keyId });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get key' });
  }
};
