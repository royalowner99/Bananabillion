const express = require('express');
const router = express.Router();
const dailySpinController = require('../controllers/dailySpinController');
const { verifyToken, checkBanned } = require('../middleware/auth');
const { gameLimiter } = require('../middleware/rateLimit');

router.get('/status', verifyToken, checkBanned, dailySpinController.getSpinStatus);
router.post('/spin', verifyToken, checkBanned, gameLimiter, dailySpinController.spin);

module.exports = router;
