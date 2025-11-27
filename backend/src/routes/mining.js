const express = require('express');
const router = express.Router();
const miningController = require('../controllers/miningController');
const { verifyToken, checkBanned } = require('../middleware/auth');
const { apiLimiter } = require('../middleware/rateLimit');

router.use(verifyToken);
router.use(checkBanned);

router.post('/tap', apiLimiter, miningController.tap);
router.get('/stats', apiLimiter, miningController.getMiningStats);
router.post('/claim-auto-miner', apiLimiter, miningController.claimAutoMiner);
router.post('/claim-daily-bonus', apiLimiter, miningController.claimDailyBonus);
router.post('/claim-streak-reward', apiLimiter, miningController.claimStreakReward);

module.exports = router;
