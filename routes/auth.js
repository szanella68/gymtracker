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

// Login via Supabase password grant (nuovo sistema)
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
    const refreshToken = data.refresh_token;

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
          // Crea profilo con user_type='standard' di default
          await fetch(`${SUPABASE_URL}/rest/v1/user_profiles`, {
            method: 'POST',
            headers: {
              'apikey': SUPABASE_ANON_KEY,
              'Authorization': `Bearer ${accessToken}`,
              'Content-Type': 'application/json',
              'Prefer': 'resolution=ignore-duplicates'
            },
            body: JSON.stringify({ 
              id: supaUser.id, 
              email: supaUser.email,
              user_type: 'standard' // Esplicito: nuovo utente = standard
            })
          });
        }
      }
    } catch (profileError) {
      console.error('Error ensuring profile:', profileError);
    }

    // IMPORTANTE: Determina user_type SOLO dalla tabella user_profiles
    let userType = 'standard'; // Default
    try {
      const profileRes = await fetch(`${SUPABASE_URL}/rest/v1/user_profiles?id=eq.${encodeURIComponent(supaUser.id)}&select=user_type`, {
        headers: { 'apikey': SUPABASE_ANON_KEY, 'Authorization': `Bearer ${accessToken}` }
      });
      
      if (profileRes.ok) {
        const profileArr = await profileRes.json();
        if (Array.isArray(profileArr) && profileArr.length && profileArr[0]?.user_type) {
          userType = profileArr[0].user_type === 'admin' ? 'admin' : 'standard';
          console.log(`[Login] user_type from DB: ${profileArr[0].user_type} → final: ${userType}`);
        }
      }
    } catch (dbError) {
      console.error('Error fetching user_type from profiles:', dbError);
      // userType rimane 'standard' in caso di errore
    }

    res.json({
      message: 'Login successful',
      user: {
        id: supaUser.id,
        email: supaUser.email,
        full_name: (supaUser.user_metadata?.full_name || supaUser.user_metadata?.name || supaUser.email),
        user_type: userType // Ora viene SOLO dalla tabella user_profiles
      },
      session: { 
        access_token: accessToken, 
        refresh_token: refreshToken || null, 
        expires_in: String(expiresIn) 
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// POST /api/auth/signin - Accesso utente (sistema vecchio che usa la tua app)
router.post('/signin', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validazione input
    if (!email || !password) {
      return res.status(400).json({ error: 'Email e password sono obbligatori' });
    }

    const SUPABASE_URL = process.env.SUPABASE_URL;
    const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;
    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
      return res.status(500).json({ error: 'Supabase not configured' });
    }

    // Login con Supabase Auth
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
      console.error('Errore login:', data);
      return res.status(401).json({ error: 'Credenziali non valide' });
    }

    if (!data.access_token) {
      return res.status(401).json({ error: 'Login fallito' });
    }

    // fetch user for mapping
    const userRes = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
      headers: { 'apikey': SUPABASE_ANON_KEY, 'Authorization': `Bearer ${data.access_token}` }
    });
    const user = await userRes.json();

    console.log('✅ Login riuscito per:', user.email, 'ID:', user.id);

    // *** FIX: Verifica/Crea profilo controllando SOLO tabella user_profiles ***
    let profileData = null;
    let userType = 'standard'; // Default

    try {
      // Verifica se profilo esiste
      const checkRes = await fetch(`${SUPABASE_URL}/rest/v1/user_profiles?id=eq.${encodeURIComponent(user.id)}&select=*`, {
        headers: { 'apikey': SUPABASE_ANON_KEY, 'Authorization': `Bearer ${data.access_token}` }
      });
      
      if (checkRes.ok) {
        const profiles = await checkRes.json();
        if (Array.isArray(profiles) && profiles.length > 0) {
          profileData = profiles[0];
          userType = profileData.user_type === 'admin' ? 'admin' : 'standard';
          console.log('✅ Profilo utente esistente:', profileData.id, 'user_type:', userType);
        } else {
          console.log('⚠️ Profilo utente mancante per:', user.email);
          console.log('🔧 Creando profilo utente...');
          
          // Se il profilo non esiste, crealo con user_type='standard'
          const createRes = await fetch(`${SUPABASE_URL}/rest/v1/user_profiles`, {
            method: 'POST',
            headers: {
              'apikey': SUPABASE_ANON_KEY,
              'Authorization': `Bearer ${data.access_token}`,
              'Content-Type': 'application/json',
              'Prefer': 'return=representation'
            },
            body: JSON.stringify({
              id: user.id,
              email: user.email,
              full_name: user.user_metadata?.full_name || '',
              user_type: 'standard' // Nuovo utente = sempre standard
            })
          });

          if (createRes.ok) {
            const newProfiles = await createRes.json();
            profileData = Array.isArray(newProfiles) ? newProfiles[0] : newProfiles;
            userType = 'standard';
            console.log('✅ Profilo utente creato:', profileData);
          } else {
            console.error('❌ ERRORE: Impossibile creare profilo utente');
            return res.status(500).json({ 
              error: 'Errore nella creazione del profilo utente'
            });
          }
        }
      } else {
        console.error('❌ ERRORE: Impossibile verificare profilo utente');
        return res.status(500).json({ error: 'Errore nella verifica del profilo utente' });
      }
    } catch (profileError) {
      console.error('❌ ERRORE nella gestione profilo:', profileError);
      return res.status(500).json({ error: 'Errore interno nella gestione profilo' });
    }

    // *** IMPORTANTE: user_type viene SOLO dalla tabella user_profiles ***
    console.log(`[Login] user_type from DB: ${userType} (email: ${user.email})`);

    res.status(200).json({
      message: 'Login effettuato con successo!',
      user: {
        id: user.id,
        email: user.email,
        fullName: profileData?.full_name || '',
        user_type: userType // Ora viene SOLO dalla tabella user_profiles
      },
      session: {
        access_token: data.access_token,
        refresh_token: data.refresh_token || null,
        expires_in: data.expires_in || 3600
      },
      profile: {
        ...profileData,
        user_type: userType // Assicurati che sia coerente
      }
    });
  } catch (error) {
    console.error('💥 Errore interno login:', error);
    res.status(500).json({ error: 'Errore interno del server durante il login' });
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

// POST /api/auth/signout - Logout utente (compatibilità)
router.post('/signout', authenticateToken, async (req, res) => {
  try {
    res.status(200).json({ message: 'Logout effettuato con successo!' });
  } catch (error) {
    console.error('Errore interno logout:', error);
    res.status(500).json({ error: 'Errore interno del server durante il logout' });
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

// GET /api/auth/user - Ottieni informazioni utente corrente
router.get('/user', authenticateToken, async (req, res) => {
  try {
    res.status(200).json({
      user: {
        id: req.user.id,
        email: req.user.email,
        fullName: req.user.full_name || ''
      },
      profile: {
        full_name: req.user.full_name,
        user_type: req.user.user_type
      }
    });
  } catch (error) {
    console.error('Errore ottenimento utente:', error);
    res.status(500).json({ error: 'Errore interno del server' });
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

// POST /api/auth/reset-password - Reset password
router.post('/reset-password', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email è obbligatoria' });
    }

    const SUPABASE_URL = process.env.SUPABASE_URL;
    const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;
    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
      return res.status(500).json({ error: 'Supabase not configured' });
    }

    const resp = await fetch(`${SUPABASE_URL}/auth/v1/recover`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SUPABASE_ANON_KEY
      },
      body: JSON.stringify({
        email,
        options: {
          redirectTo: `${process.env.FRONTEND_URL}/reset-password`
        }
      })
    });

    if (!resp.ok) {
      const error = await resp.json();
      console.error('Errore reset password:', error);
      return res.status(400).json({ error: error.msg || 'Reset password failed' });
    }

    res.status(200).json({
      message: 'Email di reset password inviata! Controlla la tua casella di posta.'
    });
  } catch (error) {
    console.error('Errore interno reset password:', error);
    res.status(500).json({ error: 'Errore interno del server' });
  }
});

module.exports = router;