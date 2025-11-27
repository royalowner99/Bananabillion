const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const path = require('path');

const app = express();

// Security middleware
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false
}));

// CORS
app.use(cors({
  origin: '*',
  credentials: true
}));

// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Compression
app.use(compression());

// Root endpoint - API info
app.get('/api', (req, res) => {
  res.json({
    name: 'BananaBillion API',
    version: '1.0.0',
    status: 'running',
    endpoints: {
      health: '/health',
      auth: '/api/auth/telegram',
      user: '/api/user/*',
      tasks: '/api/tasks/*',
      leaderboard: '/api/leaderboard/*'
    }
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    mongodb: require('mongoose').connection.readyState === 1 ? 'connected' : 'disconnected',
    webappUrl: process.env.WEBAPP_URL || 'not set',
    botToken: process.env.BOT_TOKEN ? 'set' : 'not set',
    jwtSecret: process.env.JWT_SECRET ? 'set' : 'not set'
  });
});

// API Routes
app.use('/api/auth', require('./src/routes/auth'));
app.use('/api/user', require('./src/routes/user'));
app.use('/api/tasks', require('./src/routes/task'));
app.use('/api/referrals', require('./src/routes/referral'));
app.use('/api/leaderboard', require('./src/routes/leaderboard'));
app.use('/api/withdraw', require('./src/routes/withdraw'));
app.use('/api/admin', require('./src/routes/admin'));
app.use('/api/minigames', require('./src/routes/miniGame'));
app.use('/api/lottery', require('./src/routes/lottery'));
app.use('/api/spin', require('./src/routes/dailySpin'));

// BBN System Routes
try {
  app.use('/api/payment', require('./src/routes/payment'));
  app.use('/api/booster', require('./src/routes/booster'));
  app.use('/api/withdrawal', require('./src/routes/withdrawal'));
  app.use('/api/mining', require('./src/routes/mining'));
  app.use('/api/shop', require('./src/routes/shop'));
  console.log('✅ BBN routes loaded');
} catch (error) {
  console.error('⚠️ BBN routes not loaded:', error.message);
  // Server continues even if BBN routes fail
}

// Serve frontend (only for non-API routes)
app.use(express.static(path.join(__dirname, '../frontend')));

// Catch-all route for frontend (must be last)
app.get('*', (req, res) => {
  // Don't serve frontend for API routes
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ error: 'API endpoint not found' });
  }
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

module.exports = app;
