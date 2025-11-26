const express = require('express');
const router = express.Router();
const lotteryController = require('../controllers/lotteryController');
const { verifyToken, checkBanned } = require('../middleware/auth');
const { gameLimiter } = require('../middleware/rateLimit');

router.get('/current', verifyToken, checkBanned, lotteryController.getCurrentRound);
router.post('/buy', verifyToken, checkBanned, gameLimiter, lotteryController.buyTicket);
router.get('/history', verifyToken, checkBanned, lotteryController.getHistory);

module.exports = router;
