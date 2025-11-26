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
    
    // Extract referrer ID from deep link
    const referrerId = ctx.startPayload || null;
    
    // Find or create user
    let user = await User.findOne({ userId });
    
    if (!user) {
      user = new User({
        userId,
        username,
        firstName
      });
      
      if (referrerId && referrerId !== userId) {
        user.referredBy = referrerId;
      }
      
      await user.save();
    }
    
    const webAppUrl = process.env.WEBAPP_URL;
    
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
    
  } catch (error) {
    console.error('Start command error:', error);
    ctx.reply('❌ An error occurred. Please try again.');
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

// Admin broadcast (only for admins)
bot.command('broadcast', async (ctx) => {
  try {
    const adminIds = process.env.ADMIN_TELEGRAM_IDS?.split(',') || [];
    const userId = ctx.from.id.toString();
    
    if (!adminIds.includes(userId)) {
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
