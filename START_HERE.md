# 🚀 BananaBillion - Your Configured Project

## ✅ Your Configuration

Your project is now configured with your credentials:

### MongoDB Atlas
- **Database**: bananabillion
- **Cluster**: bananabillion.vj7geqo.mongodb.net
- **Username**: ubaid
- **Status**: ✅ Configured

### Telegram Bot
- **Bot Username**: @banabillionbot
- **Bot Link**: https://t.me/banabillionbot
- **Token**: Configured ✅
- **Status**: Ready to use

### Admin Access
- **Admin Telegram ID**: 5866442043
- **Admin Username**: @chiefhacks_official
- **Status**: ✅ Configured

---

## 🎯 Quick Start (3 Steps)

### Step 1: Install Dependencies (2 minutes)
```bash
npm install
```

### Step 2: Test Locally (Optional)
```bash
# Terminal 1 - Start Backend
npm run dev

# Terminal 2 - Start Bot
npm run bot
```

Access locally at: http://localhost:3000

### Step 3: Deploy to Render (15 minutes)

#### A. Push to GitHub
```bash
git init
git add .
git commit -m "Initial commit - BananaBillion"
git branch -M main
git remote add origin YOUR_GITHUB_REPO_URL
git push -u origin main
```

#### B. Deploy Backend on Render
1. Go to https://render.com
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Configure:
   - **Name**: bananabillion-backend
   - **Environment**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: Free

5. Add Environment Variables (copy from .env file):
   ```
   MONGODB_URI=mongodb+srv://ubaid:ubaid@786@bananabillion.vj7geqo.mongodb.net/bananabillion?retryWrites=true&w=majority&appName=BananaBillion
   BOT_TOKEN=8002962453:AAHHubn1GewH71SSP7k-z5iDbAb0obxz34k
   BOT_USERNAME=banabillionbot
   WEBAPP_URL=https://bananabillion-backend.onrender.com
   JWT_SECRET=bananabillion_super_secret_jwt_key_2024_change_this_in_production
   ADMIN_TELEGRAM_IDS=5866442043
   NODE_ENV=production
   BASE_TAP_POWER=1
   BASE_MAX_ENERGY=1000
   BASE_ENERGY_REGEN=1
   CRITICAL_BASE_CHANCE=0.05
   MAX_TAPS_PER_SECOND=15
   COMBO_TIMEOUT_MS=500
   ```

6. Click "Create Web Service"
7. Wait for deployment (5-10 minutes)
8. Copy your Render URL (e.g., https://bananabillion-backend.onrender.com)

#### C. Deploy Bot Worker on Render
1. Click "New +" → "Background Worker"
2. Select same repository
3. Configure:
   - **Name**: bananabillion-bot
   - **Environment**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm run bot`
   - **Plan**: Free

4. Add same environment variables as backend
5. Click "Create Background Worker"

#### D. Update WEBAPP_URL
1. Go back to backend service
2. Update `WEBAPP_URL` environment variable with your actual Render URL
3. Restart service

---

## 🤖 Configure Telegram Bot Menu Button

1. Open Telegram and message @BotFather
2. Send: `/setmenubutton`
3. Select your bot: @banabillionbot
4. Send: "Configure Menu Button"
5. Button text: `🎮 Play Game`
6. Web App URL: `https://your-actual-render-url.onrender.com`
7. Done! ✅

---

## 🧪 Test Your Game

1. Open Telegram
2. Search for: @banabillionbot
3. Send: `/start`
4. Click "🎮 Play Game" button
5. Game should load!
6. Try tapping the banana 🍌
7. Check if energy decreases
8. Check if balance increases

---

## 📊 Access Admin Panel

1. Open your game in Telegram
2. Get your JWT token from browser console (F12)
3. Go to: `https://your-render-url.onrender.com/admin/index.html`
4. Enter your JWT token
5. Access admin dashboard!

Or use your Telegram ID (5866442043) to authenticate.

---

## 🔧 Important Next Steps

### 1. Update MongoDB IP Whitelist
1. Go to MongoDB Atlas: https://cloud.mongodb.com
2. Click "Network Access" in left sidebar
3. Click "Add IP Address"
4. Click "Allow Access from Anywhere" (0.0.0.0/0)
5. Click "Confirm"

### 2. Verify Database Connection
```bash
# Test locally
npm run dev

# Check logs for:
# ✅ MongoDB Connected: bananabillion.vj7geqo.mongodb.net
```

### 3. Update Bot Menu Button URL
After deploying to Render, update the WebApp URL in @BotFather with your actual Render URL.

---

## 📱 Bot Commands

Your users can use these commands:
- `/start` - Start game & get referral link
- `/balance` - Check balance
- `/stats` - View statistics
- `/leaderboard` - Top 10 players
- `/help` - Show help

Admin commands (only for you):
- `/broadcast <message>` - Send message to all users

---

## 🎮 Game Features Ready to Use

✅ **Tap-to-Earn** - Tap the banana to earn coins
✅ **Energy System** - 1000 energy, regenerates automatically
✅ **8 Upgrades** - Tap power, energy, regen, crit, combo, auto-miner, streak, offline
✅ **Daily Rewards** - 7-day streak system
✅ **Referral System** - Earn 20% from friends
✅ **Tasks** - 5 default tasks included
✅ **Leaderboards** - Daily, weekly, global
✅ **Auto-Mining** - Passive income
✅ **Withdrawals** - UPI-based (admin approval)
✅ **Admin Panel** - Full management dashboard

---

## 🐛 Troubleshooting

### Bot not responding?
```bash
# Check bot is running
npm run bot

# Check token is correct
echo $BOT_TOKEN
```

### Database connection failed?
1. Check MongoDB Atlas IP whitelist (0.0.0.0/0)
2. Verify username and password in connection string
3. Check cluster is running

### Frontend not loading?
1. Verify WEBAPP_URL matches your Render URL
2. Check backend is running
3. Check browser console for errors

### Game not working in Telegram?
1. Must be opened from Telegram (not browser)
2. Check bot menu button URL is correct
3. Verify backend is deployed and running

---

## 📞 Support

If you need help:
1. Check the logs (Render Dashboard → Logs)
2. Review error messages
3. Check MongoDB Atlas metrics
4. Verify all environment variables

---

## 🎉 You're All Set!

Your BananaBillion game is configured and ready to deploy!

**Next Steps:**
1. ✅ Install dependencies: `npm install`
2. ✅ Test locally (optional): `npm run dev`
3. ✅ Push to GitHub
4. ✅ Deploy to Render
5. ✅ Configure bot menu button
6. ✅ Test in Telegram
7. ✅ Launch! 🚀

**Your Bot**: https://t.me/banabillionbot
**Admin ID**: 5866442043 (@chiefhacks_official)

---

## 💰 Cost

**FREE TIER:**
- MongoDB Atlas: $0/month
- Render Backend: $0/month
- Render Bot: $0/month
- **Total: $0/month** ✅

---

## 🚀 Ready to Launch!

Everything is configured with your credentials. Just follow the 3 steps above and you'll be live!

Good luck with your game! 🍌🎮

---

**Project**: BananaBillion
**Status**: ✅ Configured & Ready
**Your Bot**: @banabillionbot
**Admin**: @chiefhacks_official
