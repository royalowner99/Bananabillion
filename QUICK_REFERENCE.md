# 🚀 BananaBillion - Quick Reference Guide

## 📋 Essential Commands

```bash
# Installation
npm install

# Development
npm run dev          # Start backend
npm run bot          # Start bot
npm run admin        # Start admin server

# Production
npm start            # Start backend
npm run bot          # Start bot

# Docker
docker-compose up -d              # Start all services
docker-compose down               # Stop all services
docker-compose logs -f backend    # View logs
```

## 🔑 Environment Variables (Required)

```env
# Database
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/bananabillion

# Telegram
BOT_TOKEN=1234567890:ABCdefGHIjklMNOpqrsTUVwxyz
BOT_USERNAME=YourBot_bot
WEBAPP_URL=https://your-app.onrender.com

# Security
JWT_SECRET=your_random_secret_key_here
ADMIN_TELEGRAM_IDS=123456789,987654321

# Server
PORT=3000
NODE_ENV=production
```

## 🎮 Game Configuration

```env
BASE_TAP_POWER=1              # Coins per tap
BASE_MAX_ENERGY=1000          # Starting energy
BASE_ENERGY_REGEN=1           # Energy/second
CRITICAL_BASE_CHANCE=0.05     # 5% crit chance
MAX_TAPS_PER_SECOND=15        # Anti-cheat limit
COMBO_TIMEOUT_MS=500          # Combo window (ms)
```

## 📡 API Endpoints

### Auth
```
POST /api/auth/telegram
Body: { initData, referrerId, ipAddress, deviceId }
```

### User
```
GET  /api/user/profile
POST /api/user/tap
     Body: { tapCount, timestamps }
POST /api/user/upgrade
     Body: { upgradeId }
GET  /api/user/upgrades
POST /api/user/daily
```

### Tasks
```
GET  /api/tasks/list
POST /api/tasks/complete
     Body: { taskId }
POST /api/tasks/create (admin)
     Body: { taskId, title, description, reward, type }
```

### Referrals
```
GET  /api/referrals/stats
POST /api/referrals/activate
     Body: { referrerId }
```

### Leaderboard
```
GET /api/leaderboard/:type
    Params: daily | weekly | global
GET /api/leaderboard/referral/top
```

### Withdrawals
```
POST /api/withdraw/request
     Body: { upiId, amount }
GET  /api/withdraw/history
POST /api/withdraw/update (admin)
     Body: { withdrawId, status, adminNote }
GET  /api/withdraw/pending (admin)
```

### Admin
```
GET  /api/admin/stats
GET  /api/admin/users?page=1&limit=50&search=
POST /api/admin/ban
     Body: { userId, reason }
POST /api/admin/unban
     Body: { userId }
POST /api/admin/balance
     Body: { userId, amount }
POST /api/admin/broadcast
     Body: { message }
```

## 🤖 Bot Commands

```
/start              - Start game + referral
/balance            - Check balance
/stats              - View statistics
/leaderboard        - Top 10 players
/help               - Command list
/broadcast <msg>    - Admin broadcast
```

## 🗄️ Database Models

### User
```javascript
{
  userId: String,
  username: String,
  balance: Number,
  totalEarned: Number,
  energy: Number,
  maxEnergy: Number,
  energyRegenRate: Number,
  tapPower: Number,
  criticalChance: Number,
  comboMultiplier: Number,
  autoMinerRate: Number,
  upgrades: {
    tapPower: Number,
    maxEnergy: Number,
    energyRegen: Number,
    criticalChance: Number,
    comboMultiplier: Number,
    autoMiner: Number,
    streakBoost: Number,
    offlineEarnings: Number
  },
  referredBy: String,
  referralCount: Number,
  dailyStreak: Number,
  lastDailyClaim: Date,
  totalTaps: Number,
  isBanned: Boolean
}
```

### Referral
```javascript
{
  inviterId: String,
  invitedId: String,
  rewardGiven: Number,
  isActive: Boolean,
  totalEarningsFromInvited: Number
}
```

### Task
```javascript
{
  taskId: String,
  title: String,
  description: String,
  reward: Number,
  type: String, // 'daily' | 'one-time' | 'cooldown' | 'partner'
  cooldownSeconds: Number,
  icon: String,
  link: String,
  isActive: Boolean
}
```

### Withdraw
```javascript
{
  userId: String,
  upiId: String,
  amount: Number,
  status: String, // 'pending' | 'approved' | 'rejected' | 'completed'
  adminNote: String,
  processedBy: String
}
```

## 🎯 Upgrade System

```javascript
// Upgrade IDs
'tapPower'          // Increase tap power
'maxEnergy'         // Increase max energy
'energyRegen'       // Increase regen rate
'criticalChance'    // Increase crit chance
'comboMultiplier'   // Increase combo bonus
'autoMiner'         // Increase passive income
'streakBoost'       // Increase daily rewards
'offlineEarnings'   // Increase offline income

// Price Formula
price = basePrice * (priceMultiplier ^ currentLevel)

// Example
tapPower: {
  basePrice: 100,
  priceMultiplier: 1.5,
  effect: (level) => level,
  maxLevel: 100
}
```

## 🎁 Daily Rewards

```javascript
Day 1: 100 coins
Day 2: 200 coins
Day 3: 300 coins
Day 4: 500 coins
Day 5: 800 coins
Day 6: 1200 coins
Day 7: 2000 coins + bonus
```

## 🔒 Rate Limits

```javascript
General API:    100 requests/minute
Tap Endpoint:   20 requests/second
Auth Endpoint:  10 requests/15 minutes
Withdraw:       5 requests/hour
```

## 🛡️ Security Checklist

```
✅ Telegram initData validation
✅ JWT token authentication
✅ Rate limiting enabled
✅ Input sanitization
✅ MongoDB injection prevention
✅ XSS protection
✅ CSRF protection
✅ Helmet security headers
✅ Anti-cheat timestamp validation
✅ Server-side reward calculation
```

## 📊 Admin Panel Access

```
URL: https://your-app.onrender.com/admin/index.html
Auth: Enter JWT token from Telegram auth
```

## 🐛 Troubleshooting

### Bot not responding
```bash
# Check bot token
echo $BOT_TOKEN

# Check bot logs
npm run bot

# Verify bot is running
ps aux | grep node
```

### Database connection failed
```bash
# Test connection
mongosh "$MONGODB_URI"

# Check IP whitelist
# MongoDB Atlas → Network Access → 0.0.0.0/0

# Verify credentials
# Check username and password in connection string
```

### Frontend not loading
```bash
# Check backend is running
curl http://localhost:3000/api/user/profile

# Check WEBAPP_URL
echo $WEBAPP_URL

# View browser console
# F12 → Console tab
```

### Energy not regenerating
```javascript
// Check energyRegenRate
console.log(userData.energyRegenRate);

// Verify interval is running
// Should update every 100ms

// Check for errors in console
```

## 📈 Monitoring

### Check Logs
```bash
# Render Dashboard
# → Your Service → Logs tab

# Local logs
npm start 2>&1 | tee app.log

# Docker logs
docker-compose logs -f
```

### Database Metrics
```
MongoDB Atlas → Metrics tab
- Connections
- Operations
- Storage
- Network
```

### Health Check
```bash
# Backend health
curl http://localhost:3000/api/user/profile

# Expected: 401 Unauthorized (means server is up)
```

## 🚀 Deployment Checklist

```
✅ MongoDB Atlas cluster created
✅ Database user created
✅ IP whitelist configured (0.0.0.0/0)
✅ Telegram bot created (@BotFather)
✅ Bot token obtained
✅ .env file configured
✅ Code pushed to GitHub
✅ Render services created
✅ Environment variables set
✅ Services deployed
✅ Bot menu button configured
✅ Admin IDs set
✅ Test in Telegram
```

## 💡 Quick Tips

### Generate JWT Secret
```bash
openssl rand -base64 32
```

### Get Telegram User ID
```
Message @userinfobot on Telegram
```

### Test API Locally
```bash
# Auth
curl -X POST http://localhost:3000/api/auth/telegram \
  -H "Content-Type: application/json" \
  -d '{"initData":"..."}'

# Profile (with token)
curl http://localhost:3000/api/user/profile \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Reset Database
```javascript
// In MongoDB shell
use bananabillion
db.users.deleteMany({})
db.referrals.deleteMany({})
db.tasks.deleteMany({})
db.withdraws.deleteMany({})
```

### Update Game Config
```bash
# Edit .env
nano .env

# Restart services
npm start
npm run bot
```

## 📞 Support Resources

### Documentation
- README.md - Overview
- SETUP.md - Setup guide
- DEPLOYMENT.md - Deployment guide
- FEATURES.md - Feature list
- PROJECT_SUMMARY.md - Complete summary

### External Resources
- Telegram Bots: https://core.telegram.org/bots
- MongoDB Atlas: https://www.mongodb.com/docs/atlas/
- Render: https://render.com/docs
- Node.js: https://nodejs.org/docs

## 🎯 Common Tasks

### Add New Task
```javascript
// Via API (admin)
POST /api/tasks/create
{
  "taskId": "new_task",
  "title": "New Task",
  "description": "Complete this task",
  "reward": 500,
  "type": "one-time",
  "icon": "🎯"
}
```

### Ban User
```javascript
// Via API (admin)
POST /api/admin/ban
{
  "userId": "123456789",
  "reason": "Cheating detected"
}
```

### Broadcast Message
```javascript
// Via API (admin)
POST /api/admin/broadcast
{
  "message": "🎉 New update available!"
}

// Or via bot
/broadcast 🎉 New update available!
```

### Check User Stats
```bash
# Via MongoDB
db.users.findOne({ userId: "123456789" })

# Via API
GET /api/user/profile
Authorization: Bearer USER_TOKEN
```

## 🔄 Update Workflow

```bash
# 1. Make changes locally
nano backend/src/config/game.js

# 2. Test locally
npm run dev

# 3. Commit changes
git add .
git commit -m "Update game config"

# 4. Push to GitHub
git push origin main

# 5. Render auto-deploys
# Or manually deploy from dashboard
```

## 💰 Cost Calculator

### Free Tier
```
MongoDB Atlas M0:     $0/month
Render Web Service:   $0/month (750 hours)
Render Worker:        $0/month (750 hours)
Telegram Bot:         $0/month
Total:                $0/month ✅
```

### Paid Tier (Recommended for 10k+ users)
```
MongoDB M2:           $9/month
Render Starter:       $7/month
Render Worker:        $7/month
Total:                $23/month
```

## 🎉 Launch Checklist

```
✅ All services deployed
✅ Bot responding to /start
✅ Game loads in Telegram
✅ Tapping works
✅ Energy regenerates
✅ Upgrades purchasable
✅ Tasks completable
✅ Referrals working
✅ Leaderboard showing
✅ Admin panel accessible
✅ Withdrawals requestable
✅ No errors in logs
✅ Performance acceptable
✅ Security verified
✅ Ready to launch! 🚀
```

---

**Quick Reference Version**: 1.0
**Last Updated**: 2024
**Status**: Production Ready ✅
