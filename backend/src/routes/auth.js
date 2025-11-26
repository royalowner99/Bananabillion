const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authLimiter } = require('../middleware/rateLimit');

router.post('/telegram', authLimiter, authController.telegramAuth);

module.exports = router;
