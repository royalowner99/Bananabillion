const express = require('express');
const router = express.Router();
const miniGameController = require('../controllers/miniGameController');
const { verifyToken, checkBanned } = require('../middleware/auth');
const { gameLimiter } = require('../middleware/rateLimit');

router.post('/coinflip', verifyToken, checkBanned, gameLimiter, miniGameController.playCoinFlip);
router.post('/dice', verifyToken, checkBanned, gameLimiter, miniGameController.playDice);
router.post('/slots', verifyToken, checkBanned, gameLimiter, miniGameController.playSlots);
router.get('/stats', verifyToken, checkBanned, miniGameController.getStats);

module.exports = router;
