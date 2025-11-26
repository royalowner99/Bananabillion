# ⚡ FIX SERVER ERROR NOW - Action Required!

## 🚨 The Problem

Your mini app shows "server error" because **environment variables are NOT set on Render**.

The `.env` file only works locally. On Render, you MUST set them in the dashboard.

## ✅ THE FIX (5 Minutes)

### Step 1: Go to Render Dashboard

1. Open: https://dashboard.render.com
2. Click: **bananabillion-backend** service
3. Click: **Environment** tab (left sidebar)

### Step 2: Add These Environment Variables

Click **"Add Environment Variable"** and add each one:

```
MONGODB_URI
mongodb+srv://ubaid:ubaid%40786@bananabillion.vj7geqo.mongodb.net/bananabillion?retryWrites=true&w=majority&appName=BananaBillion

PORT
3000

NODE_ENV
production

BOT_TOKEN
8002962453:AAHHubn1GewH71SSP7k-z5iDbAb0obxz34k

BOT_USERNAME
banabillionbot

WEBAPP_URL
https://bananabillion-backend.onrender.com

JWT_SECRET
bananabillion_super_secret_jwt_key_2024_change_this_in_production

ADMIN_PASSWORD
admin_password_change_this

ADMIN_TELEGRAM_IDS
5866442043

BASE_TAP_POWER
1

BASE_MAX_ENERGY
1000

BASE_ENERGY_REGEN
1

CRITICAL_BASE_CHANCE
0.05

MAX_TAPS_PER_SECOND
15

COMBO_TIMEOUT_MS
500
```

### Step 3: Save and Wait

1. Click **"Save Changes"** button
2. Render will automatically redeploy (2-3 minutes)
3. Watch the **Logs** tab for:
   ```
   ✅ MongoDB Connected
   🚀 Server running on port 3000
   ```

### Step 4: Test

Visit: https://bananabillion-backend.onrender.com/health

Should return:
```json
{
  "status": "ok",
  "mongodb": "connected",
  "webappUrl": "https://bananabillion-backend.onrender.com"
}
```

### Step 5: Test Mini App

1. Open Telegram
2. Search: `@banabillionbot`
3. Send: `/start`
4. Click: **🎮 Play Game**
5. Mini app should load!
6. Tap banana → Coins increase ✅

## 🎯 Quick Checklist

- [ ] Opened Render dashboard
- [ ] Clicked Environment tab
- [ ] Added ALL 16 environment variables
- [ ] Clicked Save Changes
- [ ] Waited for redeploy (2-3 min)
- [ ] Tested /health endpoint
- [ ] Tested mini app in Telegram

## 🔍 Verify It's Working

**1. Check Health:**
```
https://bananabillion-backend.onrender.com/health
```
Should show: `"mongodb": "connected"`

**2. Check Logs:**
In Render dashboard → Logs tab, look for:
- ✅ MongoDB Connected
- ✅ Server running on port 3000
- ❌ No error messages

**3. Check Mini App:**
- Opens in Telegram ✅
- Shows banana ✅
- Tapping works ✅
- Coins increase ✅

## 🐛 Still Not Working?

### If /health shows error:
- Check MongoDB URI is correct
- Verify MongoDB Atlas allows connections from 0.0.0.0/0

### If mini app still shows error:
- Open browser console (F12)
- Check for specific error message
- Verify WEBAPP_URL matches exactly

### If bot doesn't respond:
- Bot needs to be running separately
- Create Background Worker on Render
- Or run locally: `npm run bot`

## 📞 Support

Check these files for more help:
- `RENDER_TROUBLESHOOTING.md` - Detailed troubleshooting
- `DEPLOY_NOW_FINAL.md` - Complete deployment guide
- `QUICK_DEPLOY.md` - Quick reference

---

**ACTION REQUIRED:** Go to Render dashboard NOW and add environment variables!

**Time needed:** 5 minutes
**Difficulty:** Easy (just copy-paste)
**Result:** Working mini app! 🎉
