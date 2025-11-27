const express = require('express');
const router = express.Router();
const withdrawalController = require('../controllers/withdrawalController');
const { verifyToken, checkBanned, verifyAdmin } = require('../middleware/auth');
const { apiLimiter } = require('../middleware/rateLimit');

router.use(verifyToken);
router.use(checkBanned);

// User routes
router.post('/request', apiLimiter, withdrawalController.requestWithdrawal);
router.get('/history', apiLimiter, withdrawalController.getWithdrawalHistory);
router.get('/status/:withdrawalId', apiLimiter, withdrawalController.getWithdrawalStatus);

// Admin routes
router.get('/all', verifyAdmin, withdrawalController.getAllWithdrawals);
router.post('/approve/:withdrawalId', verifyAdmin, withdrawalController.approveWithdrawal);
router.post('/reject/:withdrawalId', verifyAdmin, withdrawalController.rejectWithdrawal);
router.get('/stats', verifyAdmin, withdrawalController.getWithdrawalStats);

module.exports = router;
