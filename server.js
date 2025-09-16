const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const trainerRoutes = require('./routes/trainer');
const adminRoutes = require('./routes/admin');
const { ensureSupabaseSchema } = require('./config/supabase');

const app = express();
const PORT = process.env.PORT || 3010;

// Behind Apache we want to trust proxy headers (X-Forwarded-*)
// Avoid permissive setting that breaks express-rate-limit validation
// If behind a single reverse proxy (Apache/Nginx) on the same host, set to 1
// or configure via env TRUST_PROXY (e.g. '127.0.0.1', 'loopback', 'uniquelocal')
app.set('trust proxy', process.env.TRUST_PROXY || 1);

// Security middleware
app.use(helmet({
  contentSecurityPolicy: false, // Disable for development
  crossOriginEmbedderPolicy: false
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  message: { error: 'Too many requests, please try again later' }
});
app.use('/api/', limiter);

// CORS configuration
app.use(cors({
  origin: [
    'http://localhost:3010',
    'https://zanserver.sytes.net',
    process.env.FRONTEND_URL || 'https://zanserver.sytes.net'
  ],
  credentials: true,
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static files - serve frontend from public directory
app.use('/gymtracker', express.static(path.join(__dirname, 'public')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/trainer', trainerRoutes);
app.use('/api/admin', adminRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development'
  });
});

// Avoid favicon 404s at root
app.get('/favicon.ico', (req, res) => res.status(204).end());

// Catch-all route for frontend (SPA support)
app.get('/gymtracker/*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// 404 handler for API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({ error: 'API endpoint not found' });
});

// Global error handler
app.use((error, req, res, next) => {
  console.error('Global error handler:', error);
  res.status(error.status || 500).json({
    error: error.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
  });
});

// Initialize database and start server
async function startServer() {
  try {
    const dbProvider = (process.env.DB_PROVIDER || 'supabase').toLowerCase();
    await ensureSupabaseSchema();
    console.log('✅ Supabase mode: schema ensured');
    
    app.listen(PORT, () => {
      console.log('========================================');
      console.log('   🏋️ GymTracker Server Started');
      console.log('========================================');
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📱 Frontend: https://zanserver.sytes.net/gymtracker/`);
      console.log(`🔗 API Health: http://localhost:${PORT}/api/health`);
      console.log(`🔒 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🗄  DB Provider: ${dbProvider}`);
      console.log('========================================');
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('📴 Shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('📴 Shutting down gracefully...');
  process.exit(0);
});

startServer();
