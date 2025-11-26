const express = require('express');
const router = express.Router();
const leaderboardController = require('../controllers/leaderboardController');
const { verifyToken, checkBanned } = require('../middleware/auth');
const { apiLimiter } = require('../middleware/rateLimit');

router.use(verifyToken);
router.use(checkBanned);

router.get('/:type', apiLimiter, leaderboardController.getLeaderboard);
router.get('/referral/top', apiLimiter, leaderboardController.getReferralLeaderboard);

module.exports = router;
