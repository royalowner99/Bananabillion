const rateLimit = require('express-rate-limit');

// General API rate limiter
const apiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100,
  message: { error: 'Too many requests, please try again later' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Strict limiter for tap endpoint
const tapLimiter = rateLimit({
  windowMs: 1000, // 1 second
  max: 20, // Allow some buffer over MAX_TAPS_PER_SECOND
  message: { error: 'Too many taps, slow down!' },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.userId || req.ip
});

// Auth limiter
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  message: { error: 'Too many authentication attempts' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Withdraw limiter
const withdrawLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5,
  message: { error: 'Too many withdrawal requests' },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.userId || req.ip
});

// Game limiter for mini games
const gameLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30, // 30 games per minute max
  message: { error: 'Too many game requests, please slow down' },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.userId || req.ip
});

module.exports = {
  apiLimiter,
  tapLimiter,
  authLimiter,
  withdrawLimiter,
  gameLimiter
};
