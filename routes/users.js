const express = require('express');
const { authenticateToken, requireAdmin, requireOwnershipOrAdmin } = require('../middleware/auth');
const { getSupabaseClient } = require('../config/supabase');
const useSupabase = true; // Supabase-only mode

const router = express.Router();

// Get current user profile
router.get('/me', authenticateToken, async (req, res) => {
  try {
    if (useSupabase) {
      const supabaseId = req.user.supabase_id || req.user.id;
      const SUPABASE_URL = process.env.SUPABASE_URL;
      const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;
      const authHeader = req.headers['authorization'] || '';

      // Fetch profile via REST with user token (RLS)
      let ensuredProfile = null;
      try {
        const sel = await fetch(`${SUPABASE_URL}/rest/v1/user_profiles?id=eq.${encodeURIComponent(supabaseId)}&select=*`, {
          headers: {
            'apikey': SUPABASE_ANON_KEY,
            'Authorization': authHeader
          }
        });
        if (sel.ok) {
          const arr = await sel.json();
          ensuredProfile = Array.isArray(arr) && arr.length ? arr[0] : null;
        }
      } catch {}

      try { console.log(`[Users.me] supabaseId=${supabaseId} email=${req.user.email} user_type(db)=${ensuredProfile?.user_type || 'null'}`); } catch {}

      // Auto-create profile if missing (upsert)
      if (!ensuredProfile) {
        try {
          const resp = await fetch(`${SUPABASE_URL}/rest/v1/user_profiles`, {
            method: 'POST',
            headers: {
              'apikey': SUPABASE_ANON_KEY,
              'Authorization': authHeader,
              'Content-Type': 'application/json',
              'Prefer': 'resolution=ignore-duplicates,return=representation'
            },
            body: JSON.stringify({ id: supabaseId, email: req.user.email })
          });
          if (resp.ok) {
            const arr = await resp.json();
            ensuredProfile = Array.isArray(arr) && arr.length ? arr[0] : null;
          }
        } catch {}
      }

      res.json({
        id: supabaseId,
        email: req.user.email,
        profile: {
          full_name: ensuredProfile?.full_name || req.user.full_name || null,
          user_type: ensuredProfile?.user_type || 'standard',
          phone: ensuredProfile?.phone || null,
          date_of_birth: ensuredProfile?.date_of_birth || null,
          gender: ensuredProfile?.gender || null,
          height_cm: ensuredProfile?.height_cm || null,
          weight_kg: ensuredProfile?.weight_kg || null,
          fitness_goal: (ensuredProfile?.fitness_goal ?? ensuredProfile?.goals) || null,
          experience_level: (ensuredProfile?.experience_level ?? ensuredProfile?.fitness_level) || null,
          medical_notes: (ensuredProfile?.medical_notes ?? ensuredProfile?.injuries_limitations) || null,
          emergency_contact: ensuredProfile?.emergency_contact || null,
          profile_picture_url: ensuredProfile?.profile_picture_url || null
        },
        created_at: ensuredProfile?.created_at || null,
        last_login: null,
        profile_updated_at: ensuredProfile?.updated_at || null
      });
      return;
    }

    // No local DB fallback in Supabase-only mode
    return res.status(500).json({ error: 'Supabase not configured' });

  } catch (error) {
    console.error('Get user profile error:', error);
    res.status(500).json({ error: 'Failed to get user profile' });
  }
});

// Update current user profile
router.put('/me', authenticateToken, async (req, res) => {
  try {
    const {
      full_name,
      phone,
      date_of_birth,
      gender,
      height_cm,
      weight_kg,
      fitness_goal,
      experience_level,
      medical_notes,
      emergency_contact
    } = req.body;

    if (useSupabase) {
      const supabaseId = req.user.supabase_id || req.user.id;
      const SUPABASE_URL = process.env.SUPABASE_URL;
      const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;
      const authHeader = req.headers['authorization'] || '';

      // Optional: update auth metadata full_name
      if (full_name) {
        await fetch(`${SUPABASE_URL}/auth/v1/user`, {
          method: 'PUT',
          headers: {
            'apikey': SUPABASE_ANON_KEY,
            'Authorization': authHeader,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ data: { full_name } })
        }).catch(() => {});
      }

      // Build upsert payload with only provided fields
      const payload = { id: supabaseId, email: req.user.email };
      if (full_name !== undefined) payload.full_name = full_name;
      if (phone !== undefined) payload.phone = phone;
      if (date_of_birth !== undefined) payload.date_of_birth = date_of_birth;
      if (gender !== undefined) payload.gender = gender;
      if (height_cm !== undefined) payload.height_cm = height_cm;
      if (weight_kg !== undefined) payload.weight_kg = weight_kg;
      if (fitness_goal !== undefined) payload.fitness_goal = fitness_goal;
      if (experience_level !== undefined) payload.experience_level = experience_level;
      if (medical_notes !== undefined) payload.medical_notes = medical_notes;
      if (emergency_contact !== undefined) payload.emergency_contact = emergency_contact;

      const resp = await fetch(`${SUPABASE_URL}/rest/v1/user_profiles`, {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': authHeader,
          'Content-Type': 'application/json',
          'Prefer': 'resolution=merge-duplicates,return=representation'
        },
        body: JSON.stringify(payload)
      });
      if (!resp.ok) {
        const txt = await resp.text().catch(() => '');
        console.error('Upsert profile failed:', resp.status, txt);
        return res.status(500).json({ error: 'Failed to update profile' });
      }
      const arr = await resp.json();
      const up = Array.isArray(arr) && arr.length ? arr[0] : null;

      res.json({ message: 'Profile updated successfully', profile: {
        full_name: full_name || req.user.full_name,
        user_type: up?.user_type || 'standard',
        phone: up?.phone || null,
        date_of_birth: up?.date_of_birth || null,
        gender: up?.gender || null,
        height_cm: up?.height_cm || null,
        weight_kg: up?.weight_kg || null,
        fitness_goal: up?.fitness_goal || null,
        experience_level: up?.experience_level || null,
        medical_notes: up?.medical_notes || null,
        emergency_contact: up?.emergency_contact || null,
        profile_picture_url: up?.profile_picture_url || null,
      }});
      return;
    }

    // No local DB fallback in Supabase-only mode
    return res.status(500).json({ error: 'Supabase not configured' });

  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// Change password
router.put('/me/password', authenticateToken, async (req, res) => {
  try {
    const { current_password, new_password } = req.body;

    if (!current_password || !new_password) {
      return res.status(400).json({ 
        error: 'Current password and new password are required' 
      });
    }

    if (new_password.length < 6) {
      return res.status(400).json({ 
        error: 'New password must be at least 6 characters long' 
      });
    }

    if (useSupabase) {
      // Validate current password by performing a password grant
      const email = req.user.email;
      const SUPABASE_URL = process.env.SUPABASE_URL;
      const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;
      const tryLogin = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
        method: 'POST', headers: { 'Content-Type': 'application/json', 'apikey': SUPABASE_ANON_KEY },
        body: JSON.stringify({ email, password: current_password })
      });
      if (!tryLogin.ok) return res.status(401).json({ error: 'Current password is incorrect' });

      // Update password via Supabase auth/user
      const authHeader = req.headers['authorization'] || '';
      const upd = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json', 'apikey': SUPABASE_ANON_KEY, 'Authorization': authHeader },
        body: JSON.stringify({ password: new_password })
      });
      if (!upd.ok) return res.status(500).json({ error: 'Failed to change password' });

      return res.json({ message: 'Password updated successfully' });
    }

    // No local DB fallback in Supabase-only mode
    return res.status(500).json({ error: 'Supabase not configured' });

  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ error: 'Failed to change password' });
  }
});

// Get user stats (for dashboard)
router.get('/me/stats', authenticateToken, async (req, res) => {
  try {
    if (useSupabase) {
      // Schema non ancora migrato: restituisci 0/placeholder
      return res.json({
        completed_workouts: 0,
        adherence_rate: 0,
        upcoming_sessions: 0,
        total_sessions_this_month: 0,
        completed_this_month: 0
      });
    }

    // No local DB fallback in Supabase-only mode
    return res.json({ completed_workouts: 0, adherence_rate: 0, upcoming_sessions: 0, total_sessions_this_month: 0, completed_this_month: 0 });

  } catch (error) {
    console.error('Get user stats error:', error);
    res.status(500).json({ error: 'Failed to get user stats' });
  }
});

// Admin only: Get all users
router.get('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    // TODO: implement admin listing via Supabase RPC/view
    return res.status(501).json({ error: 'Admin listing not implemented for Supabase yet' });

  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Failed to get users' });
  }
});

// Admin only: Get user by ID
router.get('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    // TODO: implement admin get via Supabase
    return res.status(501).json({ error: 'Admin get not implemented for Supabase yet' });

  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Failed to get user' });
  }
});

// Admin only: Update user
router.put('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    // TODO: implement admin update via Supabase
    return res.status(501).json({ error: 'Admin update not implemented for Supabase yet' });

  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ error: 'Failed to update user' });
  }
});

module.exports = router;
