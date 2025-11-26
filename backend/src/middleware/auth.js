const crypto = require('crypto');
const jwt = require('jsonwebtoken');

// Validate Telegram WebApp initData
function validateTelegramWebAppData(initData) {
  try {
    // Skip validation in development mode or if initData is empty
    if (!initData || initData.trim() === '') {
      console.log('⚠️ Empty initData - skipping validation');
      return false;
    }
    
    const urlParams = new URLSearchParams(initData);
    const hash = urlParams.get('hash');
    
    if (!hash) {
      console.log('⚠️ No hash in initData - skipping validation');
      return false;
    }
    
    urlParams.delete('hash');
    
    const dataCheckString = Array.from(urlParams.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, value]) => `${key}=${value}`)
      .join('\n');
    
    const secretKey = crypto
      .createHmac('sha256', 'WebAppData')
      .update(process.env.BOT_TOKEN)
      .digest();
    
    const calculatedHash = crypto
      .createHmac('sha256', secretKey)
      .update(dataCheckString)
      .digest('hex');
    
    const isValid = calculatedHash === hash;
    
    if (!isValid) {
      console.log('⚠️ Invalid Telegram hash');
    }
    
    return isValid;
  } catch (error) {
    console.error('Validation error:', error);
    return false;
  }
}

// Extract user data from initData
function extractUserData(initData) {
  try {
    const urlParams = new URLSearchParams(initData);
    const userParam = urlParams.get('user');
    
    if (!userParam) return null;
    
    const user = JSON.parse(decodeURIComponent(userParam));
    return {
      userId: user.id.toString(),
      username: user.username || '',
      firstName: user.first_name || '',
      lastName: user.last_name || ''
    };
  } catch (error) {
    return null;
  }
}

// Middleware to verify JWT token
const verifyToken = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

// Middleware to check if user is banned
const checkBanned = async (req, res, next) => {
  try {
    const User = require('../models/User');
    const user = await User.findOne({ userId: req.userId });
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    if (user.isBanned) {
      return res.status(403).json({ 
        error: 'Account banned',
        reason: user.banReason 
      });
    }
    
    // Update last active
    user.lastActive = new Date();
    await user.save();
    
    next();
  } catch (error) {
    return res.status(500).json({ error: 'Server error' });
  }
};

// Admin middleware
const verifyAdmin = (req, res, next) => {
  try {
    const adminIds = process.env.ADMIN_TELEGRAM_IDS?.split(',') || [];
    
    if (!adminIds.includes(req.userId)) {
      return res.status(403).json({ error: 'Admin access required' });
    }
    
    next();
  } catch (error) {
    return res.status(500).json({ error: 'Server error' });
  }
};

module.exports = {
  validateTelegramWebAppData,
  extractUserData,
  verifyToken,
  checkBanned,
  verifyAdmin
};
