// Utility functions for admin management using auth.users.admin column

/**
 * Set admin status for a user in auth.users table
 * @param {string} userId - The user UUID
 * @param {boolean} isAdmin - Whether user should be admin
 * @returns {Promise<boolean>} Success status
 */
async function setUserAdmin(userId, isAdmin) {
  try {
    const SUPABASE_URL = process.env.SUPABASE_URL;
    const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!SUPABASE_URL || !SERVICE_KEY) {
      console.error('[Admin] Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
      return false;
    }

    const response = await fetch(`${SUPABASE_URL}/rest/v1/auth.users?id=eq.${encodeURIComponent(userId)}`, {
      method: 'PATCH',
      headers: {
        'apikey': SERVICE_KEY,
        'Authorization': `Bearer ${SERVICE_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ admin: Boolean(isAdmin) })
    });

    if (response.ok) {
      console.log(`[Admin] Successfully set user ${userId} admin status to ${isAdmin}`);
      return true;
    } else {
      const error = await response.text();
      console.error(`[Admin] Failed to set admin status: ${response.status} ${error}`);
      return false;
    }
  } catch (error) {
    console.error('[Admin] Error setting admin status:', error);
    return false;
  }
}

/**
 * Get admin status for a user from auth.users table
 * @param {string} userId - The user UUID
 * @returns {Promise<boolean|null>} Admin status or null if error
 */
async function getUserAdmin(userId) {
  try {
    const SUPABASE_URL = process.env.SUPABASE_URL;
    const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!SUPABASE_URL || !SERVICE_KEY) {
      console.error('[Admin] Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
      return null;
    }

    const response = await fetch(`${SUPABASE_URL}/rest/v1/auth.users?id=eq.${encodeURIComponent(userId)}&select=admin`, {
      headers: {
        'apikey': SERVICE_KEY,
        'Authorization': `Bearer ${SERVICE_KEY}`
      }
    });

    if (response.ok) {
      const data = await response.json();
      if (Array.isArray(data) && data.length > 0) {
        return Boolean(data[0].admin);
      }
      return false;
    } else {
      const error = await response.text();
      console.error(`[Admin] Failed to get admin status: ${response.status} ${error}`);
      return null;
    }
  } catch (error) {
    console.error('[Admin] Error getting admin status:', error);
    return null;
  }
}

/**
 * List all admin users
 * @returns {Promise<Array>} Array of admin users
 */
async function listAdminUsers() {
  try {
    const SUPABASE_URL = process.env.SUPABASE_URL;
    const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!SUPABASE_URL || !SERVICE_KEY) {
      console.error('[Admin] Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
      return [];
    }

    const response = await fetch(`${SUPABASE_URL}/rest/v1/auth.users?admin=eq.true&select=id,email,created_at`, {
      headers: {
        'apikey': SERVICE_KEY,
        'Authorization': `Bearer ${SERVICE_KEY}`
      }
    });

    if (response.ok) {
      const data = await response.json();
      return Array.isArray(data) ? data : [];
    } else {
      const error = await response.text();
      console.error(`[Admin] Failed to list admin users: ${response.status} ${error}`);
      return [];
    }
  } catch (error) {
    console.error('[Admin] Error listing admin users:', error);
    return [];
  }
}

module.exports = {
  setUserAdmin,
  getUserAdmin,
  listAdminUsers
};