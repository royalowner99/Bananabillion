const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');
const { verifyToken, checkBanned, verifyAdmin } = require('../middleware/auth');
const { apiLimiter } = require('../middleware/rateLimit');

router.use(verifyToken);
router.use(checkBanned);

router.get('/list', apiLimiter, taskController.getTasks);
router.post('/complete', apiLimiter, taskController.completeTask);
router.post('/create', verifyAdmin, taskController.createTask);

module.exports = router;
