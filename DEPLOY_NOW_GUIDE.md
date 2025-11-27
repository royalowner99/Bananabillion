# 🚀 BananaBillion - Complete Deployment Guide

## Prerequisites Checklist
- ✅ GitHub account
- ✅ Render account (free tier)
- ✅ MongoDB Atlas account (free tier)
- ✅ Telegram Bot Token from @BotFather
- ✅ Your Telegram User ID

---

## Step 1: MongoDB Atlas Setup (5 minutes)

### 1.1 Create Database
1. Go to https://www.mongodb.com/cloud/atlas
2. Sign up/Login (free)
3. Click **"Create"** → **"Shared"** (Free tier)
4. Choose **AWS** provider
5. Select closest region
6. Cluster Name: `BananaBillion`
7. Click **"Create Cluster"**

### 1.2 Create Database User
1. Go to **"Database Access"** (left sidebar)
2. Click **"Add New Database User"**
3. Username: `bananabillion`
4. Password: Click **"Autogenerate Secure Password"** → **COPY IT!**
5. Database User Privileges: **"Read and write to any database"**
6. Click **"Add User"**

### 1.3 Whitelist All IPs
1. Go to **"Network Access"** (left sidebar)
2. Click **"Add IP Address"**
3. Click **"Allow Access from Anywhere"**
4. IP Address: `0.0.0.0/0`
5. Click **"Confirm"**

### 1.4 Get Connection String
1. Go to **"Database"** → Click **"Connect"**
2. Choose **"Connect your application"**
3. Driver: **Node.js**, Version: **5.5 or later**
4. Copy the connection string
5. Replace `<password>` with your actual password
6. Replace `<dbname>` with `bananabillion`

**Example:**
```
mongodb+srv://bananabillion:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/bananabillion?retryWrites=true&w=majority
```

---

## Step 2: Telegram Bot Setup (3 minutes)

### 2.1 Create Bot
1. Open Telegram
2. Search for **@BotFather**
3. Send `/newbot`
4. Bot name: `BananaBillion`
5. Bot username: `bananabillion_bot` (must end with _bot)
6. **COPY THE TOKEN** (looks like: `1234567890:ABCdefGHIjklMNOpqrsTUVwxyz`)

### 2.2 Get Your Telegram User ID
1. Search for **@userinfobot** on Telegram
2. Send `/start`
3. **COPY YOUR ID** (e.g., `1526312302`)

---

## Step 3: Deploy to Render (10 minutes)

### 3.1 Push to GitHub
```bash
# Initialize git (if not already)
git init
git add .
git commit -m "Initial commit - BananaBillion ready for deployment"

# Create new repo on GitHub, then:
git remote add origin https://github.com/YOUR_USERNAME/bananabillion.git
git branch -M main
git push -u origin main
```

### 3.2 Deploy Backend on Render

1. Go to https://render.com
2. Sign up/Login with GitHub
3. Click **"New +"** → **"Web Service"**
4. Connect your GitHub repository
5. Select `bananabillion` repo

**Configuration:**
- **Name:** `bananabillion-backend`
- **Region:** Choose closest to you
- **Branch:** `main`
- **Root Directory:** (leave empty)
- **Environment:** `Node`
- **Build Command:** `npm install`
- **Start Command:** `npm start`
- **Plan:** `Free`

### 3.3 Add Environment Variables

Click **"Advanced"** → **"Add Environment Variable"**

Add these one by one:

```bash
# MongoDB
MONGODB_URI=mongodb+srv://bananabillion:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/bananabillion?retryWrites=true&w=majority

# Server
PORT=3000
NODE_ENV=production

# Telegram Bot
BOT_TOKEN=YOUR_BOT_TOKEN_FROM_BOTFATHER
BOT_USERNAME=bananabillion_bot
WEBAPP_URL=https://bananabillion-backend.onrender.com

# JWT Secret (generate random string)
JWT_SECRET=banana_billion_secret_key_2024_random_string

# Admin
ADMIN_PASSWORD=your_secure_admin_password
ADMIN_TELEGRAM_IDS=YOUR_TELEGRAM_USER_ID

# Game Config
BASE_TAP_POWER=1
BASE_MAX_ENERGY=1000
BASE_ENERGY_REGEN=1
CRITICAL_BASE_CHANCE=0.05
MAX_TAPS_PER_SECOND=15
COMBO_TIMEOUT_MS=500

# BBN System
BBN_TOTAL_SUPPLY=100000000
BBN_DAILY_MINING_LIMIT=1500
BBN_TO_INR_RATE=0.00001

# Razorpay (Optional - for payments)
RAZORPAY_KEY_ID=your_razorpay_key
RAZORPAY_KEY_SECRET=your_razorpay_secret
```

**Important:** Replace:
- `YOUR_PASSWORD` with MongoDB password
- `YOUR_BOT_TOKEN_FROM_BOTFATHER` with actual bot token
- `YOUR_TELEGRAM_USER_ID` with your Telegram ID
- `your_secure_admin_password` with a strong password

6. Click **"Create Web Service"**
7. Wait 5-10 minutes for deployment
8. **COPY YOUR URL** (e.g., `https://bananabillion-backend.onrender.com`)

### 3.4 Update WEBAPP_URL

1. Go back to your service
2. Click **"Environment"**
3. Find `WEBAPP_URL`
4. Update it with your actual Render URL
5. Click **"Save Changes"**
6. Service will auto-redeploy

### 3.5 Deploy Bot Worker

1. Click **"New +"** → **"Background Worker"**
2. Select same repository
3. **Name:** `bananabillion-bot`
4. **Build Command:** `npm install`
5. **Start Command:** `npm run bot`
6. Add same environment variables as backend
7. Click **"Create Background Worker"**

---

## Step 4: Configure Telegram Bot (2 minutes)

### 4.1 Set Menu Button
1. Open Telegram, message **@BotFather**
2. Send `/setmenubutton`
3. Choose your bot
4. Send **"Configure Menu Button"**
5. Button text: `🎮 Play Game`
6. Web App URL: `https://bananabillion-backend.onrender.com`

### 4.2 Set Bot Commands
Send to @BotFather:
```
/setcommands
```
Choose your bot, then paste:
```
start - Start the game
balance - Check your balance
stats - View your statistics
leaderboard - See top players
help - Get help
```

### 4.3 Set Bot Description
```
/setdescription
```
Choose your bot, then paste:
```
🍌 BananaBillion - Tap to Earn Game!

Tap the banana, earn coins, upgrade your power, complete tasks, and invite friends!

Features:
⚡ Tap-to-earn gameplay
💎 Upgrade system
🎯 Daily tasks
👥 Referral rewards
🏆 Leaderboards
💰 Withdraw earnings

Start playing now!
```

---

## Step 5: Initialize Database (1 minute)

### 5.1 Run Task Initialization
1. Go to your Render backend service
2. Click **"Shell"** tab
3. Run:
```bash
npm run init-tasks
```

This will create default tasks in your database.

---

## Step 6: Test Your Game! 🎮

### 6.1 Test Bot
1. Open Telegram
2. Search for your bot: `@bananabillion_bot`
3. Send `/start`
4. Click **"🎮 Play Game"** button
5. Game should load!

### 6.2 Test Features
- ✅ Tap the banana
- ✅ Check balance updates
- ✅ Energy decreases and regenerates
- ✅ Navigate between tabs
- ✅ Check tasks
- ✅ View leaderboard
- ✅ Test referral link

### 6.3 Test Admin Panel
1. Open game
2. Navigate to **Profile** tab
3. If you're admin (your ID in ADMIN_TELEGRAM_IDS), you'll see **Admin** tab
4. Test admin features

---

## Step 7: Monitor & Maintain

### 7.1 Check Logs
**Backend Logs:**
1. Go to Render Dashboard
2. Click your backend service
3. Click **"Logs"** tab
4. Monitor for errors

**Bot Logs:**
1. Click your bot worker service
2. Click **"Logs"** tab
3. Check bot is running

### 7.2 Monitor Database
1. Go to MongoDB Atlas
2. Click **"Metrics"**
3. Monitor connections and operations

### 7.3 Free Tier Limitations
**Render Free Tier:**
- ⚠️ Services sleep after 15 minutes of inactivity
- ⚠️ 750 hours/month (enough for 1 service 24/7)
- ⚠️ First request after sleep takes 30-60 seconds

**MongoDB Free Tier:**
- ✅ 512 MB storage
- ✅ Shared RAM
- ✅ Enough for thousands of users

---

## Troubleshooting

### Issue: Bot not responding
**Solution:**
1. Check bot worker logs on Render
2. Verify BOT_TOKEN is correct
3. Restart bot worker

### Issue: Database connection failed
**Solution:**
1. Check MONGODB_URI is correct
2. Verify IP whitelist (0.0.0.0/0)
3. Check database user credentials

### Issue: Game not loading
**Solution:**
1. Check backend logs
2. Verify WEBAPP_URL matches your Render URL
3. Clear Telegram cache: Settings → Data and Storage → Clear Cache

### Issue: "Service Unavailable" after inactivity
**Solution:**
- This is normal on free tier
- Service wakes up in 30-60 seconds
- Consider upgrading to paid tier for 24/7 uptime

---

## Optional: Custom Domain

### Add Custom Domain (Optional)
1. Go to your Render service
2. Click **"Settings"**
3. Scroll to **"Custom Domain"**
4. Add your domain
5. Update DNS records as instructed
6. Update WEBAPP_URL and bot menu button

---

## Security Checklist

- ✅ Strong JWT_SECRET (random string)
- ✅ Strong ADMIN_PASSWORD
- ✅ MongoDB user with limited permissions
- ✅ Environment variables not in code
- ✅ CORS configured properly
- ✅ Rate limiting enabled
- ✅ Helmet security headers active

---

## Next Steps

1. **Promote Your Game:**
   - Share in Telegram groups
   - Post on social media
   - Create promotional content

2. **Monitor Performance:**
   - Check user growth
   - Monitor server resources
   - Track error rates

3. **Add Features:**
   - More tasks
   - Special events
   - New upgrades
   - Seasonal content

4. **Upgrade When Needed:**
   - More users = upgrade to paid tier
   - Better performance
   - No sleep time
   - More resources

---

## Support

If you encounter issues:
1. Check Render logs
2. Check MongoDB Atlas metrics
3. Review this guide
4. Check README.md for more details

---

## 🎉 Congratulations!

Your BananaBillion game is now live and ready for players!

**Your Game URL:** `https://bananabillion-backend.onrender.com`
**Your Bot:** `@bananabillion_bot`

Share it with friends and start earning! 🍌💰
