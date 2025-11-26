# ⚡ QUICK DEPLOY GUIDE

## 🎯 Your Configuration

- **Render URL:** `https://bananabillion-backend.onrender.com`
- **Bot Username:** `@banabillionbot`
- **Status:** ✅ All fixes applied, ready to deploy!

## 🚀 Deploy in 3 Commands

```bash
# 1. Push to GitHub
git add .
git commit -m "Fixed server errors and configured WEBAPP_URL"
git push origin main

# 2. Wait 2-5 minutes for Render to deploy

# 3. Test
# Visit: https://bananabillion-backend.onrender.com/health
```

## ⚙️ Update Render Environment Variable

**CRITICAL:** Update this on Render dashboard:

1. Go to: https://dashboard.render.com
2. Click: **bananabillion-backend**
3. Click: **Environment** tab
4. Set: `WEBAPP_URL` = `https://bananabillion-backend.onrender.com`
5. Click: **Save Changes**

## 🤖 Start Bot

**On Render (Recommended):**
- Create Background Worker
- Start command: `node bot/index.js`
- Add same environment variables

**Or Locally:**
```bash
npm run bot
```

## ✅ Test

1. Open Telegram
2. Search: `@banabillionbot`
3. Send: `/start`
4. Click: **🎮 Play Game**
5. Tap banana → Coins increase ✅

## 🔍 Quick Checks

- Health: https://bananabillion-backend.onrender.com/health
- Should return: `{"status":"ok","mongodb":"connected"}`
- Bot responds to `/start` ✅
- Mini app loads ✅
- Tapping works ✅

## 🐛 Troubleshooting

**Server error?**
- Check: https://bananabillion-backend.onrender.com/health
- Verify: WEBAPP_URL on Render matches exactly

**Bot not working?**
- Check: Bot service is running
- Verify: BOT_TOKEN is correct

**Blank screen?**
- Open: Browser console (F12)
- Check: For error messages
- Verify: Opening from Telegram bot, not browser

## 📚 Full Guides

- `DEPLOY_NOW_FINAL.md` - Complete deployment guide
- `FIXES_APPLIED.md` - What was fixed
- `START_HERE_NOW.md` - Detailed instructions

---

**Ready to deploy!** 🚀
