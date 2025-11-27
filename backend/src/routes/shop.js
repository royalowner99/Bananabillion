const express = require('express');
const router = express.Router();
const shopController = require('../controllers/shopController');
const { verifyToken, checkBanned, verifyAdmin } = require('../middleware/auth');
const { apiLimiter } = require('../middleware/rateLimit');

router.use(verifyToken);
router.use(checkBanned);

// Wheel Spin
router.get('/wheel/config', apiLimiter, shopController.getWheelConfig);
router.post('/wheel/spin', apiLimiter, shopController.spinWheel);

// Mystery Box
router.get('/mystery-box/info', apiLimiter, shopController.getMysteryBoxInfo);
router.post('/mystery-box/open', apiLimiter, shopController.openMysteryBox);

// Banana Pass
router.get('/banana-pass/info', apiLimiter, shopController.getBananaPassInfo);
router.post('/banana-pass/activate', apiLimiter, shopController.activateBananaPass);
router.post('/banana-pass/claim-reward', apiLimiter, shopController.claimPassReward);

// Admin
router.get('/stats', verifyAdmin, shopController.getShopStats);

module.exports = router;
