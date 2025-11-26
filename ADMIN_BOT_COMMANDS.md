# 🔐 Admin Bot Commands Guide

## Overview
Your bot now has comprehensive admin controls accessible directly from Telegram. Only users with IDs in `ADMIN_TELEGRAM_IDS` can use these commands.

---

## 📋 Admin Menu
**Command:** `/admin`

Shows the complete list of admin commands with descriptions.

---

## 👥 User Management

### Find User
**Command:** `/finduser <username or user_id>`

**Examples:**
- `/finduser chiefhacks`
- `/finduser 5866442043`

Shows complete user information including balance, stats, and activity.

### Add Coins
**Command:** `/addcoins <user_id> <amount>`

**Example:** `/addcoins 5866442043 10000`

Adds coins to a user's balance and notifies them.

### Remove Coins
**Command:** `/removecoins <user_id> <amount>`

**Example:** `/removecoins 5866442043 5000`

Removes coins from a user's balance.

### Ban User
**Command:** `/banuser <user_id>`

**Example:** `/banuser 123456789`

Bans a user from the game and notifies them.

### Unban User
**Command:** `/unbanuser <user_id>`

**Example:** `/unbanuser 123456789`

Unbans a previously banned user.

### Reset User Progress
**Command:** `/resetuser <user_id>`

**Example:** `/resetuser 123456789`

Resets all user progress (balance, upgrades, stats) to default.

### Delete User
**Command:** `/deleteuser <user_id>`

**Example:** `/deleteuser 123456789`

Permanently deletes a user from the database.

---

## 📊 Statistics & Monitoring

### Game Statistics
**Command:** `/adminstats`

Shows:
- Total users
- Active users (24h)
- Banned users
- Total coins in circulation
- Average balance
- Total taps
- Server uptime

### Top Users
**Command:** `/topusers`

Shows top 20 users by total earned coins with their stats.

### Recent Users
**Command:** `/recentusers`

Shows the 20 most recently joined users.

### Active Users
**Command:** `/activenow`

Shows users active in the last 5 minutes.

---

## 🎮 Game Control

### Give Coins to All
**Command:** `/giveall <amount>`

**Example:** `/giveall 1000`

Gives coins to ALL active users and notifies them. Great for events!

---

## 📢 Communication

### Broadcast Message
**Command:** `/broadcast <message>`

**Example:** `/broadcast 🎉 *Special Event!* Double rewards for the next 24 hours!`

Sends a message to all active users. Supports Markdown formatting.

**Markdown Tips:**
- `*bold text*` - Bold
- `_italic text_` - Italic
- `` `code` `` - Code
- `[link](url)` - Link

---

## 🚀 Quick Start

1. **Open Telegram**
2. **Go to your bot:** @banabillionbot
3. **Send:** `/admin`
4. **Use any command from the menu**

---

## 💡 Common Use Cases

### Daily Rewards Event
```
/giveall 5000
/broadcast 🎁 *Daily Gift!* Everyone received 5000 coins! Enjoy!
```

### Handle Cheater
```
/finduser suspicious_user
/banuser 123456789
```

### Help a User
```
/finduser username
/addcoins 123456789 10000
```

### Monitor Activity
```
/adminstats
/activenow
/topusers
```

### Special Announcement
```
/broadcast 🚀 *New Feature!* Check out the new Mini Games in the app!
```

---

## ⚠️ Important Notes

1. **Rate Limiting:** Broadcast commands are rate-limited to 30 messages/second to comply with Telegram limits.

2. **User Notifications:** Most admin actions (add coins, ban, unban) automatically notify the affected user.

3. **Markdown Support:** Use Markdown formatting in broadcasts for better-looking messages.

4. **User IDs:** You can find user IDs using `/finduser` command or from the admin panel.

5. **Backup:** Always check user info with `/finduser` before performing destructive actions like delete or reset.

---

## 🔒 Security

- Only Telegram IDs listed in `ADMIN_TELEGRAM_IDS` environment variable can use admin commands
- All admin actions are logged in the server console
- Failed admin attempts are rejected with "Admin access required" message

---

## 📱 Access Admin Commands

**From Telegram:**
1. Open @banabillionbot
2. Send `/admin` to see all commands
3. Use any command directly

**Your Admin ID:** 5866442043

---

## 🎯 Next Steps

1. **Deploy the bot** to Render (if not already done)
2. **Test admin commands** in Telegram
3. **Monitor your game** with `/adminstats`
4. **Engage users** with broadcasts and events

---

## 🆘 Troubleshooting

**"Admin access required" error:**
- Verify your Telegram ID is in `ADMIN_TELEGRAM_IDS` environment variable
- Check the environment variable format: `5866442043` (no spaces)

**Bot not responding:**
- Check Render bot worker is running
- View logs in Render dashboard
- Restart the bot worker if needed

**Broadcast not sending:**
- Check rate limits (max 30/second)
- Verify users haven't blocked the bot
- Check bot worker logs for errors

---

Your bot is now a powerful admin tool! 🚀
