const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { verifyToken, checkBanned } = require('../middleware/auth');
const { apiLimiter } = require('../middleware/rateLimit');

// Public routes
router.get('/key', paymentController.getRazorpayKey);
router.post('/webhook', express.raw({ type: 'application/json' }), paymentController.webhook);

// Protected routes
router.use(verifyToken);
router.use(checkBanned);

router.post('/create-order', apiLimiter, paymentController.createOrder);
router.post('/verify', apiLimiter, paymentController.verifyPayment);
router.get('/history', apiLimiter, paymentController.getPaymentHistory);

module.exports = router;
