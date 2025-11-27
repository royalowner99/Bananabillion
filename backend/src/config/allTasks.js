// Complete Task & Achievement System for BananaBillion

module.exports = {
  // ============================================
  // 1️⃣ DAILY TASKS (Reset Every 24 Hours)
  // ============================================
  dailyTasks: [
    {
      taskId: 'daily_checkin',
      title: 'Daily Check-in',
      description: 'Log in once per day',
      icon: '📅',
      reward: 500,
      type: 'daily',
      category: 'daily',
      requiresVerification: false,
      link: ''
    },
    {
      taskId: 'daily_watch_ad',
      title: 'Watch Ad',
      description: 'Watch a short advertisement',
      icon: '📺',
      reward: 300,
      type: 'daily',
      category: 'daily',
      requiresVerification: false,
      link: ''
    },
    {
      taskId: 'daily_tap_goal',
      title: 'Tap Goal',
      description: 'Make 1,000 taps today',
      icon: '🎯',
      reward: 1000,
      type: 'daily',
      category: 'daily',
      requiresVerification: false,
      link: '',
      requirement: { type: 'taps', count: 1000 }
    },
    {
      taskId: 'daily_use_boosters',
      title: 'Use 2 Boosters',
      description: 'Activate any 2 boosters today',
      icon: '🚀',
      reward: 700,
      type: 'daily',
      category: 'daily',
      requiresVerification: false,
      link: '',
      requirement: { type: 'boosters', count: 2 }
    },
    {
      taskId: 'daily_share_bot',
      title: 'Share Bot',
      description: 'Share bot to any Telegram chat',
      icon: '📤',
      reward: 1500,
      type: 'daily',
      category: 'daily',
      requiresVerification: true,
      link: ''
    },
    {
      taskId: 'daily_wheel_spin',
      title: 'Claim Daily Wheel',
      description: 'Spin the reward wheel',
      icon: '🎡',
      reward: 0, // Random 100-5000
      type: 'daily',
      category: 'daily',
      requiresVerification: false,
      link: '',
      rewardRange: { min: 100, max: 5000 }
    }
  ],

  // Daily Streak Bonuses
  dailyStreakBonuses: {
    1: 500,
    2: 700,
    3: 1000,
    5: 2000,
    7: 5000,
    14: 10000,
    30: 50000
  },

  // ============================================
  // 2️⃣ SOCIAL TASKS (One-time Tasks)
  // ============================================
  socialTasks: [
    {
      taskId: 'join_telegram_channel',
      title: 'Join Telegram Channel',
      description: 'Join our official Telegram channel',
      icon: '📢',
      reward: 2000,
      type: 'one-time',
      category: 'social',
      requiresVerification: true,
      link: 'https://t.me/your_channel'
    },
    {
      taskId: 'join_telegram_group',
      title: 'Join Telegram Group',
      description: 'Join our community group',
      icon: '👥',
      reward: 1500,
      type: 'one-time',
      category: 'social',
      requiresVerification: true,
      link: 'https://t.me/your_group'
    },
    {
      taskId: 'follow_twitter',
      title: 'Follow X/Twitter',
      description: 'Follow us on Twitter/X',
      icon: '🐦',
      reward: 2500,
      type: 'one-time',
      category: 'social',
      requiresVerification: true,
      link: 'https://twitter.com/your_account'
    },
    {
      taskId: 'like_pinned_tweet',
      title: 'Like Pinned Tweet',
      description: 'Like our pinned tweet',
      icon: '❤️',
      reward: 1000,
      type: 'one-time',
      category: 'social',
      requiresVerification: true,
      link: 'https://twitter.com/your_account'
    },
    {
      taskId: 'rt_pinned_tweet',
      title: 'RT Pinned Tweet',
      description: 'Retweet our pinned tweet',
      icon: '🔄',
      reward: 1500,
      type: 'one-time',
      category: 'social',
      requiresVerification: true,
      link: 'https://twitter.com/your_account'
    },
    {
      taskId: 'subscribe_youtube',
      title: 'Subscribe YouTube',
      description: 'Subscribe to our YouTube channel',
      icon: '📹',
      reward: 2000,
      type: 'one-time',
      category: 'social',
      requiresVerification: true,
      link: 'https://youtube.com/@your_channel'
    },
    {
      taskId: 'visit_website',
      title: 'Visit Website',
      description: 'Visit our official website',
      icon: '🌐',
      reward: 500,
      type: 'one-time',
      category: 'social',
      requiresVerification: true,
      link: 'https://your-website.com'
    },
    {
      taskId: 'join_discord',
      title: 'Join Discord',
      description: 'Join our Discord server',
      icon: '💬',
      reward: 2000,
      type: 'one-time',
      category: 'social',
      requiresVerification: true,
      link: 'https://discord.gg/your_server'
    },
    {
      taskId: 'follow_instagram',
      title: 'Follow Instagram',
      description: 'Follow us on Instagram',
      icon: '📸',
      reward: 1500,
      type: 'one-time',
      category: 'social',
      requiresVerification: true,
      link: 'https://instagram.com/your_account'
    }
  ],

  // ============================================
  // 3️⃣ INVITE TASKS (Viral Tasks)
  // ============================================
  inviteTasks: [
    {
      taskId: 'invite_1_friend',
      title: 'Invite 1 Friend',
      description: 'Invite your first friend',
      icon: '🫂',
      reward: 2000,
      type: 'milestone',
      category: 'partner',
      requiresVerification: false,
      requirement: { type: 'referrals', count: 1 }
    },
    {
      taskId: 'invite_5_friends',
      title: 'Invite 5 Friends',
      description: 'Invite 5 friends to join',
      icon: '👥',
      reward: 10000,
      type: 'milestone',
      category: 'partner',
      requiresVerification: false,
      requirement: { type: 'referrals', count: 5 }
    },
    {
      taskId: 'invite_10_friends',
      title: 'Invite 10 Friends',
      description: 'Invite 10 friends to join',
      icon: '🎉',
      reward: 20000,
      type: 'milestone',
      category: 'partner',
      requiresVerification: false,
      requirement: { type: 'referrals', count: 10 }
    },
    {
      taskId: 'invite_25_friends',
      title: 'Invite 25 Friends',
      description: 'Invite 25 friends to join',
      icon: '🌟',
      reward: 50000,
      type: 'milestone',
      category: 'partner',
      requiresVerification: false,
      requirement: { type: 'referrals', count: 25 }
    },
    {
      taskId: 'invite_50_friends',
      title: 'Invite 50 Friends',
      description: 'Invite 50 friends to join',
      icon: '💎',
      reward: 120000,
      type: 'milestone',
      category: 'partner',
      requiresVerification: false,
      requirement: { type: 'referrals', count: 50 }
    },
    {
      taskId: 'invite_100_friends',
      title: 'Invite 100 Friends',
      description: 'Become a Banana OG!',
      icon: '👑',
      reward: 300000,
      type: 'milestone',
      category: 'partner',
      requiresVerification: false,
      requirement: { type: 'referrals', count: 100 },
      badge: 'Banana OG'
    }
  ],

  // ============================================
  // 4️⃣ MINING TASKS
  // ============================================
  miningTasks: [
    {
      taskId: 'reach_1k_taps',
      title: 'Reach 1,000 Taps',
      description: 'Make your first 1,000 taps',
      icon: '🍌',
      reward: 1000,
      type: 'milestone',
      category: 'achievement',
      requiresVerification: false,
      requirement: { type: 'totalTaps', count: 1000 }
    },
    {
      taskId: 'reach_10k_taps',
      title: 'Reach 10,000 Taps',
      description: 'Make 10,000 total taps',
      icon: '🎯',
      reward: 5000,
      type: 'milestone',
      category: 'achievement',
      requiresVerification: false,
      requirement: { type: 'totalTaps', count: 10000 }
    },
    {
      taskId: 'reach_50k_taps',
      title: 'Reach 50,000 Taps',
      description: 'Make 50,000 total taps',
      icon: '⚡',
      reward: 20000,
      type: 'milestone',
      category: 'achievement',
      requiresVerification: false,
      requirement: { type: 'totalTaps', count: 50000 }
    },
    {
      taskId: 'reach_100k_taps',
      title: 'Reach 100,000 Taps',
      description: 'Make 100,000 total taps',
      icon: '🔥',
      reward: 50000,
      type: 'milestone',
      category: 'achievement',
      requiresVerification: false,
      requirement: { type: 'totalTaps', count: 100000 }
    },
    {
      taskId: 'reach_500k_taps',
      title: 'Reach 500,000 Taps',
      description: 'Make 500,000 total taps',
      icon: '💫',
      reward: 200000,
      type: 'milestone',
      category: 'achievement',
      requiresVerification: false,
      requirement: { type: 'totalTaps', count: 500000 }
    },
    {
      taskId: 'reach_1m_taps',
      title: 'Reach 1,000,000 Taps',
      description: 'Become a Banana Pro!',
      icon: '👑',
      reward: 500000,
      type: 'milestone',
      category: 'achievement',
      requiresVerification: false,
      requirement: { type: 'totalTaps', count: 1000000 },
      badge: 'Banana Pro'
    }
  ],

  // ============================================
  // 5️⃣ UPGRADE TASKS
  // ============================================
  upgradeTasks: [
    {
      taskId: 'buy_first_upgrade',
      title: 'Buy First Upgrade',
      description: 'Purchase your first upgrade',
      icon: '⚡',
      reward: 1000,
      type: 'milestone',
      category: 'achievement',
      requiresVerification: false,
      requirement: { type: 'upgradesPurchased', count: 1 }
    },
    {
      taskId: 'tap_power_level_5',
      title: 'Tap Power Level 5',
      description: 'Upgrade tap power to level 5',
      icon: '💪',
      reward: 5000,
      type: 'milestone',
      category: 'achievement',
      requiresVerification: false,
      requirement: { type: 'upgradeLevel', upgrade: 'tapPower', level: 5 }
    },
    {
      taskId: 'tap_power_level_10',
      title: 'Tap Power Level 10',
      description: 'Upgrade tap power to level 10',
      icon: '🔥',
      reward: 15000,
      type: 'milestone',
      category: 'achievement',
      requiresVerification: false,
      requirement: { type: 'upgradeLevel', upgrade: 'tapPower', level: 10 }
    },
    {
      taskId: 'buy_first_auto_miner',
      title: 'Buy First Auto Miner',
      description: 'Purchase auto miner upgrade',
      icon: '⛏️',
      reward: 2000,
      type: 'milestone',
      category: 'achievement',
      requiresVerification: false,
      requirement: { type: 'upgradeLevel', upgrade: 'autoMiner', level: 1 }
    },
    {
      taskId: 'auto_miner_level_5',
      title: 'Auto Miner Level 5',
      description: 'Upgrade auto miner to level 5',
      icon: '⚙️',
      reward: 10000,
      type: 'milestone',
      category: 'achievement',
      requiresVerification: false,
      requirement: { type: 'upgradeLevel', upgrade: 'autoMiner', level: 5 }
    },
    {
      taskId: 'auto_miner_level_10',
      title: 'Auto Miner Level 10',
      description: 'Upgrade auto miner to level 10',
      icon: '🏭',
      reward: 25000,
      type: 'milestone',
      category: 'achievement',
      requiresVerification: false,
      requirement: { type: 'upgradeLevel', upgrade: 'autoMiner', level: 10 }
    },
    {
      taskId: 'max_energy_upgrade',
      title: 'Max Energy Upgrade',
      description: 'Upgrade max energy to level 5',
      icon: '⚡',
      reward: 20000,
      type: 'milestone',
      category: 'achievement',
      requiresVerification: false,
      requirement: { type: 'upgradeLevel', upgrade: 'maxEnergy', level: 5 }
    }
  ],

  // ============================================
  // 6️⃣ SPECIAL EVENT TASKS (Weekly/Monthly)
  // ============================================
  specialEventTasks: [
    {
      taskId: 'banana_festival',
      title: 'Banana Festival',
      description: 'Tap 50,000 times in 1 day',
      icon: '🎊',
      reward: 50000,
      type: 'special',
      category: 'special',
      requiresVerification: false,
      requirement: { type: 'tapsInDay', count: 50000 },
      duration: 86400 // 24 hours
    },
    {
      taskId: 'flash_invite_event',
      title: 'Flash Event',
      description: 'Invite 10 people today',
      icon: '⚡',
      reward: 80000,
      type: 'special',
      category: 'special',
      requiresVerification: false,
      requirement: { type: 'referralsInDay', count: 10 },
      duration: 86400
    },
    {
      taskId: 'mega_boost_event',
      title: 'Mega Boost',
      description: 'Use 5 boosters in 24h',
      icon: '🚀',
      reward: 25000,
      type: 'special',
      category: 'special',
      requiresVerification: false,
      requirement: { type: 'boostersInDay', count: 5 },
      duration: 86400
    },
    {
      taskId: 'golden_banana_hunt',
      title: 'Golden Banana Hunt',
      description: 'Find the golden banana!',
      icon: '🏆',
      reward: 0, // Random 10k-100k
      type: 'special',
      category: 'special',
      requiresVerification: false,
      rewardRange: { min: 10000, max: 100000 }
    }
  ],

  // ============================================
  // 🏆 ACHIEVEMENT SYSTEM (PERMANENT)
  // ============================================
  
  // 🥇 1. Tapping Achievements
  tappingAchievements: [
    {
      achievementId: 'baby_banana',
      title: 'Baby Banana',
      description: 'Reach 10,000 taps',
      icon: '🍌',
      reward: 5000,
      badge: 'Baby Banana',
      requirement: { type: 'totalTaps', count: 10000 }
    },
    {
      achievementId: 'monkey_mode',
      title: 'Monkey Mode',
      description: 'Reach 50,000 taps',
      icon: '🐵',
      reward: 20000,
      badge: 'Monkey Mode',
      requirement: { type: 'totalTaps', count: 50000 }
    },
    {
      achievementId: 'jungle_king',
      title: 'Jungle King',
      description: 'Reach 100,000 taps',
      icon: '🦍',
      reward: 40000,
      badge: 'Jungle King',
      requirement: { type: 'totalTaps', count: 100000 }
    },
    {
      achievementId: 'planet_banana',
      title: 'Planet Banana',
      description: 'Reach 500,000 taps',
      icon: '🌍',
      reward: 150000,
      badge: 'Planet Banana',
      requirement: { type: 'totalTaps', count: 500000 }
    },
    {
      achievementId: 'galaxy_banana',
      title: 'Galaxy Banana',
      description: 'Reach 1,000,000 taps',
      icon: '🌌',
      reward: 300000,
      badge: 'Galaxy Banana',
      requirement: { type: 'totalTaps', count: 1000000 }
    }
  ],

  // 💰 2. Mining Power Achievements
  miningPowerAchievements: [
    {
      achievementId: 'power_rookie',
      title: 'Power Rookie',
      description: 'Reach Tap Power Level 5',
      icon: '⚡',
      reward: 5000,
      badge: 'Power Rookie',
      requirement: { type: 'upgradeLevel', upgrade: 'tapPower', level: 5 }
    },
    {
      achievementId: 'power_master',
      title: 'Power Master',
      description: 'Reach Tap Power Level 10',
      icon: '💪',
      reward: 15000,
      badge: 'Power Master',
      requirement: { type: 'upgradeLevel', upgrade: 'tapPower', level: 10 }
    },
    {
      achievementId: 'power_legend',
      title: 'Power Legend',
      description: 'Reach Tap Power Level 20',
      icon: '👑',
      reward: 40000,
      badge: 'Power Legend',
      requirement: { type: 'upgradeLevel', upgrade: 'tapPower', level: 20 }
    }
  ],

  // 👥 3. Referral Achievements
  referralAchievements: [
    {
      achievementId: 'banana_promoter',
      title: 'Banana Promoter',
      description: 'Invite 5 friends',
      icon: '📢',
      reward: 10000,
      badge: 'Banana Promoter',
      requirement: { type: 'referrals', count: 5 }
    },
    {
      achievementId: 'banana_ambassador',
      title: 'Banana Ambassador',
      description: 'Invite 25 friends',
      icon: '🎖️',
      reward: 50000,
      badge: 'Banana Ambassador',
      requirement: { type: 'referrals', count: 25 }
    },
    {
      achievementId: 'banana_minister',
      title: 'Banana Minister',
      description: 'Invite 100 friends',
      icon: '👑',
      reward: 150000,
      badge: 'OG Badge',
      requirement: { type: 'referrals', count: 100 }
    },
    {
      achievementId: 'banana_president',
      title: 'Banana President',
      description: 'Invite 500 friends',
      icon: '🏆',
      reward: 1000000,
      badge: 'Super OG Badge',
      requirement: { type: 'referrals', count: 500 }
    }
  ],

  // 🎁 4. Login / Activity Achievements
  activityAchievements: [
    {
      achievementId: 'week_warrior',
      title: 'Week Warrior',
      description: 'Login 7 days straight',
      icon: '📅',
      reward: 10000,
      badge: 'Week Warrior',
      requirement: { type: 'loginStreak', days: 7 }
    },
    {
      achievementId: 'month_master',
      title: 'Month Master',
      description: 'Login 30 days straight',
      icon: '📆',
      reward: 50000,
      badge: 'Month Master',
      requirement: { type: 'loginStreak', days: 30 }
    },
    {
      achievementId: 'century_champion',
      title: 'Century Champion',
      description: 'Login 100 days straight',
      icon: '💯',
      reward: 200000,
      badge: 'Century Champion',
      requirement: { type: 'loginStreak', days: 100 }
    }
  ]
};
