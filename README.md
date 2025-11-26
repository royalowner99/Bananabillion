# 🍌 BananaBillion - Telegram Mini App Game

A complete, production-ready tap-to-earn game for Telegram with advanced features.

## 🚀 Features

- ⚡ Tap-to-Earn with combo & critical hits
- 🔋 Energy system with auto-regeneration
- 💎 Upgrade system (8+ categories)
- 🎁 Daily rewards with streak system
- 👥 Advanced referral system with anti-fraud
- 🎯 Task system (daily, cooldown, one-time)
- 🏆 Leaderboards (daily, weekly, global)
- ⛏️ Auto-mining passive income
- 💰 Withdrawal system
- 🛡️ Admin panel
- 🔐 Advanced security & anti-cheat

## 📦 Tech Stack

- **Backend**: Node.js + Express
- **Database**: MongoDB Atlas (Free Tier)
- **Bot**: Telegraf
- **Frontend**: HTML + TailwindCSS + Vanilla JS
- **Hosting**: Render (Free Tier)
- **Auth**: Telegram WebApp initData validation

## 🛠️ Installation

### 1. Clone & Install
```bash
npm install
```

### 2. MongoDB Atlas Setup
1. Go to https://www.mongodb.com/cloud/atlas
2. Create free account
3. Create cluster (M0 Free Tier)
4. Create database user
5. Whitelist IP: 0.0.0.0/0 (allow all)
6. Get connection string

### 3. Telegram Bot Setup
1. Message @BotFather on Telegram
2. Create new bot: `/newbot`
3. Get bot token
4. Set menu button: `/setmenubutton`
5. Choose your bot
6. Send "Configure Menu Button"
7. Button text: "🎮 Play Game"
8. Web App URL: Your Render URL

### 4. Environment Variables
Copy `.env.example` to `.env` and fill:
```bash
cp .env.example .env
```

Edit `.env` with your values.

### 5. Run Locally
```bash
# Backend
npm run dev

# Bot (separate terminal)
npm run bot

# Admin (separate terminal)
npm run admin
```

## 🚀 Deployment to Render

### Backend Deployment
1. Go to https://render.com
2. Sign up/Login
3. Click "New +" → "Web Service"
4. Connect your GitHub repo
5. Configure:
   - **Name**: bananabillion-backend
   - **Environment**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: Free
6. Add Environment Variables (from .env)
7. Click "Create Web Service"

### Bot Deployment
1. Click "New +" → "Background Worker"
2. Same repo
3. Configure:
   - **Name**: bananabillion-bot
   - **Build Command**: `npm install`
   - **Start Command**: `npm run bot`
   - **Plan**: Free
4. Add same Environment Variables
5. Click "Create Background Worker"

### Frontend Deployment
Frontend is served by backend at `/` route.
Access at: `https://your-app.onrender.com`

## 🎮 Game Configuration

Edit game parameters in `.env`:
- `BASE_TAP_POWER`: Coins per tap (default: 1)
- `BASE_MAX_ENERGY`: Starting energy (default: 1000)
- `BASE_ENERGY_REGEN`: Energy per second (default: 1)
- `CRITICAL_BASE_CHANCE`: Crit chance (default: 0.05 = 5%)
- `MAX_TAPS_PER_SECOND`: Anti-cheat limit (default: 15)

## 🔐 Admin Panel

Access: `https://your-app.onrender.com/admin`

Default features:
- View all users
- Ban/unban users
- Approve withdrawals
- Broadcast messages
- Create tasks
- Edit game variables

## 📱 Bot Commands

- `/start` - Start game & get referral link
- `/balance` - Check balance
- `/stats` - View statistics
- `/leaderboard` - Top players

## 🔒 Security Features

- ✅ Telegram initData validation
- ✅ JWT authentication
- ✅ Rate limiting (IP + User)
- ✅ Server-side reward calculation
- ✅ Anti-cheat timestamp validation
- ✅ Input sanitization
- ✅ MongoDB injection protection
- ✅ Helmet security headers

## 📊 API Endpoints

### Auth
- `POST /api/auth/telegram` - Authenticate user

### User
- `GET /api/user/profile` - Get user data
- `POST /api/user/tap` - Submit taps
- `POST /api/user/upgrade` - Purchase upgrade
- `POST /api/user/daily` - Claim daily reward

### Tasks
- `GET /api/tasks/list` - Get available tasks
- `POST /api/tasks/complete` - Complete task

### Referrals
- `POST /api/referrals/activate` - Activate referral
- `GET /api/referrals/stats` - Get referral stats

### Leaderboard
- `GET /api/leaderboard/:type` - Get leaderboard (daily/weekly/global)

### Withdraw
- `POST /api/withdraw/request` - Request withdrawal
- `GET /api/withdraw/history` - Get withdrawal history

## 🎯 Upgrade System

Categories:
1. **Tap Power** - Increase coins per tap
2. **Max Energy** - Increase energy capacity
3. **Energy Regen** - Faster energy recovery
4. **Critical Chance** - Higher crit probability
5. **Combo Multiplier** - Better combo rewards
6. **Auto Mining** - Passive income rate
7. **Streak Boost** - Daily reward multiplier
8. **Offline Earnings** - Earn while away

## 👥 Referral System

- Invite friends via unique link
- Earn 20% of friend's earnings
- Anti-fraud validation:
  - Must play 5+ minutes
  - Must complete 1+ task
  - IP/device duplicate check
- Incremental reward distribution

## 🎁 Daily Rewards

7-day streak system:
- Day 1: 100 coins
- Day 2: 200 coins
- Day 3: 300 coins
- Day 4: 500 coins
- Day 5: 800 coins
- Day 6: 1200 coins
- Day 7: 2000 coins + bonus

Miss a day = streak resets

## 📈 Leaderboard Types

1. **Daily** - Resets every 24h
2. **Weekly** - Resets every Monday
3. **Global** - All-time rankings

Sort by:
- Total balance
- Total earned
- Referral count

## 🐛 Troubleshooting

### Bot not responding
- Check BOT_TOKEN in .env
- Verify bot is running
- Check Render logs

### Database connection failed
- Verify MONGODB_URI
- Check IP whitelist (0.0.0.0/0)
- Verify database user credentials

### Frontend not loading
- Check WEBAPP_URL matches Render URL
- Verify CORS settings
- Check browser console

## 📝 License

MIT License - Free to use and modify

## 🤝 Support

For issues, check Render logs:
- Backend: Dashboard → Service → Logs
- Bot: Dashboard → Worker → Logs
