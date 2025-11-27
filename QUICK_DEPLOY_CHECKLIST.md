# ⚡ Quick Deployment Checklist

## Before You Start
- [ ] GitHub account ready
- [ ] Render account created
- [ ] MongoDB Atlas account created
- [ ] Telegram bot token obtained

---

## 1. MongoDB Atlas (5 min)
- [ ] Create free cluster
- [ ] Create database user (save password!)
- [ ] Whitelist all IPs (0.0.0.0/0)
- [ ] Copy connection string
- [ ] Replace password in connection string

**Connection String Format:**
```
mongodb+srv://username:PASSWORD@cluster.mongodb.net/bananabillion?retryWrites=true&w=majority
```

---

## 2. Telegram Bot (3 min)
- [ ] Message @BotFather
- [ ] Create new bot with `/newbot`
- [ ] Save bot token
- [ ] Get your Telegram ID from @userinfobot
- [ ] Save your Telegram ID

---

## 3. Push to GitHub (2 min)
```bash
git init
git add .
git commit -m "Deploy BananaBillion"
git remote add origin YOUR_GITHUB_REPO_URL
git push -u origin main
```

---

## 4. Deploy Backend on Render (10 min)
- [ ] Go to render.com
- [ ] New → Web Service
- [ ] Connect GitHub repo
- [ ] Name: `bananabillion-backend`
- [ ] Build: `npm install`
- [ ] Start: `npm start`
- [ ] Add environment variables (see below)
- [ ] Deploy and wait
- [ ] Copy your Render URL

### Required Environment Variables:
```
MONGODB_URI=your_mongodb_connection_string
BOT_TOKEN=your_bot_token
BOT_USERNAME=your_bot_username
WEBAPP_URL=https://your-app.onrender.com
JWT_SECRET=random_secret_string_here
ADMIN_PASSWORD=your_admin_password
ADMIN_TELEGRAM_IDS=your_telegram_id
NODE_ENV=production
PORT=3000
BASE_TAP_POWER=1
BASE_MAX_ENERGY=1000
BASE_ENERGY_REGEN=1
```

---

## 5. Update WEBAPP_URL (1 min)
- [ ] Go back to Render service
- [ ] Environment tab
- [ ] Update WEBAPP_URL with actual Render URL
- [ ] Save (auto-redeploys)

---

## 6. Deploy Bot Worker (5 min)
- [ ] Render → New → Background Worker
- [ ] Same repo
- [ ] Name: `bananabillion-bot`
- [ ] Build: `npm install`
- [ ] Start: `npm run bot`
- [ ] Add same environment variables
- [ ] Deploy

---

## 7. Configure Bot (2 min)
Message @BotFather:

**Set Menu Button:**
```
/setmenubutton
→ Choose your bot
→ "Configure Menu Button"
→ Text: 🎮 Play Game
→ URL: https://your-app.onrender.com
```

**Set Commands:**
```
/setcommands
→ Choose your bot
→ Paste:
start - Start the game
balance - Check balance
stats - View statistics
leaderboard - Top players
```

---

## 8. Initialize Database (1 min)
- [ ] Go to Render backend service
- [ ] Shell tab
- [ ] Run: `npm run init-tasks`

---

## 9. Test! 🎮
- [ ] Open Telegram
- [ ] Find your bot
- [ ] Send `/start`
- [ ] Click "🎮 Play Game"
- [ ] Tap banana
- [ ] Check all features work

---

## ✅ Done!

Your game is live at: `https://your-app.onrender.com`

**Important Notes:**
- Free tier services sleep after 15 min inactivity
- First request after sleep takes 30-60 seconds
- This is normal for free tier
- Upgrade to paid tier for 24/7 uptime

---

## Quick Links
- **Render Dashboard:** https://dashboard.render.com
- **MongoDB Atlas:** https://cloud.mongodb.com
- **Bot Settings:** Message @BotFather
- **Check Logs:** Render Dashboard → Your Service → Logs

---

## If Something Goes Wrong

**Bot not responding?**
→ Check bot worker logs on Render

**Database error?**
→ Verify MongoDB connection string
→ Check IP whitelist (0.0.0.0/0)

**Game not loading?**
→ Check backend logs
→ Verify WEBAPP_URL is correct
→ Clear Telegram cache

---

## Need Help?
Check `DEPLOY_NOW_GUIDE.md` for detailed instructions!
