const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { verifyToken, verifyAdmin } = require('../middleware/auth');
const { apiLimiter } = require('../middleware/rateLimit');

router.use(verifyToken);
router.use(verifyAdmin);

router.get('/stats', apiLimiter, adminController.getStats);
router.get('/users', apiLimiter, adminController.getUsers);
router.post('/ban', apiLimiter, adminController.banUser);
router.post('/unban', apiLimiter, adminController.unbanUser);
router.post('/balance', apiLimiter, adminController.editBalance);
router.post('/broadcast', apiLimiter, adminController.broadcast);

module.exports = router;
