const jwt = require('jsonwebtoken');

async function verifyWithSupabase(token) {
  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) return null;

  try {
    const res = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
      method: 'GET',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${token}`
      }
    });
    if (!res.ok) return null;
    const user = await res.json();
    const dbProvider = (process.env.DB_PROVIDER || 'supabase').toLowerCase();
    const metaName = (user.user_metadata?.full_name || user.user_metadata?.name || user.email || 'User').trim();

    if (dbProvider === 'supabase') {
      console.log(`[Auth] ===============================================`);
      console.log(`[Auth] SUPABASE LOGIN VERIFICATION`);
      console.log(`[Auth] User Email: ${user.email}`);
      console.log(`[Auth] User ID: ${user.id}`);
      console.log(`[Auth] User Metadata:`, JSON.stringify(user.user_metadata, null, 2));
      console.log(`[Auth] ===============================================`);

      // IMPORTANTE: Controllo SOLO colonna admin in auth.users, NON tabella user_profiles
      let role = 'standard'; // Default sempre a 'standard'
      
      // Usa service role key per accedere alla tabella auth.users
      const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || SUPABASE_ANON_KEY;
      console.log(`[Auth] Using SERVICE_KEY: ${SERVICE_KEY ? 'Present' : 'Missing'}`);
      console.log(`[Auth] SUPABASE_URL: ${SUPABASE_URL}`);
      
      try {
        const authUrl = `${SUPABASE_URL}/rest/v1/auth.users?id=eq.${encodeURIComponent(user.id)}&select=admin`;
        console.log(`[Auth] Fetching admin status from: ${authUrl}`);
        
        const authRes = await fetch(authUrl, {
          headers: { 'apikey': SERVICE_KEY, 'Authorization': `Bearer ${SERVICE_KEY}` }
        });
        
        console.log(`[Auth] Auth response status: ${authRes.status}`);
        console.log(`[Auth] Auth response headers:`, JSON.stringify(Object.fromEntries(authRes.headers), null, 2));
        
        if (authRes.ok) {
          const arr = await authRes.json();
          console.log(`[Auth] Auth response body:`, JSON.stringify(arr, null, 2));
          
          if (Array.isArray(arr) && arr.length && arr[0]?.admin === true) {
            role = 'admin';
            console.log(`[Auth] ✅ USER IS ADMIN - admin field: ${arr[0].admin} → role: ${role}`);
          } else {
            console.log(`[Auth] ❌ USER IS NOT ADMIN - admin field: ${arr[0]?.admin} → role: ${role}`);
          }
        } else {
          const errorText = await authRes.text();
          console.log(`[Auth] ❌ FAILED TO FETCH admin status - Status: ${authRes.status}`);
          console.log(`[Auth] Error response:`, errorText);
        }
      } catch (dbError) {
        console.error(`[Auth] ❌ ERROR fetching admin status:`, dbError);
        // role rimane 'standard' in caso di errore (sicurezza)
      }
      
      console.log(`[Auth] ===============================================`);
      console.log(`[Auth] FINAL RESULT: role = '${role}'`);
      console.log(`[Auth] ===============================================`);

      return {
        id: user.id,
        email: user.email,
        full_name: metaName,
        user_type: role,
        provider: 'supabase',
        supabase_id: user.id
      };
    }

    // Legacy hybrid removed in supabase mode
    return null;
  } catch (e) {
    console.error(`[Auth] verifyWithSupabase error:`, e);
    return null;
  }
}

// Middleware to verify JWT token
async function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    // Prefer Supabase when configured
    const useSupabase = (process.env.AUTH_PROVIDER || '').toLowerCase() === 'supabase' || !!process.env.SUPABASE_URL;
    if (useSupabase) {
      const supaUser = await verifyWithSupabase(token);
      if (supaUser) {
        req.user = supaUser;
        return next();
      }
      // In Supabase mode, do not fall back to local JWT if verification failed
      return res.status(401).json({ error: 'Invalid or expired session' });
    }

    // Local JWT/SQLite fallback removed in Supabase-only setup
    return res.status(401).json({ error: 'Authentication required' });
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
  console.log(`[RequireAdmin] Checking user: ${req.user.email} user_type: ${req.user.user_type}`);
  
  if (req.user.user_type !== 'admin') {
    console.log(`[RequireAdmin] DENIED: user_type is '${req.user.user_type}', not 'admin'`);
    return res.status(403).json({ error: 'Admin privileges required' });
  }
  
  console.log(`[RequireAdmin] GRANTED for ${req.user.email}`);
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
    const useSupabase = (process.env.AUTH_PROVIDER || '').toLowerCase() === 'supabase' || !!process.env.SUPABASE_URL;
    if (useSupabase) {
      const supaUser = await verifyWithSupabase(token);
      if (supaUser) {
        req.user = supaUser;
        return next();
      }
      // Gracefully continue unauthenticated if Supabase token invalid in optional auth
      req.user = null;
      return next();
    }

    // Local JWT/SQLite fallback removed; proceed unauthenticated
    req.user = null;
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