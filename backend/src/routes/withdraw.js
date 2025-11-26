const express = require('express');
const router = express.Router();
const withdrawController = require('../controllers/withdrawController');
const { verifyToken, checkBanned, verifyAdmin } = require('../middleware/auth');
const { apiLimiter, withdrawLimiter } = require('../middleware/rateLimit');

router.use(verifyToken);
router.use(checkBanned);

router.post('/request', withdrawLimiter, withdrawController.requestWithdraw);
router.get('/history', apiLimiter, withdrawController.getWithdrawHistory);
router.post('/update', verifyAdmin, withdrawController.updateWithdrawStatus);
router.get('/pending', verifyAdmin, withdrawController.getPendingWithdrawals);

module.exports = router;
