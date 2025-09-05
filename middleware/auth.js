const jwt = require('jsonwebtoken');
const { database } = require('../config/database');

// Middleware to verify JWT token
async function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Check if session is still active in database
    const session = await database.getQuery(
      `SELECT s.*, u.id, u.email, u.full_name, u.user_type, u.is_active 
       FROM user_sessions s 
       JOIN users u ON s.user_id = u.id 
       WHERE s.session_token = ? AND s.is_active = 1 AND s.expires_at > datetime('now')`,
      [token]
    );

    if (!session || !session.is_active) {
      return res.status(401).json({ error: 'Invalid or expired session' });
    }

    // Update last used timestamp
    await database.runQuery(
      'UPDATE user_sessions SET last_used = datetime(\'now\') WHERE session_token = ?',
      [token]
    );

    // Attach user info to request
    req.user = {
      id: session.user_id,
      email: session.email,
      full_name: session.full_name,
      user_type: session.user_type,
      session_id: session.id
    };

    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid token' });
    } else if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired' });
    }
    
    return res.status(500).json({ error: 'Authentication failed' });
  }
}

// Middleware to check if user is admin
function requireAdmin(req, res, next) {
  if (req.user.user_type !== 'admin') {
    return res.status(403).json({ error: 'Admin privileges required' });
  }
  next();
}

// Middleware to check if user owns resource or is admin
function requireOwnershipOrAdmin(userIdField = 'user_id') {
  return (req, res, next) => {
    const resourceUserId = req.params[userIdField] || req.body[userIdField];
    
    if (req.user.user_type === 'admin' || req.user.id.toString() === resourceUserId) {
      next();
    } else {
      return res.status(403).json({ error: 'Access denied: insufficient permissions' });
    }
  };
}

// Optional auth - doesn't fail if no token provided
async function optionalAuth(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    req.user = null;
    return next();
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    const session = await database.getQuery(
      `SELECT s.*, u.id, u.email, u.full_name, u.user_type, u.is_active 
       FROM user_sessions s 
       JOIN users u ON s.user_id = u.id 
       WHERE s.session_token = ? AND s.is_active = 1 AND s.expires_at > datetime('now')`,
      [token]
    );

    if (session && session.is_active) {
      req.user = {
        id: session.user_id,
        email: session.email,
        full_name: session.full_name,
        user_type: session.user_type,
        session_id: session.id
      };
    } else {
      req.user = null;
    }
  } catch (error) {
    req.user = null;
  }

  next();
}

module.exports = {
  authenticateToken,
  requireAdmin,
  requireOwnershipOrAdmin,
  optionalAuth
};