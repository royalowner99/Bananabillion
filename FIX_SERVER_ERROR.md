# Fix Server Error in Mini App

## Problem
The mini app shows "server error" because:
1. WEBAPP_URL is not configured correctly
2. Server might not be deployed/running
3. Bot can't connect to the web app

## Quick Fix Steps

### 1. Update .env file with your actual Render URL

Replace `WEBAPP_URL=https://your-app.onrender.com` with your actual Render URL:

```env
WEBAPP_URL=https://YOUR-ACTUAL-APP-NAME.onrender.com
```

**To find your Render URL:**
- Go to https://dashboard.render.com
- Click on your web service
- Copy the URL at the top (looks like: https://bananabillion-xxxx.onrender.com)

### 2. Make sure your server is deployed and running

Check Render dashboard:
- Service should show "Live" status (green)
- Check logs for any errors
- If it shows "Deploy failed", redeploy

### 3. Update Bot Commands on Telegram

After fixing the WEBAPP_URL, you need to restart the bot:

**On Render:**
- Go to your bot service (if separate)
- Click "Manual Deploy" → "Deploy latest commit"

OR if bot runs with the main app, just restart the web service.

### 4. Test the Bot

1. Open Telegram
2. Search for your bot: @banabillionbot
3. Send `/start`
4. Click "🎮 Play Game" button
5. The mini app should now load

## Common Issues

### Issue: "Please open this app from Telegram"
**Solution:** Make sure you're opening the app through the bot's button, not directly in browser

### Issue: "Authentication failed"
**Solution:** 
- Check MongoDB connection in Render logs
- Verify MONGODB_URI is correct in environment variables

### Issue: Bot button doesn't work
**Solution:**
- Verify WEBAPP_URL is correct (no trailing slash)
- Make sure it matches your Render web service URL exactly

## Testing Checklist

- [ ] WEBAPP_URL updated in .env
- [ ] Server is deployed and showing "Live" on Render
- [ ] Bot is running (check bot service logs)
- [ ] Can send /start to bot
- [ ] "Play Game" button appears
- [ ] Mini app loads without errors

## Need More Help?

If still not working, check:
1. Render logs for backend errors
2. Browser console (F12) for frontend errors
3. Make sure all environment variables are set on Render
