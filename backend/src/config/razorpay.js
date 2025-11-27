const Razorpay = require('razorpay');

// Initialize Razorpay instance
const razorpayInstance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

// Razorpay configuration
const razorpayConfig = {
  keyId: process.env.RAZORPAY_KEY_ID,
  keySecret: process.env.RAZORPAY_KEY_SECRET,
  currency: 'INR',
  
  // Webhook secret for signature verification
  webhookSecret: process.env.RAZORPAY_WEBHOOK_SECRET,
  
  // Conversion rate: 1,000,000 BBN = ₹10
  bbnToInrRate: 10 / 1000000, // 0.00001 INR per BBN
  
  // Minimum withdrawal
  minWithdrawalINR: 20, // ₹20
  minWithdrawalBBN: 2000000, // 2M BBN
  
  // Withdrawal limits
  dailyWithdrawalSlots: 20,
  weeklyWithdrawalSlots: 100,
  
  // Payment options
  paymentMethods: {
    card: true,
    netbanking: true,
    wallet: true,
    upi: true,
    emi: false
  }
};

module.exports = {
  razorpayInstance,
  razorpayConfig
};
