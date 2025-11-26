# 🚀 Complete Render Setup Guide - Step by Step

## 📋 What You Need to Setup in Render

You need to create **2 services** in Render:
1. **Web Service** (Backend) - Already done ✅
2. **Background Worker** (Bot) - Need to do this

---

## ✅ Part 1: Backend Web Service (Already Done)

Your backend is already deployed at: https://bananabillion.onrender.com

### Update WEBAPP_URL:

1. Go to: https://dashboard.render.com
2. Click on **"bananabillion"** service
3. Click **"Environment"** (left sidebar)
4. Find **"WEBAPP_URL"** variable
5. Click the **pencil icon** to edit
6. Change value to: `https://bananabillion.onrender.com`
7. Click **"Save Changes"**
8. Wait 1-2 minutes for restart

---

## 🤖 Part 2: Bot Background Worker (DO THIS NOW)

### Step 1: Create Background Worker

1. Go to: https://dashboard.render.com
2. Click **"New +"** button (top right)
3. Select **"Background Worker"**

### Step 2: Connect Repository

1. Find **"Bananabillion"** in the list
2. Click **"Connect"**

### Step 3: Configure the Worker

Fill in these fields:

**Name:**
```
bananabillion-bot
```

**Region:**
- Choose closest to you (e.g., Oregon, Frankfurt, Singapore)

**Branch:**
```
main
```

**Root Directory:**
- Leave empty

**Build Command:**
```
npm install
```

**Start Command:**
```
npm run bot
```

**Plan:**
- Select **"Free"**

### Step 4: Add Environment Variables

Click **"Advanced"** button, then scroll to **"Environment Variables"**

Add these **13 variables** one by one:

#### Variable 1:
- **Key:** `MONGODB_URI`
- **Value:** `mongodb+srv://ubaid:ubaid%40786@bananabillion.vj7geqo.mongodb.net/bananabillion?retryWrites=true&w=majority&appName=BananaBillion`

#### Variable 2:
- **Key:** `BOT_TOKEN`
- **Value:** `8002962453:AAHHubn1GewH71SSP7k-z5iDbAb0obxz34k`

#### Variable 3:
- **Key:** `BOT_USERNAME`
- **Value:** `banabillionbot`

#### Variable 4:
- **Key:** `WEBAPP_URL`
- **Value:** `https://bananabillion.onrender.com`

#### Variable 5:
- **Key:** `JWT_SECRET`
- **Value:** `bananabillion_super_secret_jwt_key_2024`

#### Variable 6:
- **Key:** `ADMIN_TELEGRAM_IDS`
- **Value:** `5866442043`

#### Variable 7:
- **Key:** `NODE_ENV`
- **Value:** `production`

#### Variable 8:
- **Key:** `BASE_TAP_POWER`
- **Value:** `1`

#### Variable 9:
- **Key:** `BASE_MAX_ENERGY`
- **Value:** `1000`

#### Variable 10:
- **Key:** `BASE_ENERGY_REGEN`
- **Value:** `1`

#### Variable 11:
- **Key:** `CRITICAL_BASE_CHANCE`
- **Value:** `0.05`

#### Variable 12:
- **Key:** `MAX_TAPS_PER_SECOND`
- **Value:** `15`

#### Variable 13:
- **Key:** `COMBO_TIMEOUT_MS`
- **Value:** `500`

### Step 5: Create the Worker

1. Scroll to bottom
2. Click **"Create Background Worker"**
3. Wait 5-10 minutes for deployment

### Step 6: Check Logs

1. After deployment, click on **"bananabillion-bot"**
2. Click **"Logs"** tab
3. Wait for these messages:
   - ✅ "MongoDB Connected"
   - ✅ "Bot started successfully"
   - ✅ "Bot username: @banabillionbot"

---

## 🗄️ Part 3: MongoDB Setup (CRITICAL!)

### Whitelist IP Address:

1. Go to: https://cloud.mongodb.com
2. Login to your account
3. Click **"Network Access"** (left sidebar)
4. Click **"Add IP Address"** (green button)
5. Click **"Allow Access from Anywhere"**
6. It will auto-fill: `0.0.0.0/0`
7. Description: `Render servers`
8. Click **"Confirm"**
9. Wait 1-2 minutes

**This is REQUIRED or nothing will work!**

---

## 🤖 Part 4: Configure Telegram Bot

### Set Menu Button:

1. Open **Telegram** app
2. Search for: **@BotFather**
3. Send: `/setmenubutton`
4. Select: **@banabillionbot**
5. Click: **"Configure Menu Button"**
6. For button text, send: `🎮 Play Game`
7. For Web App URL, send: `https://bananabillion.onrender.com`
8. Done!

---

## 🧪 Part 5: Test Everything

### Test 1: Check Render Services

Go to: https://dashboard.render.com

You should see **2 services**:
- ✅ **bananabillion** (Web Service) - Status: Live
- ✅ **bananabillion-bot** (Background Worker) - Status: Live

### Test 2: Check Bot Logs

1. Click on **"bananabillion-bot"**
2. Click **"Logs"**
3. Should see:
```
✅ MongoDB Connected: bananabillion.vj7geqo.mongodb.net
🤖 Bot started successfully
Bot username: @banabillionbot
```

### Test 3: Test Bot in Telegram

1. Open Telegram
2. Search: **@banabillionbot**
3. Send: `/start`
4. Bot should respond with:
   - Welcome message
   - Photo of banana
   - "🎮 Play Game" button

5. Click **"🎮 Play Game"**
6. Game should load!

---

## 🐛 Troubleshooting

### Issue 1: Bot Not Responding

**Check:**
1. Is bot worker deployed? (Dashboard → bananabillion-bot)
2. Is status "Live"? (Should be green)
3. Check logs for errors

**Fix:**
- If status is "Failed", check logs
- If "MongoDB connection failed", whitelist IP (0.0.0.0/0)
- If "Invalid token", check BOT_TOKEN variable

### Issue 2: Game Not Loading

**Check:**
1. Is backend deployed? (https://bananabillion.onrender.com)
2. Is WEBAPP_URL correct in both services?
3. Did you configure bot menu button?

**Fix:**
- Update WEBAPP_URL to `https://bananabillion.onrender.com`
- Reconfigure bot menu button with @BotFather
- Clear Telegram cache

### Issue 3: MongoDB Connection Failed

**Check:**
1. MongoDB Atlas → Network Access
2. Is 0.0.0.0/0 whitelisted?

**Fix:**
- Add 0.0.0.0/0 to Network Access
- Wait 2 minutes
- Restart services in Render

---

## 📊 Final Checklist

### Render Setup:
- [ ] Backend web service deployed ✅
- [ ] Backend URL: https://bananabillion.onrender.com ✅
- [ ] WEBAPP_URL updated in backend
- [ ] Bot background worker deployed
- [ ] All 13 environment variables added to bot
- [ ] Both services status: "Live"

### MongoDB Setup:
- [ ] Logged into MongoDB Atlas
- [ ] Network Access configured
- [ ] 0.0.0.0/0 IP whitelisted
- [ ] Waited 2 minutes

### Telegram Setup:
- [ ] Opened @BotFather
- [ ] Configured menu button
- [ ] Set Web App URL to https://bananabillion.onrender.com
- [ ] Tested /start command
- [ ] Game loads when clicking button

---

## 🎉 Success!

When everything is working, you should see:

**In Render Dashboard:**
- 2 services, both "Live" ✅

**In Telegram:**
- Bot responds to /start ✅
- Game loads when clicking button ✅
- Can tap banana and earn coins ✅

---

## 📞 Need Help?

If something doesn't work:

1. **Check Render logs** (most important!)
   - Dashboard → Service → Logs tab

2. **Check MongoDB**
   - Atlas → Network Access → 0.0.0.0/0

3. **Check environment variables**
   - Dashboard → Service → Environment tab

4. **Restart services**
   - Dashboard → Service → Manual Deploy → Deploy Latest Commit

---

## 🚀 You're Almost There!

Follow the steps above and your bot will be live in 10-15 minutes!

**Current Status:**
- ✅ Backend deployed
- ⏳ Bot worker - Need to deploy
- ⏳ MongoDB - Need to whitelist IP
- ⏳ Telegram - Need to configure menu button

**Do these 3 things and you're done!** 🎉
