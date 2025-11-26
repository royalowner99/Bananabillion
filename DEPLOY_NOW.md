# 🚀 Deploy Your Bot NOW - Step by Step

## ⚠️ IMPORTANT: Why Local Won't Work

Telegram Mini Apps **MUST** be hosted online with HTTPS. You cannot run them from localhost (http://localhost:3000). That's why the mini app isn't working.

---

## 🎯 Quick Deploy (Follow These Steps)

### Step 1: Create GitHub Repository (5 minutes)

1. Go to: https://github.com/new
2. Repository name: `bananabillion`
3. Make it **Public**
4. **DO NOT** initialize with README
5. Click "Create repository"
6. Copy the repository URL (looks like: `https://github.com/yourusername/bananabillion.git`)

### Step 2: Push Your Code (2 minutes)

Run these commands (replace YOUR_REPO_URL with your actual URL):

```bash
git remote add origin YOUR_REPO_URL
git branch -M main
git push -u origin main
```

Example:
```bash
git remote add origin https://github.com/chiefhacks/bananabillion.git
git branch -M main
git push -u origin main
```

### Step 3: Deploy to Render (10 minutes)

#### A. Deploy Backend

1. Go to: https://render.com
2. Click "Sign Up" (use GitHub to sign up - it's easier)
3. After login, click "New +" → "Web Service"
4. Click "Connect GitHub" and authorize Render
5. Select your `bananabillion` repository
6. Configure:
   - **Name**: `bananabillion-backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: `Free`

7. Click "Advanced" and add these Environment Variables:

```
MONGODB_URI=mongodb+srv://ubaid:ubaid%40786@bananabillion.vj7geqo.mongodb.net/bananabillion?retryWrites=true&w=majority&appName=BananaBillion

BOT_TOKEN=8002962453:AAHHubn1GewH71SSP7k-z5iDbAb0obxz34k

BOT_USERNAME=banabillionbot

WEBAPP_URL=https://bananabillion-backend.onrender.com

JWT_SECRET=bananabillion_super_secret_jwt_key_2024

ADMIN_TELEGRAM_IDS=5866442043

NODE_ENV=production

BASE_TAP_POWER=1

BASE_MAX_ENERGY=1000

BASE_ENERGY_REGEN=1

CRITICAL_BASE_CHANCE=0.05

MAX_TAPS_PER_SECOND=15

COMBO_TIMEOUT_MS=500
```

8. Click "Create Web Service"
9. Wait 5-10 minutes for deployment
10. **Copy your Render URL** (e.g., `https://bananabillion-backend.onrender.com`)

#### B. Update WEBAPP_URL

1. After backend is deployed, go back to your service
2. Click "Environment" tab
3. Update `WEBAPP_URL` with your actual Render URL
4. Click "Save Changes"

#### C. Deploy Bot Worker

1. Click "New +" → "Background Worker"
2. Select your `bananabillion` repository
3. Configure:
   - **Name**: `bananabillion-bot`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm run bot`
   - **Plan**: `Free`

4. Add the **same environment variables** as backend
5. Click "Create Background Worker"

### Step 4: Fix MongoDB Access (CRITICAL!)

1. Go to: https://cloud.mongodb.com
2. Login to your account
3. Click "Network Access" (left sidebar)
4. Click "Add IP Address"
5. Click "Allow Access from Anywhere" (0.0.0.0/0)
6. Click "Confirm"
7. Wait 1-2 minutes

### Step 5: Configure Bot Menu Button (3 minutes)

1. Open Telegram
2. Search for: @BotFather
3. Send: `/setmenubutton`
4. Select your bot: @banabillionbot
5. Send: "Configure Menu Button"
6. Button text: `🎮 Play Game`
7. Web App URL: **Your Render URL** (e.g., `https://bananabillion-backend.onrender.com`)

### Step 6: Test Your Bot! 🎉

1. Open Telegram
2. Search for: @banabillionbot
3. Send: `/start`
4. Click "🎮 Play Game" button
5. **Your game should load!** 🍌

---

## 🐛 Troubleshooting

### Bot not responding?
- Check Render bot worker logs
- Verify MongoDB IP whitelist (0.0.0.0/0)
- Restart bot worker

### Game not loading?
- Verify WEBAPP_URL matches your Render URL
- Check backend service is running
- Clear Telegram cache

### "Invalid Telegram data" error?
- Make sure BOT_TOKEN is correct
- Verify you're opening from Telegram (not browser)

---

## 📞 Need Help?

Check the logs:
1. Go to Render Dashboard
2. Click on your service
3. Click "Logs" tab
4. Look for errors

---

## ✅ Success Checklist

- [ ] GitHub repository created
- [ ] Code pushed to GitHub
- [ ] Backend deployed to Render
- [ ] Bot worker deployed to Render
- [ ] MongoDB IP whitelisted (0.0.0.0/0)
- [ ] WEBAPP_URL updated with Render URL
- [ ] Bot menu button configured
- [ ] Tested in Telegram
- [ ] Game loads! 🎉

---

## 🎯 Quick Commands

```bash
# Push to GitHub
git remote add origin YOUR_REPO_URL
git branch -M main
git push -u origin main

# Check status
git status

# Make changes and push
git add .
git commit -m "Update"
git push
```

---

Your bot: https://t.me/banabillionbot
Your admin: @chiefhacks_official

Let's get your game live! 🚀
