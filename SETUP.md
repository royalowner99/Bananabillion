# 🚀 Quick Setup Guide

## Local Development Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
```bash
cp .env.example .env
```

Edit `.env` and fill in:
- `MONGODB_URI` - Your MongoDB connection string
- `BOT_TOKEN` - Your Telegram bot token from @BotFather
- `BOT_USERNAME` - Your bot username (without @)
- `WEBAPP_URL` - For local: `http://localhost:3000`
- `JWT_SECRET` - Random string (generate with: `openssl rand -base64 32`)
- `ADMIN_TELEGRAM_IDS` - Your Telegram user ID (get from @userinfobot)

### 3. Start Services

**Terminal 1 - Backend:**
```bash
npm run dev
```

**Terminal 2 - Bot:**
```bash
npm run bot
```

### 4. Access Locally
- Frontend: http://localhost:3000
- Admin Panel: http://localhost:3000/admin/index.html

## Testing Telegram Mini App Locally

Since Telegram Mini Apps need to run in Telegram, you have two options:

### Option A: Use ngrok (Recommended for testing)
```bash
# Install ngrok: https://ngrok.com/download
ngrok http 3000
```

Copy the https URL (e.g., `https://abc123.ngrok.io`) and:
1. Update `WEBAPP_URL` in `.env`
2. Set this URL in @BotFather menu button
3. Restart backend

### Option B: Deploy to Render
Follow the full deployment guide in `DEPLOYMENT.md`

## Project Structure

```
bananabillion/
├── backend/
│   ├── src/
│   │   ├── config/         # Game config & database
│   │   ├── models/         # MongoDB schemas
│   │   ├── routes/         # API routes
│   │   ├── controllers/    # Business logic
│   │   ├── middleware/     # Auth & rate limiting
│   │   └── utils/          # Game logic & helpers
│   ├── app.js             # Express app
│   └── server.js          # Server entry point
├── frontend/
│   ├── src/
│   │   └── main.js        # Frontend logic
│   └── index.html         # UI
├── bot/
│   └── index.js           # Telegram bot
├── admin/
│   └── index.html         # Admin panel
├── .env.example           # Environment template
├── package.json           # Dependencies
└── README.md             # Documentation
```

## Common Issues

### MongoDB Connection Failed
- Check connection string format
- Verify IP whitelist (0.0.0.0/0)
- Confirm database user credentials

### Bot Not Responding
- Verify BOT_TOKEN is correct
- Check bot is running (`npm run bot`)
- Ensure bot is not already running elsewhere

### Frontend Not Loading
- Check WEBAPP_URL matches your URL
- Verify backend is running
- Check browser console for errors

### Telegram Mini App Shows Error
- Must be opened from Telegram
- Check initData validation
- Verify bot menu button URL is correct

## Development Tips

### Hot Reload
Use nodemon for auto-restart on changes:
```bash
npm install -g nodemon
nodemon backend/server.js
```

### Database GUI
Use MongoDB Compass to view/edit data:
- Download: https://www.mongodb.com/products/compass
- Connect with your MONGODB_URI

### Testing API Endpoints
Use curl or Postman:
```bash
# Get user profile
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:3000/api/user/profile
```

### View Logs
```bash
# Backend logs
npm start

# Bot logs
npm run bot
```

## Game Configuration

Edit game parameters in `.env`:

```env
BASE_TAP_POWER=1              # Coins per tap
BASE_MAX_ENERGY=1000          # Starting energy
BASE_ENERGY_REGEN=1           # Energy per second
CRITICAL_BASE_CHANCE=0.05     # 5% crit chance
MAX_TAPS_PER_SECOND=15        # Anti-cheat limit
COMBO_TIMEOUT_MS=500          # Combo window
```

## Adding Custom Tasks

Tasks are auto-created on first run. To add more:

1. Use admin panel, or
2. Add to `backend/server.js` in `initializeTasks()`, or
3. Use MongoDB Compass to insert directly

Task structure:
```javascript
{
  taskId: 'unique_id',
  title: 'Task Title',
  description: 'Task description',
  reward: 500,
  type: 'one-time', // or 'daily', 'cooldown', 'partner'
  cooldownSeconds: 0,
  icon: '🎯',
  link: 'https://...',
  isActive: true
}
```

## Customization

### Change Colors
Edit `frontend/index.html` Tailwind classes:
- Background: `bg-purple-600` → `bg-blue-600`
- Buttons: `bg-yellow-500` → `bg-green-500`

### Change Banana Emoji
Edit `frontend/index.html`:
```html
<div class="text-9xl">🍌</div>
<!-- Change to any emoji: 🎮 🎯 💎 ⚡ -->
```

### Adjust Upgrade Prices
Edit `backend/src/config/game.js`:
```javascript
tapPower: {
  basePrice: 100,        // Starting price
  priceMultiplier: 1.5,  // Price increase per level
  effect: (level) => level,
  maxLevel: 100
}
```

## Security Checklist

Before deploying:
- ✅ Change JWT_SECRET to random value
- ✅ Set strong ADMIN_PASSWORD
- ✅ Verify ADMIN_TELEGRAM_IDS
- ✅ Enable MongoDB IP whitelist
- ✅ Use strong database password
- ✅ Keep BOT_TOKEN secret
- ✅ Test rate limiting
- ✅ Verify input validation

## Performance Optimization

### Database Indexes
Already configured in models. To verify:
```javascript
// In MongoDB shell
db.users.getIndexes()
```

### Caching
Consider adding Redis for:
- Leaderboard caching
- User session caching
- Rate limit storage

### CDN
For production, serve static files via CDN:
- Cloudflare (free)
- AWS CloudFront
- Vercel

## Monitoring

### Free Monitoring Tools
- Render Dashboard (logs & metrics)
- MongoDB Atlas (database metrics)
- UptimeRobot (uptime monitoring)

### Error Tracking
Consider adding:
- Sentry (error tracking)
- LogRocket (session replay)
- Google Analytics (user analytics)

## Scaling Checklist

When you grow:
1. Upgrade MongoDB to M2+ (backups)
2. Upgrade Render to Starter (always on)
3. Add Redis for caching
4. Enable CDN for static files
5. Add load balancer
6. Implement database sharding
7. Add monitoring & alerts

## Support

Need help?
1. Check logs first
2. Review error messages
3. Test locally
4. Check MongoDB connection
5. Verify environment variables

## Next Steps

1. ✅ Complete local setup
2. ✅ Test all features
3. ✅ Customize game parameters
4. ✅ Add your own tasks
5. ✅ Deploy to Render
6. ✅ Configure bot menu button
7. ✅ Test in Telegram
8. ✅ Invite friends to test
9. ✅ Monitor and iterate
10. ✅ Launch! 🚀

Good luck! 🍌
