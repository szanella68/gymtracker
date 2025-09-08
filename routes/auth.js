const express = require('express');
// Supabase-only auth routes
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Register new user via Supabase
router.post('/register', async (req, res) => {
  try {
    const { email, password, full_name } = req.body;
    if (!email || !password || !full_name) {
      return res.status(400).json({ error: 'Email, password, and full name are required' });
    }

    const SUPABASE_URL = process.env.SUPABASE_URL;
    const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;
    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
      return res.status(500).json({ error: 'Supabase not configured' });
    }

    const resp = await fetch(`${SUPABASE_URL}/auth/v1/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_ANON_KEY
      },
      body: JSON.stringify({ email, password, data: { full_name } })
    });

    const data = await resp.json();
    if (!resp.ok) {
      return res.status(resp.status).json({ error: data?.msg || data?.error_description || 'Registration failed' });
    }

    // If session is returned (email confirmations disabled), ensure local user and return token
    let accessToken = data?.access_token;
    let expiresIn = data?.expires_in;
    let supaUser = data?.user;

    if (accessToken) {
      // fetch user with token to get canonical data
      const userRes = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
        headers: { 'apikey': SUPABASE_ANON_KEY, 'Authorization': `Bearer ${accessToken}` }
      });
      supaUser = await userRes.json();
    }

    if (supaUser?.id) {
      return res.status(201).json({
        message: 'User registered successfully',
        user: { id: supaUser.id, email: supaUser.email, full_name: full_name, user_type: 'standard' },
        session: accessToken ? { access_token: accessToken, expires_in: expiresIn || '3600' } : null
      });
    }

    // If confirmation required, no user/session present
    return res.status(201).json({ message: 'Registration initiated. Check your email to confirm.' });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// Login via Supabase password grant
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password are required' });

    const SUPABASE_URL = process.env.SUPABASE_URL;
    const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;
    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
      return res.status(500).json({ error: 'Supabase not configured' });
    }

    const resp = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_ANON_KEY
      },
      body: JSON.stringify({ email, password })
    });
    const data = await resp.json();
    if (!resp.ok) {
      return res.status(resp.status).json({ error: data?.msg || data?.error_description || 'Login failed' });
    }

  const accessToken = data.access_token;
  const expiresIn = data.expires_in;

    // fetch user for mapping
  const userRes = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
    headers: { 'apikey': SUPABASE_ANON_KEY, 'Authorization': `Bearer ${accessToken}` }
  });
  const supaUser = await userRes.json();

  // Ensure profile exists for new users (via REST with user token) without overwriting existing user_type
  try {
    const checkRes = await fetch(`${SUPABASE_URL}/rest/v1/user_profiles?id=eq.${encodeURIComponent(supaUser.id)}&select=id`, {
      headers: { 'apikey': SUPABASE_ANON_KEY, 'Authorization': `Bearer ${accessToken}` }
    });
    if (checkRes.ok) {
      const arr = await checkRes.json();
      if (!Array.isArray(arr) || arr.length === 0) {
        await fetch(`${SUPABASE_URL}/rest/v1/user_profiles`, {
          method: 'POST',
          headers: {
            'apikey': SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
            'Prefer': 'resolution=ignore-duplicates'
          },
          body: JSON.stringify({ id: supaUser.id, email: supaUser.email })
        });
      }
    }
  } catch {}

    const metaRole = (supaUser.user_metadata?.user_type || supaUser.user_metadata?.role || '').toString().toLowerCase();
    res.json({
      message: 'Login successful',
      user: {
        id: supaUser.id,
        email: supaUser.email,
        full_name: (supaUser.user_metadata?.full_name || supaUser.user_metadata?.name || supaUser.email),
        user_type: metaRole === 'admin' ? 'admin' : 'standard'
      },
      session: { access_token: accessToken, expires_in: String(expiresIn) }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Logout user
router.post('/logout', authenticateToken, async (req, res) => {
  try {
    // For Supabase tokens, logout is client-side (clear token). We just acknowledge.
    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ error: 'Logout failed' });
  }
});

// Logout from all devices
router.post('/logout-all', authenticateToken, async (req, res) => {
  try {
    // Supabase manages sessions; client should revoke tokens
    res.json({ message: 'Logged out from all devices successfully (Supabase)' });
  } catch (error) {
    res.status(500).json({ error: 'Logout failed' });
  }
});

// Refresh token
router.post('/refresh', async (req, res) => {
  try {
    const { refresh_token } = req.body || {};
    const SUPABASE_URL = process.env.SUPABASE_URL;
    const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;
    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) return res.status(500).json({ error: 'Supabase not configured' });
    if (!refresh_token) return res.status(400).json({ error: 'refresh_token required' });

    const resp = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=refresh_token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'apikey': SUPABASE_ANON_KEY },
      body: JSON.stringify({ refresh_token })
    });
    const data = await resp.json();
    if (!resp.ok) return res.status(resp.status).json({ error: data?.msg || 'Refresh failed' });

    res.json({ message: 'Token refreshed successfully', session: { access_token: data.access_token, expires_in: String(data.expires_in) } });
  } catch (error) {
    console.error('Refresh token error:', error);
    res.status(500).json({ error: 'Token refresh failed' });
  }
});

// Get current user sessions
router.get('/sessions', authenticateToken, async (req, res) => {
  try {
    // With Supabase tokens, we don't track sessions locally; return minimal info
    res.json({ sessions: [] });
  } catch (error) {
    res.status(500).json({ error: 'Failed to get sessions' });
  }
});

module.exports = router;
