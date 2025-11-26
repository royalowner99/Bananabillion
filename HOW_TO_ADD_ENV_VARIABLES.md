# 📝 How to Add Environment Variables to Render

## Step-by-Step Guide

### Step 1: Open Render Dashboard
1. Go to: https://dashboard.render.com
2. Log in to your account
3. You should see your service: **bananabillion-backend**

### Step 2: Navigate to Environment Tab
1. Click on **bananabillion-backend** service
2. On the left sidebar, click **Environment**
3. You'll see a list of environment variables (might be empty)

### Step 3: Add Each Variable

For EACH variable below, do this:
1. Click **"Add Environment Variable"** button
2. In the **Key** field, enter the variable name (e.g., `MONGODB_URI`)
3. In the **Value** field, enter the variable value (copy from below)
4. Click **"Add"** or press Enter

### Step 4: Variables to Add (Copy These Exactly)

```
Key: MONGODB_URI
Value: mongodb+srv://ubaid:ubaid%40786@bananabillion.vj7geqo.mongodb.net/bananabillion?retryWrites=true&w=majority&appName=BananaBillion
```

```
Key: PORT
Value: 3000
```

```
Key: NODE_ENV
Value: production
```

```
Key: BOT_TOKEN
Value: 8002962453:AAHHubn1GewH71SSP7k-z5iDbAb0obxz34k
```

```
Key: BOT_USERNAME
Value: banabillionbot
```

```
Key: WEBAPP_URL
Value: https://bananabillion-backend.onrender.com
```

```
Key: JWT_SECRET
Value: bananabillion_super_secret_jwt_key_2024_change_this_in_production
```

```
Key: ADMIN_PASSWORD
Value: admin_password_change_this
```

```
Key: ADMIN_TELEGRAM_IDS
Value: 5866442043
```

```
Key: BASE_TAP_POWER
Value: 1
```

```
Key: BASE_MAX_ENERGY
Value: 1000
```

```
Key: BASE_ENERGY_REGEN
Value: 1
```

```
Key: CRITICAL_BASE_CHANCE
Value: 0.05
```

```
Key: MAX_TAPS_PER_SECOND
Value: 15
```

```
Key: COMBO_TIMEOUT_MS
Value: 500
```

### Step 5: Save Changes
1. After adding ALL 15 variables, scroll down
2. Click **"Save Changes"** button
3. Render will automatically redeploy (takes 2-3 minutes)

### Step 6: Wait for Deployment
1. Go to **Events** tab
2. Wait for "Deploy succeeded" message
3. Or watch **Logs** tab for:
   ```
   ✅ MongoDB Connected
   🚀 Server running on port 3000
   ```

### Step 7: Verify It Works
1. Visit: https://bananabillion-backend.onrender.com/health
2. Should return:
   ```json
   {
     "status": "ok",
     "mongodb": "connected",
     "webappUrl": "https://bananabillion-backend.onrender.com"
   }
   ```

## ✅ Checklist

Use this to track your progress:

- [ ] Opened Render dashboard
- [ ] Clicked on bananabillion-backend service
- [ ] Clicked Environment tab
- [ ] Added MONGODB_URI
- [ ] Added PORT
- [ ] Added NODE_ENV
- [ ] Added BOT_TOKEN
- [ ] Added BOT_USERNAME
- [ ] Added WEBAPP_URL
- [ ] Added JWT_SECRET
- [ ] Added ADMIN_PASSWORD
- [ ] Added ADMIN_TELEGRAM_IDS
- [ ] Added BASE_TAP_POWER
- [ ] Added BASE_MAX_ENERGY
- [ ] Added BASE_ENERGY_REGEN
- [ ] Added CRITICAL_BASE_CHANCE
- [ ] Added MAX_TAPS_PER_SECOND
- [ ] Added COMBO_TIMEOUT_MS
- [ ] Clicked "Save Changes"
- [ ] Waited for redeploy (2-3 min)
- [ ] Tested /health endpoint
- [ ] Health shows "mongodb": "connected"

## 🎯 Quick Copy-Paste Format

If Render allows bulk import, use this format:

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

## 🐛 Common Mistakes

### ❌ Don't Do This:
- Don't add quotes around values
- Don't add spaces before/after the equals sign
- Don't skip any variables
- Don't use the .env file directly (it won't work on Render)

### ✅ Do This:
- Copy values exactly as shown
- Add each variable one by one
- Double-check spelling
- Click "Save Changes" after adding all

## 📞 Need Help?

If you're stuck:
1. Make sure you're logged into Render
2. Make sure you're on the correct service (bananabillion-backend)
3. Make sure you're in the Environment tab (not Settings or Logs)
4. Each variable should be on its own line in the Render UI

## 🎉 After Adding Variables

Once you've added all variables and saved:
1. Wait 2-3 minutes for redeploy
2. Test: https://bananabillion-backend.onrender.com/health
3. Open Telegram bot: @banabillionbot
4. Send /start
5. Click "🎮 Play Game"
6. Tap banana and earn coins! ✅

---

**Time needed:** 5-10 minutes
**Difficulty:** Easy (just copy-paste)
**Result:** Working mini app! 🎉
