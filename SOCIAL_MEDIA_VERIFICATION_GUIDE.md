# 🎯 Social Media Verification System - Complete Guide

## ✅ What's Implemented

### 1. Admin Task Management
- ✅ Create social media tasks with custom rewards
- ✅ Delete tasks anytime
- ✅ View all tasks in admin panel
- ✅ Set task types (one-time, daily, partner)

### 2. Automatic Verification
- ✅ **Telegram:** Bot checks if user joined channel/group
- ⚠️ **YouTube:** Manual verification (API key optional)
- ⚠️ **Twitter:** Manual verification (API key optional)

### 3. Horizontal Slider Navigation
- ✅ 10 tabs: Game → Profile → Boost → Tasks → Top → Friends → Telegram → YouTube → Twitter → Admin
- ✅ Smooth horizontal scrolling
- ✅ Direct social media links

## 🚀 Setup Instructions

### Step 1: Configure Environment Variables

Add these to your `.env` file on Render:

```env
# Your Telegram Channel (for verification)
TELEGRAM_CHANNEL=@your_channel_username

# Social Media Links
YOUTUBE_CHANNEL=https://youtube.com/@your_channel
TWITTER_HANDLE=https://twitter.com/your_handle

# Optional: API Keys for advanced verification
YOUTUBE_API_KEY=your_youtube_api_key
TWITTER_API_KEY=your_twitter_api_key
```

### Step 2: Update Social Media Links in Code

Edit `frontend/src/main.js` and update these lines:

```javascript
// Line ~1650 - Update with your actual links
function openTelegram() {
  const telegramLink = 'https://t.me/YOUR_CHANNEL'; // ← Change this
  tg.openTelegramLink(telegramLink);
}

function openYouTube() {
  const youtubeLink = 'https://youtube.com/@YOUR_CHANNEL'; // ← Change this
  tg.openLink(youtubeLink);
}

function openTwitter() {
  const twitterLink = 'https://twitter.com/YOUR_HANDLE'; // ← Change this
  tg.openLink(twitterLink);
}
```

### Step 3: Make Your Telegram Channel Public

For verification to work, your Telegram channel must be:
1. **Public** (has a username like @your_channel)
2. **Accessible** by the bot

To set up:
1. Open your channel in Telegram
2. Go to Channel Info → Edit
3. Set a username (e.g., @bananabillion)
4. Make sure it's public

### Step 4: Add Bot as Admin (Important!)

For Telegram verification to work:
1. Open your Telegram channel
2. Add your bot as an administrator
3. Give it permission to "See Members" (optional but recommended)

### Step 5: Create Tasks via Admin Panel

1. Open your game
2. Go to Admin tab (bottom navigation)
3. Scroll to "Task Management"
4. Fill in the form:

#### Example: Telegram Join Task
```
Task ID: join_telegram
Title: Join our Telegram
Description: Join our official Telegram channel for updates
Reward: 5000
Icon: 📱
Link: https://t.me/YOUR_CHANNEL
Type: one-time
```

#### Example: YouTube Subscribe Task
```
Task ID: subscribe_youtube
Title: Subscribe on YouTube
Description: Subscribe to our YouTube channel
Reward: 10000
Icon: 📺
Link: https://youtube.com/@YOUR_CHANNEL
Type: one-time
```

#### Example: Twitter Follow Task
```
Task ID: follow_twitter
Title: Follow on Twitter
Description: Follow us on Twitter/X
Reward: 7500
Icon: 🐦
Link: https://twitter.com/YOUR_HANDLE
Type: one-time
```

5. Click "Create Task"
6. Task will appear for all users immediately

## 🔍 How Verification Works

### Telegram Verification (Automatic)
1. User clicks task in Tasks tab
2. Opens Telegram channel link
3. User joins channel
4. User returns to game and clicks "Verify"
5. Bot checks via Telegram API if user is member
6. If verified → User gets coins ✅
7. If not verified → Error message ❌

### YouTube/Twitter Verification (Manual)
1. User clicks task
2. Opens link in browser
3. User subscribes/follows
4. User returns and clicks "Verify"
5. User confirms they completed it
6. User gets coins ✅

## 📱 Navigation Features

### Horizontal Slider Tabs:
```
🎮 Game      - Main tap game
👤 Profile   - User stats and info
⚡ Boost     - Upgrades and power-ups
🎯 Tasks     - Complete tasks for rewards
🏆 Top       - Leaderboard
👥 Friends   - Referral system
📱 Telegram  - Direct link to your channel
📺 YouTube   - Direct link to your channel
🐦 Twitter   - Direct link to your profile
🔐 Admin     - Admin control panel
```

### Social Media Buttons:
- **Telegram:** Opens in Telegram app (native)
- **YouTube:** Opens in browser/YouTube app
- **Twitter:** Opens in browser/Twitter app

## 🎮 User Experience Flow

### For Users:
1. User opens Tasks tab
2. Sees available social media tasks
3. Clicks task → Opens social media link
4. Completes action (join/subscribe/follow)
5. Returns to game
6. Clicks "Verify" button
7. Bot verifies completion
8. User receives reward instantly

### For Admin (You):
1. Go to Admin tab
2. Create new tasks with rewards
3. Tasks appear for all users
4. Monitor completions
5. Delete tasks when needed

## 🔧 Advanced: Enable YouTube/Twitter Auto-Verification

### YouTube API Setup (Optional):
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create new project
3. Enable YouTube Data API v3
4. Create API key
5. Add to `.env`: `YOUTUBE_API_KEY=your_key`

### Twitter API Setup (Optional):
1. Go to [Twitter Developer Portal](https://developer.twitter.com)
2. Create app
3. Get API keys
4. Add to `.env`: `TWITTER_API_KEY=your_key`

## 🐛 Troubleshooting

### Telegram Verification Not Working:
- ✅ Check bot is admin in channel
- ✅ Check channel is public (@username)
- ✅ Check TELEGRAM_CHANNEL in .env is correct
- ✅ Check bot has "See Members" permission

### Tasks Not Appearing:
- ✅ Check you're logged in as admin
- ✅ Refresh the admin tasks list
- ✅ Check task was created successfully
- ✅ Check task is marked as active

### Verification Always Fails:
- ✅ Make sure user actually joined
- ✅ Check bot token is correct
- ✅ Check channel username is correct
- ✅ Try leaving and rejoining channel

## 📊 Task Types Explained

### One-Time Tasks:
- User can complete only once
- Perfect for: Join channel, subscribe, follow
- Reward given once

### Daily Tasks:
- User can complete once per day
- Perfect for: Daily check-ins, daily shares
- Reward given every 24 hours

### Partner Tasks:
- Special tasks for partnerships
- Can be one-time or recurring
- Custom rewards

## 🎯 Best Practices

### Task Rewards:
- **Telegram Join:** 5,000 - 10,000 coins
- **YouTube Subscribe:** 10,000 - 20,000 coins
- **Twitter Follow:** 7,500 - 15,000 coins
- **Daily Tasks:** 1,000 - 5,000 coins

### Task Descriptions:
- Keep them short and clear
- Explain what user needs to do
- Mention the reward

### Task Order:
- Put easiest tasks first (Telegram)
- Then medium tasks (Twitter)
- Then harder tasks (YouTube)

## 🚀 Next Steps

1. ✅ Update your social media links in code
2. ✅ Add environment variables on Render
3. ✅ Make Telegram channel public
4. ✅ Add bot as channel admin
5. ✅ Create your first tasks
6. ✅ Test verification system
7. ✅ Promote to your users!

## 📈 Growth Strategy

### Week 1:
- Create Telegram join task (5,000 coins)
- Promote in game

### Week 2:
- Add YouTube subscribe task (10,000 coins)
- Create daily check-in task (1,000 coins)

### Week 3:
- Add Twitter follow task (7,500 coins)
- Create partner tasks

### Week 4:
- Analyze which tasks work best
- Adjust rewards based on completion rates
- Create special event tasks

## 🎉 You're All Set!

Your game now has a complete social media growth system with:
- ✅ Automatic Telegram verification
- ✅ Admin task management
- ✅ Horizontal slider navigation
- ✅ Direct social media links
- ✅ Reward system

Users can now help you grow your social media while earning coins! 🚀
