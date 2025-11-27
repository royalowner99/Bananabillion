const express = require('express');
const router = express.Router();
const boosterController = require('../controllers/boosterController');
const { verifyToken, checkBanned, verifyAdmin } = require('../middleware/auth');
const { apiLimiter } = require('../middleware/rateLimit');

router.use(verifyToken);
router.use(checkBanned);

// User routes
router.get('/list', apiLimiter, boosterController.getBoosters);
router.post('/activate-free', apiLimiter, boosterController.activateFreeBooster);
router.get('/active', apiLimiter, boosterController.getActiveBoosters);

// Admin routes
router.post('/create', verifyAdmin, boosterController.createBooster);
router.put('/:boosterId', verifyAdmin, boosterController.updateBooster);
router.delete('/:boosterId', verifyAdmin, boosterController.deleteBooster);

module.exports = router;
