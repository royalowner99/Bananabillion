const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { verifyToken, checkBanned } = require('../middleware/auth');
const { apiLimiter, tapLimiter } = require('../middleware/rateLimit');

router.use(verifyToken);
router.use(checkBanned);

router.get('/profile', apiLimiter, userController.getProfile);
router.post('/tap', tapLimiter, userController.tap);
router.post('/upgrade', apiLimiter, userController.upgrade);
router.get('/upgrades', apiLimiter, userController.getUpgrades);
router.post('/daily', apiLimiter, userController.claimDaily);

module.exports = router;
