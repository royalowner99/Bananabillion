require('dotenv').config();
const { Telegraf, Markup } = require('telegraf');
const connectDB = require('../backend/src/config/database');
const User = require('../backend/src/models/User');

const bot = new Telegraf(process.env.BOT_TOKEN);

// Connect to database
connectDB();

// Start command
bot.start(async (ctx) => {
  try {
    const userId = ctx.from.id.toString();
    const username = ctx.from.username || '';
    const firstName = ctx.from.first_name || '';
    
    console.log(`👤 User ${userId} (${username}) started bot`);
    
    // Extract referrer ID from deep link
    const referrerId = ctx.startPayload || null;
    
    if (referrerId) {
      console.log(`🔗 Referrer ID: ${referrerId}`);
    }
    
    // Find or create user
    let user = await User.findOne({ userId });
    
    if (!user) {
      console.log(`✨ Creating new user: ${userId}`);
      user = new User({
        userId,
        username,
        firstName
      });
      
      if (referrerId && referrerId !== userId) {
        user.referredBy = referrerId;
        console.log(`👥 User referred by: ${referrerId}`);
      }
      
      await user.save();
    } else {
      console.log(`👋 Existing user: ${userId}`);
    }
    
    const webAppUrl = process.env.WEBAPP_URL;
    
    if (!webAppUrl || webAppUrl.includes('your-app')) {
      console.error('⚠️ WEBAPP_URL not configured properly!');
      return ctx.reply(
        '⚠️ *Bot Configuration Error*\n\n' +
        'The web app URL is not configured. Please contact the administrator.',
        { parse_mode: 'Markdown' }
      );
    }
    
    console.log(`🌐 Web App URL: ${webAppUrl}`);
    
    const keyboard = Markup.inlineKeyboard([
      [Markup.button.webApp('🎮 Play Game', webAppUrl)],
      [Markup.button.url('📢 Join Channel', 'https://t.me/your_channel')]
    ]);
    
    await ctx.replyWithPhoto(
      { url: 'https://via.placeholder.com/800x400/FFD700/000000?text=BananaBillion' },
      {
        caption: `🍌 *Welcome to BananaBillion!*\n\n` +
          `Tap to earn coins, upgrade your power, and compete with friends!\n\n` +
          `💰 Balance: ${user.balance} coins\n` +
          `👥 Referrals: ${user.referralCount}\n` +
          `🔥 Streak: ${user.dailyStreak} days\n\n` +
          `Tap the button below to start playing!`,
        parse_mode: 'Markdown',
        ...keyboard
      }
    );
    
    console.log(`✅ Start message sent to ${userId}`);
    
  } catch (error) {
    console.error('❌ Start command error:', error);
    ctx.reply('❌ An error occurred. Please try again later.');
  }
});

// Balance command
bot.command('balance', async (ctx) => {
  try {
    const userId = ctx.from.id.toString();
    const user = await User.findOne({ userId });
    
    if (!user) {
      return ctx.reply('❌ User not found. Use /start first.');
    }
    
    await ctx.reply(
      `💰 *Your Balance*\n\n` +
      `Balance: ${user.balance} coins\n` +
      `Total Earned: ${user.totalEarned} coins\n` +
      `Referral Earnings: ${user.referralEarnings} coins\n` +
      `Total Taps: ${user.totalTaps}\n` +
      `Referrals: ${user.referralCount}`,
      { parse_mode: 'Markdown' }
    );
    
  } catch (error) {
    console.error('Balance command error:', error);
    ctx.reply('❌ An error occurred.');
  }
});

// Stats command
bot.command('stats', async (ctx) => {
  try {
    const userId = ctx.from.id.toString();
    const user = await User.findOne({ userId });
    
    if (!user) {
      return ctx.reply('❌ User not found. Use /start first.');
    }
    
    await ctx.reply(
      `📊 *Your Statistics*\n\n` +
      `💰 Balance: ${user.balance}\n` +
      `📈 Total Earned: ${user.totalEarned}\n` +
      `👆 Total Taps: ${user.totalTaps}\n` +
      `⚡ Energy: ${Math.floor(user.energy)}/${user.maxEnergy}\n` +
      `💪 Tap Power: ${user.tapPower}\n` +
      `👥 Referrals: ${user.referralCount}\n` +
      `🔥 Daily Streak: ${user.dailyStreak}\n` +
      `✅ Tasks Completed: ${user.tasksCompleted}`,
      { parse_mode: 'Markdown' }
    );
    
  } catch (error) {
    console.error('Stats command error:', error);
    ctx.reply('❌ An error occurred.');
  }
});

// Leaderboard command
bot.command('leaderboard', async (ctx) => {
  try {
    const topUsers = await User.find({ isBanned: false })
      .sort({ totalEarned: -1 })
      .limit(10)
      .select('username totalEarned');
    
    let message = '🏆 *Top 10 Players*\n\n';
    
    topUsers.forEach((user, index) => {
      const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}.`;
      message += `${medal} ${user.username || 'Anonymous'}: ${user.totalEarned} coins\n`;
    });
    
    await ctx.reply(message, { parse_mode: 'Markdown' });
    
  } catch (error) {
    console.error('Leaderboard command error:', error);
    ctx.reply('❌ An error occurred.');
  }
});

// Help command
bot.command('help', async (ctx) => {
  await ctx.reply(
    `🍌 *BananaBillion Help*\n\n` +
    `*Commands:*\n` +
    `/start - Start the game\n` +
    `/balance - Check your balance\n` +
    `/stats - View your statistics\n` +
    `/leaderboard - Top players\n` +
    `/help - Show this message\n\n` +
    `*How to Play:*\n` +
    `1. Tap the banana to earn coins\n` +
    `2. Upgrade your stats to earn more\n` +
    `3. Complete tasks for rewards\n` +
    `4. Invite friends to earn bonuses\n` +
    `5. Claim daily rewards\n` +
    `6. Compete on leaderboards`,
    { parse_mode: 'Markdown' }
  );
});

// ============================================
// ADMIN COMMANDS - Full Game Control
// ============================================

// Helper function to check admin access
const isAdmin = (userId) => {
  const adminIds = process.env.ADMIN_TELEGRAM_IDS?.split(',') || [];
  return adminIds.includes(userId.toString());
};

// Admin menu
bot.command('admin', async (ctx) => {
  try {
    const userId = ctx.from.id.toString();
    
    if (!isAdmin(userId)) {
      return ctx.reply('❌ Admin access required.');
    }
    
    await ctx.reply(
      `🔐 *Admin Control Panel*\n\n` +
      `*User Management:*\n` +
      `/adminstats - Game statistics\n` +
      `/finduser <username/id> - Find user\n` +
      `/addcoins <id> <amount> - Add coins\n` +
      `/removecoins <id> <amount> - Remove coins\n` +
      `/banuser <id> - Ban user\n` +
      `/unbanuser <id> - Unban user\n` +
      `/resetuser <id> - Reset user progress\n` +
      `/deleteuser <id> - Delete user\n\n` +
      `*Game Control:*\n` +
      `/setmultiplier <value> - Set global multiplier\n` +
      `/giveall <amount> - Give coins to all\n` +
      `/resetleaderboard - Reset leaderboard\n` +
      `/maintenance <on/off> - Maintenance mode\n\n` +
      `*Communication:*\n` +
      `/broadcast <message> - Send to all users\n` +
      `/announce <message> - In-game announcement\n\n` +
      `*Monitoring:*\n` +
      `/topusers - Top 20 users\n` +
      `/recentusers - Recent 20 users\n` +
      `/activenow - Active users now\n` +
      `/logs - View recent logs`,
      { parse_mode: 'Markdown' }
    );
    
  } catch (error) {
    console.error('Admin menu error:', error);
    ctx.reply('❌ An error occurred.');
  }
});

// Admin statistics
bot.command('adminstats', async (ctx) => {
  try {
    const userId = ctx.from.id.toString();
    
    if (!isAdmin(userId)) {
      return ctx.reply('❌ Admin access required.');
    }
    
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ 
      lastActive: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } 
    });
    const bannedUsers = await User.countDocuments({ isBanned: true });
    
    const totalCoins = await User.aggregate([
      { $group: { _id: null, total: { $sum: '$balance' } } }
    ]);
    
    const totalTaps = await User.aggregate([
      { $group: { _id: null, total: { $sum: '$totalTaps' } } }
    ]);
    
    const avgBalance = totalUsers > 0 ? Math.floor(totalCoins[0]?.total / totalUsers) : 0;
    
    await ctx.reply(
      `📊 *Game Statistics*\n\n` +
      `👥 Total Users: ${totalUsers}\n` +
      `✅ Active (24h): ${activeUsers}\n` +
      `🚫 Banned: ${bannedUsers}\n\n` +
      `💰 Total Coins: ${totalCoins[0]?.total || 0}\n` +
      `📊 Average Balance: ${avgBalance}\n` +
      `👆 Total Taps: ${totalTaps[0]?.total || 0}\n\n` +
      `🔥 Server: Online\n` +
      `⏰ Uptime: ${Math.floor(process.uptime() / 60)} minutes`,
      { parse_mode: 'Markdown' }
    );
    
  } catch (error) {
    console.error('Admin stats error:', error);
    ctx.reply('❌ An error occurred.');
  }
});

// Find user
bot.command('finduser', async (ctx) => {
  try {
    const userId = ctx.from.id.toString();
    
    if (!isAdmin(userId)) {
      return ctx.reply('❌ Admin access required.');
    }
    
    const query = ctx.message.text.replace('/finduser', '').trim();
    
    if (!query) {
      return ctx.reply('Usage: /finduser <username or user_id>');
    }
    
    let user;
    
    // Try to find by userId first
    if (/^\d+$/.test(query)) {
      user = await User.findOne({ userId: query });
    }
    
    // If not found, try username
    if (!user) {
      user = await User.findOne({ username: new RegExp(query, 'i') });
    }
    
    if (!user) {
      return ctx.reply('❌ User not found.');
    }
    
    await ctx.reply(
      `👤 *User Found*\n\n` +
      `ID: \`${user.userId}\`\n` +
      `Username: @${user.username || 'none'}\n` +
      `Name: ${user.firstName}\n\n` +
      `💰 Balance: ${user.balance}\n` +
      `📈 Total Earned: ${user.totalEarned}\n` +
      `👆 Total Taps: ${user.totalTaps}\n` +
      `👥 Referrals: ${user.referralCount}\n` +
      `🔥 Streak: ${user.dailyStreak}\n\n` +
      `Status: ${user.isBanned ? '🚫 Banned' : '✅ Active'}\n` +
      `Joined: ${user.createdAt.toLocaleDateString()}\n` +
      `Last Active: ${user.lastActive.toLocaleString()}`,
      { parse_mode: 'Markdown' }
    );
    
  } catch (error) {
    console.error('Find user error:', error);
    ctx.reply('❌ An error occurred.');
  }
});

// Add coins to user
bot.command('addcoins', async (ctx) => {
  try {
    const userId = ctx.from.id.toString();
    
    if (!isAdmin(userId)) {
      return ctx.reply('❌ Admin access required.');
    }
    
    const args = ctx.message.text.split(' ');
    
    if (args.length < 3) {
      return ctx.reply('Usage: /addcoins <user_id> <amount>');
    }
    
    const targetUserId = args[1];
    const amount = parseInt(args[2]);
    
    if (isNaN(amount) || amount <= 0) {
      return ctx.reply('❌ Invalid amount.');
    }
    
    const user = await User.findOne({ userId: targetUserId });
    
    if (!user) {
      return ctx.reply('❌ User not found.');
    }
    
    user.balance += amount;
    user.totalEarned += amount;
    await user.save();
    
    await ctx.reply(
      `✅ Added ${amount} coins to @${user.username || user.userId}\n\n` +
      `New Balance: ${user.balance}`
    );
    
    // Notify user
    try {
      await bot.telegram.sendMessage(
        targetUserId,
        `🎁 *Admin Gift!*\n\nYou received ${amount} coins!\n\nNew Balance: ${user.balance}`,
        { parse_mode: 'Markdown' }
      );
    } catch (e) {
      // User might have blocked bot
    }
    
  } catch (error) {
    console.error('Add coins error:', error);
    ctx.reply('❌ An error occurred.');
  }
});

// Remove coins from user
bot.command('removecoins', async (ctx) => {
  try {
    const userId = ctx.from.id.toString();
    
    if (!isAdmin(userId)) {
      return ctx.reply('❌ Admin access required.');
    }
    
    const args = ctx.message.text.split(' ');
    
    if (args.length < 3) {
      return ctx.reply('Usage: /removecoins <user_id> <amount>');
    }
    
    const targetUserId = args[1];
    const amount = parseInt(args[2]);
    
    if (isNaN(amount) || amount <= 0) {
      return ctx.reply('❌ Invalid amount.');
    }
    
    const user = await User.findOne({ userId: targetUserId });
    
    if (!user) {
      return ctx.reply('❌ User not found.');
    }
    
    user.balance = Math.max(0, user.balance - amount);
    await user.save();
    
    await ctx.reply(
      `✅ Removed ${amount} coins from @${user.username || user.userId}\n\n` +
      `New Balance: ${user.balance}`
    );
    
  } catch (error) {
    console.error('Remove coins error:', error);
    ctx.reply('❌ An error occurred.');
  }
});

// Ban user
bot.command('banuser', async (ctx) => {
  try {
    const userId = ctx.from.id.toString();
    
    if (!isAdmin(userId)) {
      return ctx.reply('❌ Admin access required.');
    }
    
    const targetUserId = ctx.message.text.replace('/banuser', '').trim();
    
    if (!targetUserId) {
      return ctx.reply('Usage: /banuser <user_id>');
    }
    
    const user = await User.findOne({ userId: targetUserId });
    
    if (!user) {
      return ctx.reply('❌ User not found.');
    }
    
    user.isBanned = true;
    await user.save();
    
    await ctx.reply(`✅ Banned user @${user.username || user.userId}`);
    
    // Notify user
    try {
      await bot.telegram.sendMessage(
        targetUserId,
        `🚫 *Account Banned*\n\nYour account has been banned by an administrator.\n\nContact support if you believe this is a mistake.`,
        { parse_mode: 'Markdown' }
      );
    } catch (e) {
      // User might have blocked bot
    }
    
  } catch (error) {
    console.error('Ban user error:', error);
    ctx.reply('❌ An error occurred.');
  }
});

// Unban user
bot.command('unbanuser', async (ctx) => {
  try {
    const userId = ctx.from.id.toString();
    
    if (!isAdmin(userId)) {
      return ctx.reply('❌ Admin access required.');
    }
    
    const targetUserId = ctx.message.text.replace('/unbanuser', '').trim();
    
    if (!targetUserId) {
      return ctx.reply('Usage: /unbanuser <user_id>');
    }
    
    const user = await User.findOne({ userId: targetUserId });
    
    if (!user) {
      return ctx.reply('❌ User not found.');
    }
    
    user.isBanned = false;
    await user.save();
    
    await ctx.reply(`✅ Unbanned user @${user.username || user.userId}`);
    
    // Notify user
    try {
      await bot.telegram.sendMessage(
        targetUserId,
        `✅ *Account Unbanned*\n\nYour account has been unbanned. You can now play again!`,
        { parse_mode: 'Markdown' }
      );
    } catch (e) {
      // User might have blocked bot
    }
    
  } catch (error) {
    console.error('Unban user error:', error);
    ctx.reply('❌ An error occurred.');
  }
});

// Reset user progress
bot.command('resetuser', async (ctx) => {
  try {
    const userId = ctx.from.id.toString();
    
    if (!isAdmin(userId)) {
      return ctx.reply('❌ Admin access required.');
    }
    
    const targetUserId = ctx.message.text.replace('/resetuser', '').trim();
    
    if (!targetUserId) {
      return ctx.reply('Usage: /resetuser <user_id>');
    }
    
    const user = await User.findOne({ userId: targetUserId });
    
    if (!user) {
      return ctx.reply('❌ User not found.');
    }
    
    // Reset progress
    user.balance = 0;
    user.totalEarned = 0;
    user.totalTaps = 0;
    user.energy = 500;
    user.maxEnergy = 500;
    user.tapPower = 1;
    user.energyRegen = 1;
    user.dailyStreak = 0;
    user.tasksCompleted = 0;
    user.upgrades = {
      tapPower: 0,
      energyLimit: 0,
      energyRegen: 0,
      criticalChance: 0,
      autoTapper: 0
    };
    
    await user.save();
    
    await ctx.reply(`✅ Reset progress for @${user.username || user.userId}`);
    
  } catch (error) {
    console.error('Reset user error:', error);
    ctx.reply('❌ An error occurred.');
  }
});

// Delete user
bot.command('deleteuser', async (ctx) => {
  try {
    const userId = ctx.from.id.toString();
    
    if (!isAdmin(userId)) {
      return ctx.reply('❌ Admin access required.');
    }
    
    const targetUserId = ctx.message.text.replace('/deleteuser', '').trim();
    
    if (!targetUserId) {
      return ctx.reply('Usage: /deleteuser <user_id>');
    }
    
    const user = await User.findOne({ userId: targetUserId });
    
    if (!user) {
      return ctx.reply('❌ User not found.');
    }
    
    await User.deleteOne({ userId: targetUserId });
    
    await ctx.reply(`✅ Deleted user @${user.username || user.userId}`);
    
  } catch (error) {
    console.error('Delete user error:', error);
    ctx.reply('❌ An error occurred.');
  }
});

// Give coins to all users
bot.command('giveall', async (ctx) => {
  try {
    const userId = ctx.from.id.toString();
    
    if (!isAdmin(userId)) {
      return ctx.reply('❌ Admin access required.');
    }
    
    const amount = parseInt(ctx.message.text.replace('/giveall', '').trim());
    
    if (isNaN(amount) || amount <= 0) {
      return ctx.reply('Usage: /giveall <amount>');
    }
    
    const users = await User.find({ isBanned: false });
    
    let updated = 0;
    
    for (const user of users) {
      user.balance += amount;
      user.totalEarned += amount;
      await user.save();
      updated++;
      
      // Notify user
      try {
        await bot.telegram.sendMessage(
          user.userId,
          `🎁 *Special Gift!*\n\nEveryone received ${amount} coins!\n\nNew Balance: ${user.balance}`,
          { parse_mode: 'Markdown' }
        );
        
        // Rate limit
        if (updated % 30 === 0) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      } catch (e) {
        // User might have blocked bot
      }
    }
    
    await ctx.reply(`✅ Gave ${amount} coins to ${updated} users!`);
    
  } catch (error) {
    console.error('Give all error:', error);
    ctx.reply('❌ An error occurred.');
  }
});

// Top users
bot.command('topusers', async (ctx) => {
  try {
    const userId = ctx.from.id.toString();
    
    if (!isAdmin(userId)) {
      return ctx.reply('❌ Admin access required.');
    }
    
    const topUsers = await User.find({ isBanned: false })
      .sort({ totalEarned: -1 })
      .limit(20)
      .select('userId username totalEarned balance totalTaps');
    
    let message = '🏆 *Top 20 Users*\n\n';
    
    topUsers.forEach((user, index) => {
      message += `${index + 1}. @${user.username || user.userId}\n`;
      message += `   💰 ${user.totalEarned} | 👆 ${user.totalTaps}\n\n`;
    });
    
    await ctx.reply(message, { parse_mode: 'Markdown' });
    
  } catch (error) {
    console.error('Top users error:', error);
    ctx.reply('❌ An error occurred.');
  }
});

// Recent users
bot.command('recentusers', async (ctx) => {
  try {
    const userId = ctx.from.id.toString();
    
    if (!isAdmin(userId)) {
      return ctx.reply('❌ Admin access required.');
    }
    
    const recentUsers = await User.find()
      .sort({ createdAt: -1 })
      .limit(20)
      .select('userId username createdAt balance');
    
    let message = '🆕 *Recent 20 Users*\n\n';
    
    recentUsers.forEach((user, index) => {
      message += `${index + 1}. @${user.username || user.userId}\n`;
      message += `   Joined: ${user.createdAt.toLocaleDateString()}\n`;
      message += `   Balance: ${user.balance}\n\n`;
    });
    
    await ctx.reply(message, { parse_mode: 'Markdown' });
    
  } catch (error) {
    console.error('Recent users error:', error);
    ctx.reply('❌ An error occurred.');
  }
});

// Active users now
bot.command('activenow', async (ctx) => {
  try {
    const userId = ctx.from.id.toString();
    
    if (!isAdmin(userId)) {
      return ctx.reply('❌ Admin access required.');
    }
    
    const activeUsers = await User.find({
      lastActive: { $gte: new Date(Date.now() - 5 * 60 * 1000) } // Last 5 minutes
    }).select('userId username lastActive');
    
    let message = `⚡ *Active Users (Last 5 min)*\n\n`;
    message += `Total: ${activeUsers.length}\n\n`;
    
    activeUsers.slice(0, 20).forEach((user, index) => {
      const minutesAgo = Math.floor((Date.now() - user.lastActive) / 60000);
      message += `${index + 1}. @${user.username || user.userId} (${minutesAgo}m ago)\n`;
    });
    
    await ctx.reply(message, { parse_mode: 'Markdown' });
    
  } catch (error) {
    console.error('Active now error:', error);
    ctx.reply('❌ An error occurred.');
  }
});

// Broadcast message
bot.command('broadcast', async (ctx) => {
  try {
    const userId = ctx.from.id.toString();
    
    if (!isAdmin(userId)) {
      return ctx.reply('❌ Admin access required.');
    }
    
    const message = ctx.message.text.replace('/broadcast', '').trim();
    
    if (!message) {
      return ctx.reply('Usage: /broadcast <message>');
    }
    
    const users = await User.find({ isBanned: false }).select('userId');
    
    let sent = 0;
    let failed = 0;
    
    for (const user of users) {
      try {
        await bot.telegram.sendMessage(user.userId, message, { parse_mode: 'Markdown' });
        sent++;
        
        // Rate limit: 30 messages per second
        if (sent % 30 === 0) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      } catch (error) {
        failed++;
      }
    }
    
    await ctx.reply(`✅ Broadcast complete!\nSent: ${sent}\nFailed: ${failed}`);
    
  } catch (error) {
    console.error('Broadcast error:', error);
    ctx.reply('❌ Broadcast failed.');
  }
});

// Error handling
bot.catch((err, ctx) => {
  console.error('Bot error:', err);
  ctx.reply('❌ An error occurred. Please try again later.');
});

// Launch bot
bot.launch()
  .then(() => {
    console.log('🤖 Bot started successfully');
    console.log(`Bot username: @${bot.botInfo.username}`);
  })
  .catch((error) => {
    console.error('❌ Bot launch failed:', error);
    process.exit(1);
  });

// Enable graceful stop
process.once('SIGINT', () => {
  console.log('👋 SIGINT received, stopping bot');
  bot.stop('SIGINT');
});

process.once('SIGTERM', () => {
  console.log('👋 SIGTERM received, stopping bot');
  bot.stop('SIGTERM');
});
