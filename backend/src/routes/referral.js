const express = require('express');
const router = express.Router();
const referralController = require('../controllers/referralController');
const { verifyToken, checkBanned } = require('../middleware/auth');
const { apiLimiter } = require('../middleware/rateLimit');

router.use(verifyToken);
router.use(checkBanned);

router.get('/stats', apiLimiter, referralController.getReferralStats);
router.post('/activate', apiLimiter, referralController.activateReferral);

module.exports = router;
