const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');
const { verifyToken, checkBanned, verifyAdmin } = require('../middleware/auth');
const { apiLimiter } = require('../middleware/rateLimit');

// All routes require authentication
router.use(verifyToken);
router.use(checkBanned);

// User routes
router.get('/list', apiLimiter, taskController.getTasks);
router.post('/verify', apiLimiter, taskController.verifyTask);
router.post('/claim', apiLimiter, taskController.claimTask);
router.post('/complete', apiLimiter, taskController.completeTask);

// Admin routes
router.post('/create', verifyAdmin, taskController.createTask);
router.post('/delete', verifyAdmin, taskController.deleteTask);
router.get('/all', verifyAdmin, taskController.getAllTasks);

module.exports = router;
