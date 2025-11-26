# 🚀 Environment Variables Setup - Quick Guide

## 📁 Files Created for You

I've created 3 files to help you set up environment variables on Render:

### 1. **ENV_COPY_PASTE.txt** ⭐ USE THIS ONE
- Simple key=value format
- Copy the entire content
- Paste into Render's environment variables section
- **This is the easiest way!**

### 2. **HOW_TO_ADD_ENV_VARIABLES.md**
- Step-by-step instructions with screenshots descriptions
- Detailed guide for beginners
- Includes checklist to track progress

### 3. **RENDER_ENV_VARIABLES.txt**
- Same as ENV_COPY_PASTE.txt but with comments
- Explains what each variable does

## ⚡ Quick Setup (2 Minutes)

### Method 1: Copy All at Once (Fastest)

1. Open `ENV_COPY_PASTE.txt`
2. Copy ALL the content (Ctrl+A, Ctrl+C)
3. Go to: https://dashboard.render.com
4. Click: **bananabillion-backend**
5. Click: **Environment** tab
6. If Render has a "Bulk Edit" or "Import" option, use it
7. Otherwise, add each variable manually (see Method 2)

### Method 2: Add One by One (5 Minutes)

1. Go to: https://dashboard.render.com
2. Click: **bananabillion-backend**
3. Click: **Environment** tab
4. For each line in `ENV_COPY_PASTE.txt`:
   - Click "Add Environment Variable"
   - Copy the part BEFORE the `=` as the Key
   - Copy the part AFTER the `=` as the Value
   - Click Add
5. After adding all 15 variables, click **"Save Changes"**

## 📋 The 15 Variables You Need

```
1.  MONGODB_URI
2.  PORT
3.  NODE_ENV
4.  BOT_TOKEN
5.  BOT_USERNAME
6.  WEBAPP_URL
7.  JWT_SECRET
8.  ADMIN_PASSWORD
9.  ADMIN_TELEGRAM_IDS
10. BASE_TAP_POWER
11. BASE_MAX_ENERGY
12. BASE_ENERGY_REGEN
13. CRITICAL_BASE_CHANCE
14. MAX_TAPS_PER_SECOND
15. COMBO_TIMEOUT_MS
```

## ✅ After Adding Variables

1. Click **"Save Changes"** in Render
2. Wait 2-3 minutes for automatic redeploy
3. Check deployment in **Events** or **Logs** tab
4. Test: https://bananabillion-backend.onrender.com/health
5. Should return: `{"status":"ok","mongodb":"connected"}`

## 🧪 Test Your Mini App

1. Open Telegram
2. Search: `@banabillionbot`
3. Send: `/start`
4. Click: **🎮 Play Game**
5. Tap banana 🍌
6. Coins should increase! ✅

## 🐛 Troubleshooting

### Health check fails?
- Verify ALL 15 variables are added
- Check for typos in variable names
- Make sure values are copied exactly (no extra spaces)

### Mini app shows error?
- Check browser console (F12)
- Verify WEBAPP_URL is exactly: `https://bananabillion-backend.onrender.com`
- Make sure bot is running

### MongoDB not connected?
- Check MONGODB_URI is correct
- Verify password has `%40` instead of `@`
- Check MongoDB Atlas allows connections from 0.0.0.0/0

## 📞 Need More Help?

- **Detailed Guide:** `HOW_TO_ADD_ENV_VARIABLES.md`
- **Troubleshooting:** `RENDER_TROUBLESHOOTING.md`
- **Quick Fix:** `FIX_NOW.md`
- **Current Status:** `CURRENT_STATUS.md`

## 🎯 Success Checklist

- [ ] Opened ENV_COPY_PASTE.txt
- [ ] Copied all variables
- [ ] Went to Render dashboard
- [ ] Clicked Environment tab
- [ ] Added all 15 variables
- [ ] Clicked Save Changes
- [ ] Waited for redeploy (2-3 min)
- [ ] Tested /health endpoint
- [ ] Health shows "mongodb": "connected"
- [ ] Tested mini app in Telegram
- [ ] Tapping works and coins increase

---

**Start Here:** Open `ENV_COPY_PASTE.txt` and copy everything!
**Time Needed:** 2-5 minutes
**Difficulty:** Easy ⭐
**Result:** Working mini app! 🎉
