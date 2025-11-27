# 🍌 BillionBanana - Razorpay Integration Guide

## 📋 What I'm Building

I'm creating a complete monetization system with:
1. ✅ Enhanced User Model (BBN, XP, Levels, Boosters)
2. ✅ Booster Products Model
3. ✅ Payment & Withdrawal Models
4. ✅ Razorpay Configuration
5. 🔄 Payment Controller (in progress)
6. 🔄 Booster System
7. 🔄 Withdrawal System
8. 🔄 Frontend Integration

## 🔑 Razorpay Setup Required

### Step 1: Create Razorpay Account
1. Go to https://razorpay.com
2. Sign up for business account
3. Complete KYC verification
4. Get API keys from Dashboard

### Step 2: Get API Credentials
```
Dashboard → Settings → API Keys → Generate Keys

You'll get:
- Key ID: rzp_test_XXXXXXXXXXXXX (for testing)
- Key Secret: XXXXXXXXXXXXXXXXXXXXXXXX

For production:
- Key ID: rzp_live_XXXXXXXXXXXXX
- Key Secret: XXXXXXXXXXXXXXXXXXXXXXXX
```

### Step 3: Add to Environment Variables

Add these to your `.env` file and Render:

```env
# Razorpay Configuration
RAZORPAY_KEY_ID=rzp_test_XXXXXXXXXXXXX
RAZORPAY_KEY_SECRET=XXXXXXXXXXXXXXXXXXXXXXXX
RAZORPAY_WEBHOOK_SECRET=XXXXXXXXXXXXXXXXXXXXXXXX

# For production, use live keys:
# RAZORPAY_KEY_ID=rzp_live_XXXXXXXXXXXXX
# RAZORPAY_KEY_SECRET=XXXXXXXXXXXXXXXXXXXXXXXX
```

### Step 4: Enable Payment Methods

In Razorpay Dashboard:
1. Go to Settings → Payment Methods
2. Enable:
   - ✅ UPI
   - ✅ Cards (Debit/Credit)
   - ✅ Net Banking
   - ✅ Wallets (Paytm, PhonePe, etc.)

### Step 5: Setup Webhooks

1. Go to Settings → Webhooks
2. Add webhook URL: `https://your-app.onrender.com/api/payment/webhook`
3. Select events:
   - ✅ payment.authorized
   - ✅ payment.captured
   - ✅ payment.failed
   - ✅ refund.created
4. Copy webhook secret

### Step 6: Enable Payouts (For Withdrawals)

1. Go to Dashboard → Payouts
2. Complete additional KYC
3. Add bank account
4. Enable UPI payouts
5. Get payout API access

## 💰 Pricing Structure

### Free Boosters (Ad-Based)
- **Turbo**: 2× mining for 30s (watch 1 ad)
- **Energy Refill**: Restore 1,000 energy (watch 1 ad)
- **Lucky Banana**: Random 200-2,000 BBN (watch 1 ad)

### Paid Boosters

#### 1. VIP Auto-Miner - ₹49/month
```javascript
{
  boosterId: 'vip_auto_miner',
  name: 'VIP Auto-Miner',
  price: 49,
  type: 'paid_subscription',
  subscriptionPeriod: 'monthly',
  effect: {
    autoMinerRate: 0.33, // 1 coin every 3 seconds
    xpMultiplier: 2
  }
}
```

#### 2. Super Energy - ₹29 (One-time)
```javascript
{
  boosterId: 'super_energy',
  name: 'Super Energy',
  price: 29,
  type: 'paid_onetime',
  effect: {
    energyBonus: 4000 // Max energy 1000 → 5000
  }
}
```

#### 3. Time Booster - ₹99/month
```javascript
{
  boosterId: 'time_booster',
  name: 'Time Booster',
  price: 99,
  type: 'paid_subscription',
  subscriptionPeriod: 'monthly',
  effect: {
    energyRegenBonus: 25 // 30s → 5s (reduce by 25s)
  }
}
```

#### 4. Mega Turbo - ₹49 (3 uses/day)
```javascript
{
  boosterId: 'mega_turbo',
  name: 'Mega Turbo',
  price: 49,
  type: 'paid_onetime',
  effect: {
    tapMultiplier: 3
  },
  duration: 60, // 60 seconds
  uses: 3 // 3 uses per day
}
```

#### 5. Mega Booster - ₹149 (Permanent)
```javascript
{
  boosterId: 'mega_booster',
  name: 'Mega Booster',
  price: 149,
  type: 'paid_onetime',
  effect: {
    miningSpeedBonus: 20, // +20% permanent
    xpMultiplier: 1.1 // +10% XP
  },
  duration: 0 // Permanent
}
```

### Shop Items

#### Wheel Spin - ₹10/spin
```javascript
{
  itemId: 'wheel_spin',
  name: 'Wheel Spin',
  price: 10,
  prizes: [
    { reward: 500, probability: 0.30 },
    { reward: 1000, probability: 0.25 },
    { reward: 2000, probability: 0.20 },
    { reward: 5000, probability: 0.15 },
    { reward: 10000, probability: 0.09 },
    { reward: 25000, probability: 0.01 } // Jackpot!
  ]
}
```

#### Mystery Box - ₹49
```javascript
{
  itemId: 'mystery_box',
  name: 'Mystery Box',
  price: 49,
  guaranteedRewards: [
    { type: 'bbn', amount: 10000 },
    { type: 'vip', days: 7 },
    { type: 'booster', boosterId: 'mega_booster' },
    { type: 'icon', iconId: 'rare_golden_banana' }
  ]
}
```

#### Banana Pass - ₹79/month
```javascript
{
  itemId: 'banana_pass',
  name: 'Banana Pass',
  price: 79,
  type: 'subscription',
  subscriptionPeriod: 'monthly',
  benefits: [
    'Extra rewards per level',
    'Exclusive skins',
    'Double daily bonus',
    'Priority support'
  ]
}
```

## 🔄 Payment Flow

### Purchase Flow:
```
1. User clicks "Buy VIP Auto-Miner"
   ↓
2. Frontend calls: POST /api/payment/create-order
   Body: { itemType: 'vip_auto_miner', amount: 49 }
   ↓
3. Backend creates Razorpay order
   ↓
4. Frontend opens Razorpay checkout
   ↓
5. User completes payment
   ↓
6. Razorpay sends webhook to backend
   ↓
7. Backend verifies payment
   ↓
8. Backend activates booster for user
   ↓
9. User gets VIP status + auto-miner
```

### Withdrawal Flow:
```
1. User has 2,000,000 BBN (₹20)
   ↓
2. User clicks "Withdraw"
   ↓
3. Frontend calls: POST /api/withdrawal/request
   Body: { bbnAmount: 2000000, upiId: 'user@upi' }
   ↓
4. Backend validates:
   - User has enough BBN
   - Meets minimum (₹20)
   - Within daily limits
   - Revenue available
   ↓
5. Creates withdrawal request (status: pending)
   ↓
6. Admin reviews in dashboard
   ↓
7. Admin approves
   ↓
8. Backend initiates Razorpay payout
   ↓
9. Money sent to user's UPI
   ↓
10. Status updated to completed
```

## 📊 Revenue Tracking

### Income Sources:
```javascript
{
  ads: {
    views: 1000,
    revenue: 1500 // ₹1.50 per ad
  },
  boosters: {
    vip: 490, // 10 users × ₹49
    superEnergy: 290, // 10 users × ₹29
    timeBooster: 990, // 10 users × ₹99
    megaTurbo: 490, // 10 users × ₹49
    megaBooster: 1490 // 10 users × ₹149
  },
  shop: {
    wheelSpins: 500, // 50 spins × ₹10
    mysteryBoxes: 980, // 20 boxes × ₹49
    bananaPass: 790 // 10 passes × ₹79
  },
  total: 7520 // Total revenue
}
```

### Withdrawal Pool:
```javascript
{
  totalRevenue: 7520,
  withdrawalPool: 4512, // 60% of revenue
  profit: 3008, // 40% profit
  pendingWithdrawals: 2000,
  availableForWithdrawal: 2512
}
```

## 🔐 Security Measures

### Payment Verification:
```javascript
// Verify Razorpay signature
const crypto = require('crypto');

const generatedSignature = crypto
  .createHmac('sha256', razorpayKeySecret)
  .update(orderId + '|' + paymentId)
  .digest('hex');

if (generatedSignature === razorpaySignature) {
  // Payment is genuine
  activateBooster(userId, boosterId);
}
```

### Anti-Fraud:
- Rate limiting on purchases
- IP tracking
- Device fingerprinting
- Suspicious activity detection
- Manual review for large withdrawals

## 📱 Frontend Integration

### Razorpay Checkout:
```javascript
// Load Razorpay script
<script src="https://checkout.razorpay.com/v1/checkout.js"></script>

// Open checkout
const options = {
  key: 'rzp_test_XXXXXXXXXXXXX',
  amount: 4900, // ₹49 in paise
  currency: 'INR',
  name: 'BillionBanana',
  description: 'VIP Auto-Miner',
  order_id: 'order_XXXXXXXXXXXXX',
  handler: function(response) {
    // Payment successful
    verifyPayment(response);
  },
  prefill: {
    name: user.firstName,
    contact: user.phone
  },
  theme: {
    color: '#FFD700'
  }
};

const rzp = new Razorpay(options);
rzp.open();
```

## 🧪 Testing

### Test Cards (Razorpay Test Mode):
```
Success:
Card: 4111 1111 1111 1111
CVV: Any 3 digits
Expiry: Any future date

Failure:
Card: 4000 0000 0000 0002
```

### Test UPI:
```
Success: success@razorpay
Failure: failure@razorpay
```

## 🚀 Next Steps

1. ✅ Models created
2. ✅ Razorpay config created
3. 🔄 Create payment controller
4. 🔄 Create booster controller
5. 🔄 Create withdrawal controller
6. 🔄 Create admin dashboard
7. 🔄 Frontend integration
8. 🔄 Testing
9. 🔄 Deploy

## ⚠️ Important Notes

1. **Start with Test Mode**: Use test keys until everything works
2. **KYC Required**: Complete Razorpay KYC for live mode
3. **GST**: Add GST to prices if applicable
4. **Terms**: Create clear terms & conditions
5. **Support**: Set up customer support for payment issues
6. **Refunds**: Have a clear refund policy

## 📞 Support

If payment issues occur:
1. Check Razorpay dashboard for payment status
2. Verify webhook is receiving events
3. Check server logs
4. Contact Razorpay support if needed

---

**Status**: Core models and config created. Next: Building controllers and API endpoints.
