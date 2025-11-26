# 🚀 Deployment Guide for BananaBillion

## Prerequisites

1. **MongoDB Atlas Account** (Free)
   - Sign up at https://www.mongodb.com/cloud/atlas
   
2. **Render Account** (Free)
   - Sign up at https://render.com
   
3. **Telegram Bot Token**
   - Get from @BotFather on Telegram

## Step 1: MongoDB Atlas Setup

1. Go to https://cloud.mongodb.com
2. Click "Build a Database"
3. Choose "M0 FREE" tier
4. Select a cloud provider and region (closest to your users)
5. Click "Create Cluster"
6. Wait for cluster to be created (2-3 minutes)

### Create Database User

1. Go to "Database Access" in left sidebar
2. Click "Add New Database User"
3. Choose "Password" authentication
4. Enter username and password (save these!)
5. Set "Database User Privileges" to "Read and write to any database"
6. Click "Add User"

### Whitelist IP Address

1. Go to "Network Access" in left sidebar
2. Click "Add IP Address"
3. Click "Allow Access from Anywhere" (0.0.0.0/0)
4. Click "Confirm"

### Get Connection String

1. Go to "Database" in left sidebar
2. Click "Connect" on your cluster
3. Choose "Connect your application"
4. Copy the connection string
5. Replace `<password>` with your database user password
6. Replace `<dbname>` with `bananabillion`

Example:
```
mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/bananabillion?retryWrites=true&w=majority
```

## Step 2: Create Telegram Bot

1. Open Telegram and search for @BotFather
2. Send `/newbot`
3. Enter bot name: `BananaBillion`
4. Enter bot username: `YourBotUsername_bot` (must end with 'bot')
5. Save the bot token (looks like: `1234567890:ABCdefGHIjklMNOpqrsTUVwxyz`)
6. Save the bot username (without @)

### Configure Bot Menu Button

1. Send `/setmenubutton` to @BotFather
2. Select your bot
3. Send "Configure Menu Button"
4. Button text: `🎮 Play Game`
5. Web App URL: `https://your-app-name.onrender.com` (you'll get this from Render)

## Step 3: Deploy to Render

### Option A: Using GitHub (Recommended)

1. Push your code to GitHub:
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/yourusername/bananabillion.git
git push -u origin main
```

2. Go to https://render.com
3. Click "New +" → "Web Service"
4. Connect your GitHub repository
5. Configure:
   - **Name**: `bananabillion-backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: `Free`

6. Add Environment Variables:
   - `MONGODB_URI`: Your MongoDB connection string
   - `BOT_TOKEN`: Your Telegram bot token
   - `BOT_USERNAME`: Your bot username (without @)
   - `WEBAPP_URL`: `https://bananabillion-backend.onrender.com` (or your service URL)
   - `JWT_SECRET`: Generate random string (e.g., `openssl rand -base64 32`)
   - `ADMIN_TELEGRAM_IDS`: Your Telegram user ID (get from @userinfobot)
   - `NODE_ENV`: `production`

7. Click "Create Web Service"

8. Wait for deployment (5-10 minutes for first deploy)

### Deploy Bot Worker

1. Click "New +" → "Background Worker"
2. Select same repository
3. Configure:
   - **Name**: `bananabillion-bot`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm run bot`
   - **Plan**: `Free`

4. Add same environment variables as backend

5. Click "Create Background Worker"

### Option B: Manual Deploy

If you don't want to use GitHub:

1. Go to Render Dashboard
2. Click "New +" → "Web Service"
3. Choose "Public Git repository"
4. Enter your repo URL
5. Follow same steps as Option A

## Step 4: Update Bot Menu Button

1. Go back to @BotFather
2. Send `/setmenubutton`
3. Select your bot
4. Update Web App URL with your Render URL:
   `https://bananabillion-backend.onrender.com`

## Step 5: Test Your App

1. Open Telegram
2. Search for your bot (@YourBotUsername_bot)
3. Send `/start`
4. Click "🎮 Play Game" button
5. App should load and work!

## Step 6: Configure Admin Access

1. Get your Telegram user ID:
   - Message @userinfobot on Telegram
   - Copy your user ID

2. Add to Render environment variables:
   - Go to your backend service on Render
   - Click "Environment"
   - Update `ADMIN_TELEGRAM_IDS` with your user ID
   - Can add multiple IDs separated by commas: `123456789,987654321`

3. Access admin panel:
   - Go to `https://your-app.onrender.com/admin/index.html`
   - Enter your JWT token (from Telegram auth)

## Troubleshooting

### Bot not responding
- Check bot token is correct
- Verify bot worker is running on Render
- Check Render logs for errors

### Database connection failed
- Verify MongoDB connection string
- Check IP whitelist includes 0.0.0.0/0
- Verify database user credentials

### Frontend not loading
- Check WEBAPP_URL matches Render URL
- Verify CORS settings
- Check browser console for errors

### Energy not regenerating
- Check browser console for errors
- Verify WebSocket connection
- Refresh the page

## Monitoring

### Render Logs

1. Go to Render Dashboard
2. Click on your service
3. Click "Logs" tab
4. View real-time logs

### MongoDB Monitoring

1. Go to MongoDB Atlas
2. Click "Metrics" tab
3. View database performance

## Scaling (When You Grow)

### Upgrade Render Plan
- Free tier: 750 hours/month
- Starter: $7/month (always on)
- Standard: $25/month (more resources)

### Upgrade MongoDB
- M0: Free (512MB storage)
- M2: $9/month (2GB storage)
- M5: $25/month (5GB storage)

## Security Checklist

- ✅ MongoDB IP whitelist configured
- ✅ Strong database password
- ✅ JWT_SECRET is random and secure
- ✅ ADMIN_TELEGRAM_IDS set correctly
- ✅ Bot token kept secret
- ✅ Rate limiting enabled
- ✅ Input validation active

## Backup Strategy

### MongoDB Backups
- Atlas M0 (Free): No automatic backups
- Upgrade to M2+ for automatic backups
- Manual backup: Use `mongodump` command

### Code Backups
- Keep code in GitHub
- Tag releases: `git tag v1.0.0`
- Push tags: `git push --tags`

## Updates

To update your app:

1. Make changes locally
2. Test thoroughly
3. Commit and push to GitHub:
```bash
git add .
git commit -m "Update description"
git push
```
4. Render will auto-deploy (if auto-deploy enabled)
5. Or manually deploy from Render dashboard

## Support

If you encounter issues:
1. Check Render logs
2. Check MongoDB Atlas metrics
3. Test locally first
4. Review error messages carefully

## Cost Summary

**FREE TIER:**
- MongoDB Atlas M0: FREE
- Render Web Service: FREE (750 hours/month)
- Render Worker: FREE (750 hours/month)
- Telegram Bot: FREE
- **Total: $0/month** ✅

**Note:** Free tier services may sleep after 15 minutes of inactivity. First request after sleep takes ~30 seconds to wake up.

## Next Steps

1. Customize game parameters in `.env`
2. Add your own tasks
3. Create Telegram channel for announcements
4. Promote your game!
5. Monitor user growth
6. Collect feedback and iterate

Good luck with your game! 🍌🎮
