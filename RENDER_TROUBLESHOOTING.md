# 🔧 Render Deployment Troubleshooting

## Current Issue: Server Error in Mini App

### Quick Diagnosis Steps

1. **Check if server is running:**
   - Visit: https://bananabillion-backend.onrender.com/health
   - Should return JSON with status

2. **Check Render Dashboard:**
   - Go to: https://dashboard.render.com
   - Click: **bananabillion-backend**
   - Check: Status should be "Live" (green)
   - Click: **Logs** tab to see errors

3. **Check Environment Variables:**
   - In Render dashboard, click **Environment** tab
   - Verify ALL these are set:

## ✅ Required Environment Variables on Render

**CRITICAL:** These MUST be set in Render dashboard, not just in .env file!

```
MONGODB_URI=mongodb+srv://ubaid:ubaid%40786@bananabillion.vj7geqo.mongodb.net/bananabillion?retryWrites=true&w=majority&appName=BananaBillion

PORT=3000

NODE_ENV=production

BOT_TOKEN=8002962453:AAHHubn1GewH71SSP7k-z5iDbAb0obxz34k

BOT_USERNAME=banabillionbot

WEBAPP_URL=https://bananabillion-backend.onrender.com

JWT_SECRET=bananabillion_super_secret_jwt_key_2024_change_this_in_production

ADMIN_PASSWORD=admin_password_change_this

ADMIN_TELEGRAM_IDS=5866442043

BASE_TAP_POWER=1

BASE_MAX_ENERGY=1000

BASE_ENERGY_REGEN=1

CRITICAL_BASE_CHANCE=0.05

MAX_TAPS_PER_SECOND=15

COMBO_TIMEOUT_MS=500
```

## 🔍 Common Issues & Solutions

### Issue 1: "Not Found" or 404 Error

**Cause:** Server not responding or routes not configured

**Solution:**
1. Check Render logs for startup errors
2. Verify build completed successfully
3. Check if MongoDB connection succeeded

**Look for in logs:**
```
✅ MongoDB Connected
🚀 Server running on port 3000
```

### Issue 2: "Server Error" in Mini App

**Cause:** Environment variables not set on Render

**Solution:**
1. Go to Render dashboard → Environment tab
2. Add ALL environment variables listed above
3. Click "Save Changes" (this will redeploy)
4. Wait 2-3 minutes for redeploy

### Issue 3: MongoDB Connection Failed

**Cause:** MongoDB URI incorrect or IP not whitelisted

**Solution:**
1. Go to MongoDB Atlas: https://cloud.mongodb.com
2. Click "Network Access"
3. Add IP: `0.0.0.0/0` (allow all)
4. Or add Render's IPs
5. Verify password is URL encoded (@ becomes %40)

### Issue 4: Build Fails on Render

**Cause:** Missing dependencies or build errors

**Solution:**
1. Check Render logs for specific error
2. Verify package.json has all dependencies
3. Make sure Node version is compatible
4. Try manual deploy: Click "Manual Deploy" → "Clear build cache & deploy"

### Issue 5: Server Starts but Mini App Shows Error

**Cause:** WEBAPP_URL not matching or CORS issue

**Solution:**
1. Verify WEBAPP_URL on Render matches exactly: `https://bananabillion-backend.onrender.com`
2. No trailing slash!
3. Check browser console (F12) for specific error
4. Verify bot is using same URL

## 🧪 Testing Endpoints

After deployment, test these URLs:

### 1. Health Check
```
https://bananabillion-backend.onrender.com/health
```
**Expected Response:**
```json
{
  "status": "ok",
  "mongodb": "connected",
  "webappUrl": "https://bananabillion-backend.onrender.com",
  "botToken": "set",
  "jwtSecret": "set"
}
```

### 2. API Info
```
https://bananabillion-backend.onrender.com/api
```
**Expected Response:**
```json
{
  "name": "BananaBillion API",
  "version": "1.0.0",
  "status": "running"
}
```

### 3. Frontend
```
https://bananabillion-backend.onrender.com
```
**Expected:** Should load the frontend HTML

## 📋 Step-by-Step Fix

### Step 1: Verify Environment Variables

1. Go to Render dashboard
2. Click **bananabillion-backend**
3. Click **Environment** tab
4. Check if ALL variables are set
5. If missing, add them one by one
6. Click **Save Changes**

### Step 2: Check Logs

1. Click **Logs** tab
2. Look for errors (red text)
3. Common errors:
   - `MongoDB connection failed` → Check MongoDB URI
   - `Cannot find module` → Missing dependency
   - `Port already in use` → Restart service
   - `JWT_SECRET not defined` → Add environment variable

### Step 3: Manual Redeploy

1. Click **Manual Deploy** button
2. Select **Clear build cache & deploy**
3. Wait 3-5 minutes
4. Check logs for success messages

### Step 4: Test Health Endpoint

1. Visit: https://bananabillion-backend.onrender.com/health
2. Should return JSON
3. Check `mongodb` field is "connected"
4. Check `webappUrl` is set correctly

### Step 5: Test Mini App

1. Open Telegram
2. Search: `@banabillionbot`
3. Send: `/start`
4. Click: **🎮 Play Game**
5. Check browser console (F12) for errors

## 🚨 Emergency Debug Mode

If nothing works, enable detailed logging:

1. Add environment variable on Render:
   ```
   DEBUG=*
   ```
2. Redeploy
3. Check logs for detailed output

## 📞 What to Check Right Now

1. **Render Dashboard Status:**
   - [ ] Service shows "Live" (green)
   - [ ] No errors in Events tab
   - [ ] Last deploy was successful

2. **Environment Variables:**
   - [ ] MONGODB_URI is set
   - [ ] BOT_TOKEN is set
   - [ ] WEBAPP_URL is set
   - [ ] JWT_SECRET is set

3. **Logs Show:**
   - [ ] "MongoDB Connected"
   - [ ] "Server running on port 3000"
   - [ ] No error messages

4. **Endpoints Work:**
   - [ ] /health returns JSON
   - [ ] /api returns JSON
   - [ ] / loads frontend

## 🎯 Most Likely Issue

**Environment variables are not set on Render!**

The .env file is only for local development. On Render, you MUST set environment variables in the dashboard.

**Fix:**
1. Go to Render → Environment tab
2. Copy ALL variables from .env file
3. Add them one by one in Render
4. Save changes
5. Wait for redeploy

## 📊 Success Indicators

You'll know it's working when:

1. ✅ /health returns `{"status":"ok","mongodb":"connected"}`
2. ✅ Render logs show "Server running on port 3000"
3. ✅ No errors in Render logs
4. ✅ Mini app loads in Telegram
5. ✅ Can tap banana and earn coins

---

**Next Step:** Check Render dashboard and verify environment variables are set!
