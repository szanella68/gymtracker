const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const { database } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Register new user
router.post('/register', async (req, res) => {
  try {
    const { email, password, full_name, user_type = 'standard' } = req.body;

    // Validation
    if (!email || !password || !full_name) {
      return res.status(400).json({ 
        error: 'Email, password, and full name are required' 
      });
    }

    if (password.length < 6) {
      return res.status(400).json({ 
        error: 'Password must be at least 6 characters long' 
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    // Only admin can create admin users
    const finalUserType = user_type === 'admin' ? 'standard' : user_type;

    // Check if user already exists
    const existingUser = await database.getQuery(
      'SELECT id FROM users WHERE email = ?',
      [email.toLowerCase()]
    );

    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    // Hash password
    const saltRounds = parseInt(process.env.BCRYPT_ROUNDS) || 12;
    const password_hash = await bcrypt.hash(password, saltRounds);

    // Create user
    const userResult = await database.runQuery(
      'INSERT INTO users (email, password_hash, full_name, user_type) VALUES (?, ?, ?, ?)',
      [email.toLowerCase(), password_hash, full_name, finalUserType]
    );

    // Create user profile
    await database.runQuery(
      'INSERT INTO user_profiles (user_id) VALUES (?)',
      [userResult.id]
    );

    // Create session token
    const token = jwt.sign(
      { userId: userResult.id, email: email.toLowerCase(), type: finalUserType },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    // Store session in database
    const expiresAt = new Date(Date.now() + (7 * 24 * 60 * 60 * 1000)); // 7 days
    await database.runQuery(
      'INSERT INTO user_sessions (user_id, session_token, expires_at, ip_address, user_agent) VALUES (?, ?, ?, ?, ?)',
      [userResult.id, token, expiresAt.toISOString(), req.ip, req.get('User-Agent')]
    );

    // Update last login
    await database.runQuery(
      'UPDATE users SET last_login = datetime(\'now\') WHERE id = ?',
      [userResult.id]
    );

    res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: userResult.id,
        email: email.toLowerCase(),
        full_name: full_name,
        user_type: finalUserType
      },
      session: {
        access_token: token,
        expires_in: process.env.JWT_EXPIRES_IN || '7d'
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// Login user
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ 
        error: 'Email and password are required' 
      });
    }

    // Get user from database
    const user = await database.getQuery(
      'SELECT * FROM users WHERE email = ? AND is_active = 1',
      [email.toLowerCase()]
    );

    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Deactivate old sessions for this user (optional - for security)
    await database.runQuery(
      'UPDATE user_sessions SET is_active = 0 WHERE user_id = ? AND is_active = 1',
      [user.id]
    );

    // Create new session token
    const token = jwt.sign(
      { userId: user.id, email: user.email, type: user.user_type },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    // Store session in database
    const expiresAt = new Date(Date.now() + (7 * 24 * 60 * 60 * 1000)); // 7 days
    await database.runQuery(
      'INSERT INTO user_sessions (user_id, session_token, expires_at, ip_address, user_agent) VALUES (?, ?, ?, ?, ?)',
      [user.id, token, expiresAt.toISOString(), req.ip, req.get('User-Agent')]
    );

    // Update last login
    await database.runQuery(
      'UPDATE users SET last_login = datetime(\'now\') WHERE id = ?',
      [user.id]
    );

    res.json({
      message: 'Login successful',
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        user_type: user.user_type
      },
      session: {
        access_token: token,
        expires_in: process.env.JWT_EXPIRES_IN || '7d'
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Logout user
router.post('/logout', authenticateToken, async (req, res) => {
  try {
    // Deactivate current session
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      await database.runQuery(
        'UPDATE user_sessions SET is_active = 0 WHERE session_token = ?',
        [token]
      );
    }

    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ error: 'Logout failed' });
  }
});

// Logout from all devices
router.post('/logout-all', authenticateToken, async (req, res) => {
  try {
    // Deactivate all sessions for this user
    await database.runQuery(
      'UPDATE user_sessions SET is_active = 0 WHERE user_id = ? AND is_active = 1',
      [req.user.id]
    );

    res.json({ message: 'Logged out from all devices successfully' });
  } catch (error) {
    console.error('Logout all error:', error);
    res.status(500).json({ error: 'Logout failed' });
  }
});

// Refresh token
router.post('/refresh', authenticateToken, async (req, res) => {
  try {
    const user = await database.getQuery(
      'SELECT * FROM users WHERE id = ? AND is_active = 1',
      [req.user.id]
    );

    if (!user) {
      return res.status(401).json({ error: 'User not found or inactive' });
    }

    // Generate new token
    const newToken = jwt.sign(
      { userId: user.id, email: user.email, type: user.user_type },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    // Update session token
    const authHeader = req.headers['authorization'];
    const oldToken = authHeader && authHeader.split(' ')[1];
    
    const expiresAt = new Date(Date.now() + (7 * 24 * 60 * 60 * 1000)); // 7 days
    
    await database.runQuery(
      'UPDATE user_sessions SET session_token = ?, expires_at = ?, last_used = datetime(\'now\') WHERE session_token = ?',
      [newToken, expiresAt.toISOString(), oldToken]
    );

    res.json({
      message: 'Token refreshed successfully',
      session: {
        access_token: newToken,
        expires_in: process.env.JWT_EXPIRES_IN || '7d'
      }
    });

  } catch (error) {
    console.error('Refresh token error:', error);
    res.status(500).json({ error: 'Token refresh failed' });
  }
});

// Get current user sessions
router.get('/sessions', authenticateToken, async (req, res) => {
  try {
    const sessions = await database.allQuery(
      `SELECT id, created_at, last_used, ip_address, user_agent, is_active, 
              CASE WHEN session_token = ? THEN 1 ELSE 0 END as is_current
       FROM user_sessions 
       WHERE user_id = ? AND expires_at > datetime('now')
       ORDER BY last_used DESC`,
      [req.headers['authorization']?.split(' ')[1], req.user.id]
    );

    res.json({ sessions });
  } catch (error) {
    console.error('Get sessions error:', error);
    res.status(500).json({ error: 'Failed to get sessions' });
  }
});

module.exports = router;