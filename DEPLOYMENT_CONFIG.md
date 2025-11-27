# 🚀 DEPLOYMENT CONFIGURATION

## Your Bot Details
- **Bot Username:** @BANANABILLIONBOT
- **Bot Token:** `8050087144:AAFaeOQLU_L2d6A6YFNEFmQgNaRxcPYW0lg`
- **Admin ID:** `1526312302`
- **Admin Username:** @royalowner9

## Environment Variables for Render

Set these in your Render dashboard:

```
BOT_TOKEN=8050087144:AAFaeOQLU_L2d6A6YFNEFmQgNaRxcPYW0lg
WEBAPP_URL=https://your-app-name.onrender.com
JWT_SECRET=banana_billion_secret_key_2024
MONGODB_URI=your_mongodb_connection_string
ADMIN_TELEGRAM_IDS=1526312302
NODE_ENV=production
PORT=10000
```

## Steps to Deploy:

### 1. Update Render Environment Variables
1. Go to your Render dashboard
2. Select your web service
3. Go to "Environment" tab
4. Update these variables:
   - `BOT_TOKEN` = `8050087144:AAFaeOQLU_L2d6A6YFNEFmQgNaRxcPYW0lg`
   - `ADMIN_TELEGRAM_IDS` = `1526312302`
   - `WEBAPP_URL` = Your Render URL (e.g., `https://bananabillion.onrender.com`)

### 2. Set Bot Webhook
After deployment, run this command (replace YOUR_RENDER_URL):

```bash
curl -X POST "https://api.telegram.org/bot8050087144:AAFaeOQLU_L2d6A6YFNEFmQgNaRxcPYW0lg/setWebhook" \
  -H "Content-Type: application/json" \
  -d '{"url": "https://YOUR_RENDER_URL/webhook"}'
```

### 3. Set Bot Commands
```bash
curl -X POST "https://api.telegram.org/bot8050087144:AAFaeOQLU_L2d6A6YFNEFmQgNaRxcPYW0lg/setMyCommands" \
  -H "Content-Type: application/json" \
  -d '{"commands": [{"command": "start", "description": "Start the game"}, {"command": "stats", "description": "View your stats"}, {"command": "help", "description": "Get help"}]}'
```

## What Was Updated:
- ✅ Bot username changed to BANANABILLIONBOT
- ✅ Admin ID updated to 1526312302
- ✅ Frontend referral links updated
- ✅ Admin panel access configured
- ✅ UI cleaned and optimized

## Next Steps:
1. Push code to GitHub
2. Render will auto-deploy
3. Set webhook URL
4. Test the bot!
