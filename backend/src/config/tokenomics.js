// BananaBillion Token Configuration

module.exports = {
  // Token Details
  TOKEN_NAME: 'BananaBillion',
  TOKEN_SYMBOL: '$BANANA',
  TOKEN_DECIMALS: 9,
  TOTAL_SUPPLY: 1000000000000, // 1 Trillion
  
  // Distribution (percentages)
  DISTRIBUTION: {
    COMMUNITY_REWARDS: 40, // 400B tokens
    LIQUIDITY_POOL: 20,    // 200B tokens
    TEAM_DEV: 15,          // 150B tokens
    MARKETING: 10,         // 100B tokens
    STAKING_REWARDS: 10,   // 100B tokens
    AIRDROP: 5             // 50B tokens
  },
  
  // Earning Rates (tokens per action)
  EARNING_RATES: {
    TAP_BASE: 1,           // Base tokens per tap
    REFERRAL_BONUS: 0.2,   // 20% of referee earnings
    DAILY_REWARD_BASE: 100,
    TASK_REWARD_MIN: 50,
    TASK_REWARD_MAX: 5000,
    MINI_GAME_WIN: 10,
    LOTTERY_TICKET: 100
  },
  
  // Conversion Rates
  CONVERSION: {
    COINS_TO_TOKENS: 1,    // 1 coin = 1 token
    TOKENS_TO_COINS: 1     // 1 token = 1 coin
  },
  
  // Staking (Coming Soon)
  STAKING: {
    LOCK_PERIODS: {
      DAYS_7: { days: 7, apy: 10 },
      DAYS_30: { days: 30, apy: 25 },
      DAYS_90: { days: 90, apy: 50 },
      DAYS_180: { days: 180, apy: 100 }
    },
    EARLY_UNSTAKE_PENALTY: 10, // 10% penalty
    MIN_STAKE: 1000,
    MAX_STAKE: 1000000000
  },
  
  // Airdrop Criteria
  AIRDROP: {
    MIN_BALANCE: 10000,
    MIN_REFERRALS: 5,
    MIN_TASKS: 10,
    SNAPSHOT_DATE: '2025-01-01',
    DISTRIBUTION_RATIO: 1 // 1:1 ratio
  },
  
  // Token Launch
  LAUNCH: {
    PRESALE_PRICE: 0.000001,  // USD per token
    LISTING_PRICE: 0.000002,  // USD per token
    INITIAL_LIQUIDITY: 200000000000, // 200B tokens
    VESTING_TEAM: 12,         // 12 months
    VESTING_MARKETING: 6      // 6 months
  },
  
  // Burn Mechanism
  BURN: {
    ENABLED: true,
    TRANSACTION_FEE: 0.01,    // 1% burn on transfers
    GAME_FEE: 0.005,          // 0.5% burn on game actions
    MAX_BURN: 500000000000    // Max 500B tokens (50%)
  },
  
  // Governance
  GOVERNANCE: {
    MIN_TOKENS_TO_VOTE: 100000,
    PROPOSAL_THRESHOLD: 1000000,
    VOTING_PERIOD_DAYS: 7,
    QUORUM_PERCENTAGE: 10
  }
};
