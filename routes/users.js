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
    const supabaseId = req.user.supabase_id || req.user.id;
    const SUPABASE_URL = process.env.SUPABASE_URL;
    const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;
    const authHeader = req.headers['authorization'] || '';

    // Date ranges
    const today = new Date();
    const startMonth = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().slice(0,10);
    const endMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString().slice(0,10);
    const start30 = new Date(today);
    start30.setDate(start30.getDate() - 29);
    const start30Str = start30.toISOString().slice(0,10);
    const todayStr = today.toISOString().slice(0,10);

    // Fetch in parallel
    const urls = {
      completedTotal: `${SUPABASE_URL}/rest/v1/workout_logs?user_id=eq.${encodeURIComponent(supabaseId)}&status=eq.completed&select=id`,
      planned30: `${SUPABASE_URL}/rest/v1/workout_logs?user_id=eq.${encodeURIComponent(supabaseId)}&workout_date=gte.${encodeURIComponent(start30Str)}&workout_date=lte.${encodeURIComponent(todayStr)}&select=id,status` ,
      completed30: `${SUPABASE_URL}/rest/v1/workout_logs?user_id=eq.${encodeURIComponent(supabaseId)}&workout_date=gte.${encodeURIComponent(start30Str)}&workout_date=lte.${encodeURIComponent(todayStr)}&status=eq.completed&select=id` ,
      upcoming: `${SUPABASE_URL}/rest/v1/workout_logs?user_id=eq.${encodeURIComponent(supabaseId)}&workout_date=gte.${encodeURIComponent(todayStr)}&select=id,status` ,
      monthAll: `${SUPABASE_URL}/rest/v1/workout_logs?user_id=eq.${encodeURIComponent(supabaseId)}&workout_date=gte.${encodeURIComponent(startMonth)}&workout_date=lte.${encodeURIComponent(endMonth)}&select=id,status` ,
      monthCompleted: `${SUPABASE_URL}/rest/v1/workout_logs?user_id=eq.${encodeURIComponent(supabaseId)}&workout_date=gte.${encodeURIComponent(startMonth)}&workout_date=lte.${encodeURIComponent(endMonth)}&status=eq.completed&select=id`
    };
    const headers = { 'apikey': SUPABASE_ANON_KEY, 'Authorization': authHeader };
    const [ctR, p30R, c30R, upR, mAllR, mCompR] = await Promise.all(Object.values(urls).map(u => fetch(u, { headers })));
    const [ct, p30, c30, up, mAll, mComp] = await Promise.all([ctR, p30R, c30R, upR, mAllR, mCompR].map(r => r.ok ? r.json() : []));

    const completed_workouts = Array.isArray(ct) ? ct.length : 0;
    const periodPlanned = Array.isArray(p30) ? p30.length : 0;
    const periodCompleted = Array.isArray(c30) ? c30.length : 0;
    const adherence_rate = periodPlanned ? Math.round((periodCompleted / periodPlanned) * 100) : 0;
    const upcoming_sessions = Array.isArray(up) ? up.length : 0;
    const total_sessions_this_month = Array.isArray(mAll) ? mAll.length : 0;
    const completed_this_month = Array.isArray(mComp) ? mComp.length : 0;

    // Streak calcolo: giorni consecutivi fino a oggi con workout completati
    let streak_days = 0;
    try {
      const sUrl = `${SUPABASE_URL}/rest/v1/workout_logs?user_id=eq.${encodeURIComponent(supabaseId)}&status=eq.completed&workout_date=lte.${encodeURIComponent(todayStr)}&select=workout_date&order=workout_date.desc&limit=200`;
      const sRes = await fetch(sUrl, { headers });
      const sArr = sRes.ok ? await sRes.json() : [];
      const dates = (sArr || []).map(x => x.workout_date).map(d => new Date(d)).map(d => new Date(d.getFullYear(), d.getMonth(), d.getDate()));
      // unique by day
      const uniq = Array.from(new Set(dates.map(d => d.getTime()))).map(t => new Date(t)).sort((a,b)=> b - a);
      let cursor = new Date(); cursor = new Date(cursor.getFullYear(), cursor.getMonth(), cursor.getDate());
      for (const d of uniq) {
        if (d.getTime() === cursor.getTime()) {
          streak_days++;
          cursor.setDate(cursor.getDate() - 1);
        } else if (d.getTime() === (cursor.getTime() - 24*3600*1000)) {
          // allow missing today but keep counting? Keep strict: break if gap
          break;
        } else {
          break;
        }
      }
    } catch {}

    res.json({ completed_workouts, adherence_rate, upcoming_sessions, total_sessions_this_month, completed_this_month, streak_days });
  } catch (error) {
    console.error('Get user stats error:', error);
    res.status(500).json({ error: 'Failed to get user stats' });
  }
});

// Exercise PRs and progress (last 200 completed workouts)
router.get('/me/exercises/pr', authenticateToken, async (req, res) => {
  try {
    const supabaseId = req.user.supabase_id || req.user.id;
    const SUPABASE_URL = process.env.SUPABASE_URL;
    const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;
    const authHeader = req.headers['authorization'] || '';
    const headers = { 'apikey': SUPABASE_ANON_KEY, 'Authorization': authHeader };
    const wlUrl = `${SUPABASE_URL}/rest/v1/workout_logs?user_id=eq.${encodeURIComponent(supabaseId)}&status=eq.completed&select=id,workout_date&order=workout_date.desc&limit=200`;
    const wlRes = await fetch(wlUrl, { headers });
    const wls = wlRes.ok ? await wlRes.json() : [];
    if (!Array.isArray(wls) || !wls.length) return res.json({ items: [] });
    const ids = wls.map(w => w.id).map(encodeURIComponent).join(',');
    const elUrl = `${SUPABASE_URL}/rest/v1/exercise_logs?workout_log_id=in.(${ids})&select=workout_log_id,exercise_id,actual_sets_data`;
    const elRes = await fetch(elUrl, { headers });
    const logs = elRes.ok ? await elRes.json() : [];
    const dateByWl = new Map(wls.map(w => [w.id, w.workout_date]));
    const byEx = new Map();
    for (const l of logs) {
      const date = dateByWl.get(l.workout_log_id);
      const first = Array.isArray(l.actual_sets_data) && l.actual_sets_data.length ? l.actual_sets_data[0] : {};
      const reps = typeof first.reps === 'number' ? first.reps : null;
      const weight = typeof first.weight === 'number' ? first.weight : null;
      const volume = reps && weight ? reps * weight : null;
      const cur = byEx.get(l.exercise_id) || { latest: null, pr_weight: null, pr_volume: null };
      // latest by date
      if (!cur.latest || date > cur.latest.date) cur.latest = { date, reps, weight, volume };
      if (weight != null && (cur.pr_weight == null || weight > cur.pr_weight)) cur.pr_weight = weight;
      if (volume != null && (cur.pr_volume == null || volume > cur.pr_volume)) cur.pr_volume = volume;
      byEx.set(l.exercise_id, cur);
    }
    const exIds = Array.from(byEx.keys());
    if (!exIds.length) return res.json({ items: [] });
    const exUrl = `${SUPABASE_URL}/rest/v1/exercises?id=in.(${exIds.map(encodeURIComponent).join(',')})&select=id,name`;
    const exRes = await fetch(exUrl, { headers });
    const exs = exRes.ok ? await exRes.json() : [];
    const nameById = new Map(exs.map(e => [e.id, e.name]));
    const items = exIds.map(id => ({
      exercise_id: id,
      name: nameById.get(id) || 'Esercizio',
      latest: byEx.get(id).latest,
      pr_weight: byEx.get(id).pr_weight,
      pr_volume: byEx.get(id).pr_volume
    })).sort((a,b)=> (b.latest?.date || '').localeCompare(a.latest?.date || ''));
    res.json({ items });
  } catch (error) {
    console.error('Exercise PR error:', error);
    res.status(500).json({ error: 'Failed to fetch PRs' });
  }
});

// Goals CRUD for current user
router.get('/me/goals', authenticateToken, async (req, res) => {
  try {
    const supabaseId = req.user.supabase_id || req.user.id;
    const SUPABASE_URL = process.env.SUPABASE_URL;
    const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;
    const authHeader = req.headers['authorization'] || '';
    const headers = { 'apikey': SUPABASE_ANON_KEY, 'Authorization': authHeader, 'Content-Type': 'application/json' };
    // Ensure default weight goal exists
    const checkUrl = `${SUPABASE_URL}/rest/v1/user_goals?user_id=eq.${encodeURIComponent(supabaseId)}&target_type=eq.weight&select=id`;
    const c = await fetch(checkUrl, { headers });
    if (c.ok) {
      const arr = await c.json();
      if (!Array.isArray(arr) || arr.length === 0) {
        await fetch(`${SUPABASE_URL}/rest/v1/user_goals`, {
          method: 'POST', headers, body: JSON.stringify({ user_id: supabaseId, title: 'Peso corporeo', target_type: 'weight', unit: 'kg', status: 'in_progress' })
        }).catch(()=>{});
      }
    }
    const url = `${SUPABASE_URL}/rest/v1/user_goals?user_id=eq.${encodeURIComponent(supabaseId)}&select=*&order=created_at.desc`;
    const r = await fetch(url, { headers });
    const data = await r.json();
    if (!r.ok) return res.status(500).json({ error: 'Failed to fetch goals', details: data });
    res.json({ items: data });
  } catch (e) {
    console.error('GET /me/goals error', e);
    res.status(500).json({ error: 'Failed to fetch goals' });
  }
});

router.post('/me/goals', authenticateToken, async (req, res) => {
  try {
    const supabaseId = req.user.supabase_id || req.user.id;
    const { title, description, target_type = 'custom', target_value = null, unit = null, target_date = null } = req.body || {};
    if (!title) return res.status(400).json({ error: 'title required' });
    const SUPABASE_URL = process.env.SUPABASE_URL;
    const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;
    const authHeader = req.headers['authorization'] || '';
    const payload = { user_id: supabaseId, title, description: description || null, target_type, target_value, unit, target_date, status: 'in_progress' };
    const r = await fetch(`${SUPABASE_URL}/rest/v1/user_goals`, {
      method: 'POST', headers: { 'apikey': SUPABASE_ANON_KEY, 'Authorization': authHeader, 'Content-Type': 'application/json', Prefer: 'return=representation' },
      body: JSON.stringify(payload)
    });
    const data = await r.json().catch(()=> ({}));
    if (!r.ok) {
      console.error('POST /me/goals failed', data);
      return res.status(500).json({ error: 'Failed to create goal', details: data });
    }
    res.status(201).json({ goal: Array.isArray(data) ? data[0] : data });
  } catch (e) { res.status(500).json({ error: 'Failed to create goal' }); }
});

router.put('/me/goals/:id', authenticateToken, async (req, res) => {
  try {
    const id = req.params.id;
    const SUPABASE_URL = process.env.SUPABASE_URL;
    const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;
    const authHeader = req.headers['authorization'] || '';
    const allowed = ['title','description','target_type','target_value','unit','target_date','status','progress_value','completed_at'];
    const payload = {};
    allowed.forEach(k => { if (req.body[k] !== undefined) payload[k] = req.body[k]; });
    const r = await fetch(`${SUPABASE_URL}/rest/v1/user_goals?id=eq.${encodeURIComponent(id)}`, {
      method: 'PATCH', headers: { 'apikey': SUPABASE_ANON_KEY, 'Authorization': authHeader, 'Content-Type': 'application/json', Prefer: 'return=representation' },
      body: JSON.stringify(payload)
    });
    const data = await r.json().catch(()=> ({}));
    if (!r.ok) {
      console.error('PUT /me/goals failed', data);
      return res.status(500).json({ error: 'Failed to update goal', details: data });
    }
    res.json({ goal: Array.isArray(data) ? data[0] : data });
  } catch (e) { res.status(500).json({ error: 'Failed to update goal' }); }
});

router.delete('/me/goals/:id', authenticateToken, async (req, res) => {
  try {
    const id = req.params.id;
    const SUPABASE_URL = process.env.SUPABASE_URL;
    const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;
    const authHeader = req.headers['authorization'] || '';
    // Prevent deleting default weight goal
    const chk = await fetch(`${SUPABASE_URL}/rest/v1/user_goals?id=eq.${encodeURIComponent(id)}&select=target_type`, { headers: { 'apikey': SUPABASE_ANON_KEY, 'Authorization': authHeader } });
    const arr = chk.ok ? await chk.json() : [];
    if (Array.isArray(arr) && arr[0]?.target_type === 'weight') {
      return res.status(400).json({ error: 'Default weight goal cannot be deleted' });
    }
    const r = await fetch(`${SUPABASE_URL}/rest/v1/user_goals?id=eq.${encodeURIComponent(id)}`, { method: 'DELETE', headers: { 'apikey': SUPABASE_ANON_KEY, 'Authorization': authHeader } });
    if (!r.ok) {
      const txt = await r.text().catch(()=> '');
      console.error('DELETE /me/goals failed', txt);
      return res.status(500).json({ error: 'Failed to delete goal', details: txt });
    }
    res.json({ ok: true });
  } catch (e) { res.status(500).json({ error: 'Failed to delete goal' }); }
});

// Goal progress: list
router.get('/me/goals/:id/progress', authenticateToken, async (req, res) => {
  try {
    const id = req.params.id;
    const SUPABASE_URL = process.env.SUPABASE_URL;
    const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;
    const authHeader = req.headers['authorization'] || '';
    const url = `${SUPABASE_URL}/rest/v1/user_goal_progress?goal_id=eq.${encodeURIComponent(id)}&select=*&order=log_date.desc`;
    const r = await fetch(url, { headers: { 'apikey': SUPABASE_ANON_KEY, 'Authorization': authHeader } });
    const data = await r.json().catch(()=> ({}));
    if (!r.ok) {
      console.error('GET /me/goals/:id/progress failed', data);
      return res.status(500).json({ error: 'Failed to fetch goal progress', details: data });
    }
    res.json({ items: data });
  } catch (e) { res.status(500).json({ error: 'Failed to fetch goal progress' }); }
});

// Goal progress: add
router.post('/me/goals/:id/progress', authenticateToken, async (req, res) => {
  try {
    const id = req.params.id;
    const { value = null, note = null, log_date = null } = req.body || {};
    const SUPABASE_URL = process.env.SUPABASE_URL;
    const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;
    const authHeader = req.headers['authorization'] || '';
    const payload = { goal_id: id, value, note, ...(log_date ? { log_date } : {}) };
    const r = await fetch(`${SUPABASE_URL}/rest/v1/user_goal_progress`, {
      method: 'POST', headers: { 'apikey': SUPABASE_ANON_KEY, 'Authorization': authHeader, 'Content-Type': 'application/json', Prefer: 'return=representation' },
      body: JSON.stringify(payload)
    });
    const data = await r.json().catch(()=> ({}));
    if (!r.ok) {
      console.error('POST /me/goals/:id/progress failed', data);
      return res.status(500).json({ error: 'Failed to add goal progress', details: data });
    }
    res.status(201).json({ progress: Array.isArray(data) ? data[0] : data });
  } catch (e) { res.status(500).json({ error: 'Failed to add goal progress' }); }
});

// Get current user's scheduled workouts within date range
router.get('/me/schedule', authenticateToken, async (req, res) => {
  try {
    const { start, end } = req.query;
    if (!start || !end) return res.status(400).json({ error: 'start and end required (YYYY-MM-DD)' });

    const supabaseId = req.user.supabase_id || req.user.id;
    const SUPABASE_URL = process.env.SUPABASE_URL;
    const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;
    const authHeader = req.headers['authorization'] || '';

  const url = `${SUPABASE_URL}/rest/v1/workout_logs?user_id=eq.${encodeURIComponent(supabaseId)}&workout_date=gte.${encodeURIComponent(start)}&workout_date=lte.${encodeURIComponent(end)}&select=id,workout_date,sessione_id,status,sessioni:sessione_id(id,nome)`;
    const r = await fetch(url, { headers: { 'apikey': SUPABASE_ANON_KEY, 'Authorization': authHeader } });
    if (r.status === 404 || r.status === 406) return res.json({ items: [] });
    const data = await r.json();
    if (!r.ok) return res.status(500).json({ error: 'Failed to fetch schedule', details: data });
  const items = Array.isArray(data) ? data.map(it => ({ id: it.id, date: it.workout_date, sessione_id: it.sessione_id, status: it.status, sessioni: it.sessioni })) : [];
    res.json({ items });
  } catch (error) {
    console.error('Get my schedule error:', error);
    res.status(500).json({ error: 'Failed to fetch schedule' });
  }
});

// Start a workout (create or update workout_logs to in_progress)
router.post('/me/workouts/start', authenticateToken, async (req, res) => {
  try {
    const { sessione_id, date } = req.body || {};
    if (!sessione_id || !date) return res.status(400).json({ error: 'sessione_id and date are required' });

    const supabaseId = req.user.supabase_id || req.user.id;
    const SUPABASE_URL = process.env.SUPABASE_URL;
    const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;
    const authHeader = req.headers['authorization'] || '';

    // 1) Try to find existing log for this user/session/date
    const selUrl = `${SUPABASE_URL}/rest/v1/workout_logs?user_id=eq.${encodeURIComponent(supabaseId)}&sessione_id=eq.${encodeURIComponent(sessione_id)}&workout_date=eq.${encodeURIComponent(date)}&select=id,status`;
    const sel = await fetch(selUrl, { headers: { 'apikey': SUPABASE_ANON_KEY, 'Authorization': authHeader } });
    const existing = sel.ok ? await sel.json() : [];
    if (Array.isArray(existing) && existing.length) {
      const wl = existing[0];
      // If planned, mark as in_progress
      if (wl.status === 'planned') {
        const upd = await fetch(`${SUPABASE_URL}/rest/v1/workout_logs?id=eq.${encodeURIComponent(wl.id)}`, {
          method: 'PATCH',
          headers: { 'apikey': SUPABASE_ANON_KEY, 'Authorization': authHeader, 'Content-Type': 'application/json', Prefer: 'return=representation' },
          body: JSON.stringify({ status: 'in_progress', started_at: new Date().toISOString() })
        });
        const arr = await upd.json();
        if (!upd.ok) return res.status(500).json({ error: 'Failed to start workout', details: arr });
        return res.json({ workout: Array.isArray(arr) ? arr[0] : arr });
      }
      return res.json({ workout: wl });
    }

    // 2) Create workout log in_progress
    const crt = await fetch(`${SUPABASE_URL}/rest/v1/workout_logs`, {
      method: 'POST',
      headers: { 'apikey': SUPABASE_ANON_KEY, 'Authorization': authHeader, 'Content-Type': 'application/json', Prefer: 'return=representation' },
      body: JSON.stringify({ user_id: supabaseId, sessione_id, workout_date: date, status: 'in_progress', started_at: new Date().toISOString() })
    });
    const created = await crt.json();
    if (!crt.ok) return res.status(500).json({ error: 'Failed to start workout', details: created });
    res.status(201).json({ workout: Array.isArray(created) ? created[0] : created });
  } catch (error) {
    console.error('Start workout error:', error);
    res.status(500).json({ error: 'Failed to start workout' });
  }
});

// Complete a workout
router.post('/me/workouts/complete', authenticateToken, async (req, res) => {
  try {
    const { workout_log_id } = req.body || {};
    if (!workout_log_id) return res.status(400).json({ error: 'workout_log_id is required' });

    const SUPABASE_URL = process.env.SUPABASE_URL;
    const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;
    const authHeader = req.headers['authorization'] || '';
    const upd = await fetch(`${SUPABASE_URL}/rest/v1/workout_logs?id=eq.${encodeURIComponent(workout_log_id)}`, {
      method: 'PATCH',
      headers: { 'apikey': SUPABASE_ANON_KEY, 'Authorization': authHeader, 'Content-Type': 'application/json', Prefer: 'return=representation' },
      body: JSON.stringify({ status: 'completed', completed_at: new Date().toISOString() })
    });
    const arr = await upd.json();
    if (!upd.ok) return res.status(500).json({ error: 'Failed to complete workout', details: arr });
    res.json({ workout: Array.isArray(arr) ? arr[0] : arr });
  } catch (error) {
    console.error('Complete workout error:', error);
    res.status(500).json({ error: 'Failed to complete workout' });
  }
});

// Workout details: exercises + existing logs
router.get('/me/workouts/:id/details', authenticateToken, async (req, res) => {
  try {
    const SUPABASE_URL = process.env.SUPABASE_URL;
    const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;
    const authHeader = req.headers['authorization'] || '';
    const id = req.params.id;
    const supabaseId = req.user.supabase_id || req.user.id;

    // Get workout_log (get sessione_id)
    const wlRes = await fetch(`${SUPABASE_URL}/rest/v1/workout_logs?id=eq.${encodeURIComponent(id)}&select=id,sessione_id,workout_date,status`, {
      headers: { 'apikey': SUPABASE_ANON_KEY, 'Authorization': authHeader }
    });
    const wlArr = await wlRes.json();
    if (!wlRes.ok || !Array.isArray(wlArr) || !wlArr.length) return res.status(404).json({ error: 'Workout not found' });
    const wl = wlArr[0];

    // Exercises for session
    const exRes = await fetch(`${SUPABASE_URL}/rest/v1/exercises?sessione_id=eq.${encodeURIComponent(wl.sessione_id)}&select=id,name,description,sets_count,reps_min,reps_max,weight_suggested,rest_seconds`, {
      headers: { 'apikey': SUPABASE_ANON_KEY, 'Authorization': authHeader }
    });
    const exercises = await exRes.json();
    if (!exRes.ok) return res.status(500).json({ error: 'Failed to fetch exercises', details: exercises });

    // Existing exercise logs for this workout
    const logRes = await fetch(`${SUPABASE_URL}/rest/v1/exercise_logs?workout_log_id=eq.${encodeURIComponent(id)}&select=id,exercise_id,actual_sets_data,notes,completed`, {
      headers: { 'apikey': SUPABASE_ANON_KEY, 'Authorization': authHeader }
    });
    const logs = await logRes.json();
    if (!logRes.ok) return res.status(500).json({ error: 'Failed to fetch exercise logs', details: logs });

    // Previous week defaults: find the previous workout_log for same user/session before this date
    let previous_logs = [];
    try {
      const prevWlRes = await fetch(`${SUPABASE_URL}/rest/v1/workout_logs?user_id=eq.${encodeURIComponent(supabaseId)}&sessione_id=eq.${encodeURIComponent(wl.sessione_id)}&workout_date=lt.${encodeURIComponent(wl.workout_date)}&select=id,workout_date&order=workout_date.desc&limit=1`, {
        headers: { 'apikey': SUPABASE_ANON_KEY, 'Authorization': authHeader }
      });
      const prevArr = await prevWlRes.json();
      if (prevWlRes.ok && Array.isArray(prevArr) && prevArr.length) {
        const prevId = prevArr[0].id;
        const prevLogsRes = await fetch(`${SUPABASE_URL}/rest/v1/exercise_logs?workout_log_id=eq.${encodeURIComponent(prevId)}&select=exercise_id,actual_sets_data,notes`, {
          headers: { 'apikey': SUPABASE_ANON_KEY, 'Authorization': authHeader }
        });
        const prevLogs = await prevLogsRes.json();
        if (prevLogsRes.ok && Array.isArray(prevLogs)) previous_logs = prevLogs;
      }
    } catch {}

    res.json({ workout: wl, exercises, logs, previous_logs });
  } catch (error) {
    console.error('Workout details error:', error);
    res.status(500).json({ error: 'Failed to fetch workout details' });
  }
});

// Upsert exercise log for one exercise
router.post('/me/exercise-logs', authenticateToken, async (req, res) => {
  try {
    const { workout_log_id, exercise_id, reps, weight, notes } = req.body || {};
    if (!workout_log_id || !exercise_id) return res.status(400).json({ error: 'workout_log_id and exercise_id are required' });

    const SUPABASE_URL = process.env.SUPABASE_URL;
    const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;
    const authHeader = req.headers['authorization'] || '';

    // Check existing
    const sel = await fetch(`${SUPABASE_URL}/rest/v1/exercise_logs?workout_log_id=eq.${encodeURIComponent(workout_log_id)}&exercise_id=eq.${encodeURIComponent(exercise_id)}&select=id`, {
      headers: { 'apikey': SUPABASE_ANON_KEY, 'Authorization': authHeader }
    });
    const arr = await sel.json();
    const payload = {
      workout_log_id,
      exercise_id,
      actual_sets_data: [{ set: 1, reps: (reps !== undefined && reps !== null && reps !== '') ? Number(reps) : null, weight: (weight !== undefined && weight !== null && weight !== '') ? Number(weight) : null }],
      notes: notes || null
    };
    if (Array.isArray(arr) && arr.length) {
      const id = arr[0].id;
      const upd = await fetch(`${SUPABASE_URL}/rest/v1/exercise_logs?id=eq.${encodeURIComponent(id)}`, {
        method: 'PATCH',
        headers: { 'apikey': SUPABASE_ANON_KEY, 'Authorization': authHeader, 'Content-Type': 'application/json', Prefer: 'return=representation' },
        body: JSON.stringify({ actual_sets_data: payload.actual_sets_data, notes: payload.notes })
      });
      const updated = await upd.json();
      if (!upd.ok) return res.status(500).json({ error: 'Failed to update exercise log', details: updated });
      return res.json({ log: Array.isArray(updated) ? updated[0] : updated });
    } else {
      // Need planned fields to satisfy NOT NULL constraints; fetch exercise defaults
      let planned = { planned_sets: 1, planned_reps_min: null, planned_reps_max: null, planned_weight: null };
      try {
        const exRes = await fetch(`${SUPABASE_URL}/rest/v1/exercises?id=eq.${encodeURIComponent(exercise_id)}&select=sets_count,reps_min,reps_max,weight_suggested`, {
          headers: { 'apikey': SUPABASE_ANON_KEY, 'Authorization': authHeader }
        });
        const exArr = await exRes.json();
        if (exRes.ok && Array.isArray(exArr) && exArr.length) {
          planned.planned_sets = exArr[0].sets_count ?? 1;
          planned.planned_reps_min = exArr[0].reps_min ?? null;
          planned.planned_reps_max = exArr[0].reps_max ?? null;
          planned.planned_weight = exArr[0].weight_suggested ?? null;
        }
      } catch {}

      const crt = await fetch(`${SUPABASE_URL}/rest/v1/exercise_logs`, {
        method: 'POST',
        headers: { 'apikey': SUPABASE_ANON_KEY, 'Authorization': authHeader, 'Content-Type': 'application/json', Prefer: 'return=representation' },
        body: JSON.stringify({ ...payload, ...planned })
      });
      const created = await crt.json();
      if (!crt.ok) return res.status(500).json({ error: 'Failed to create exercise log', details: created });
      return res.status(201).json({ log: Array.isArray(created) ? created[0] : created });
    }
  } catch (error) {
    console.error('Upsert exercise log error:', error);
    res.status(500).json({ error: 'Failed to upsert exercise log' });
  }
});

// Recent data: completed workouts and recent exercise logs summary
router.get('/me/recent', authenticateToken, async (req, res) => {
  try {
    const supabaseId = req.user.supabase_id || req.user.id;
    const SUPABASE_URL = process.env.SUPABASE_URL;
    const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;
    const authHeader = req.headers['authorization'] || '';

    // 1) Recent completed workouts (last 10)
    const wUrl = `${SUPABASE_URL}/rest/v1/workout_logs?user_id=eq.${encodeURIComponent(supabaseId)}&status=eq.completed&select=id,workout_date,completed_at,sessione_id,sessioni:sessione_id(id,nome)&order=completed_at.desc&limit=10`;
    const wRes = await fetch(wUrl, { headers: { 'apikey': SUPABASE_ANON_KEY, 'Authorization': authHeader } });
    const workouts = wRes.ok ? await wRes.json() : [];

    // 2) Exercise logs for those workouts
    const ids = Array.isArray(workouts) ? workouts.map(w => w.id) : [];
    let exerciseSummary = [];
    if (ids.length) {
      const inList = ids.map(id => encodeURIComponent(id)).join(',');
      const eUrl = `${SUPABASE_URL}/rest/v1/exercise_logs?workout_log_id=in.(${inList})&select=exercise_id,actual_sets_data,workout_log_id`;
      const eRes = await fetch(eUrl, { headers: { 'apikey': SUPABASE_ANON_KEY, 'Authorization': authHeader } });
      const eLogs = eRes.ok ? await eRes.json() : [];
      // Map workout_log_id -> workout_date
      const dateByWl = new Map(workouts.map(w => [w.id, w.workout_date]));
      // For each exercise, keep the latest log by date
      const bestByExercise = new Map();
      for (const l of eLogs) {
        const d = dateByWl.get(l.workout_log_id) || null;
        const cur = bestByExercise.get(l.exercise_id);
        if (!cur || (d && d > cur.date)) {
          bestByExercise.set(l.exercise_id, { exercise_id: l.exercise_id, date: d, actual_sets_data: l.actual_sets_data });
        }
      }
      const exIds = Array.from(bestByExercise.keys());
      if (exIds.length) {
        const exIn = exIds.map(id => encodeURIComponent(id)).join(',');
        const nUrl = `${SUPABASE_URL}/rest/v1/exercises?id=in.(${exIn})&select=id,name`;
        const nRes = await fetch(nUrl, { headers: { 'apikey': SUPABASE_ANON_KEY, 'Authorization': authHeader } });
        const names = nRes.ok ? await nRes.json() : [];
        const nameById = new Map(names.map(n => [n.id, n.name]));
        exerciseSummary = exIds.map(id => {
          const obj = bestByExercise.get(id);
          const set = Array.isArray(obj.actual_sets_data) && obj.actual_sets_data.length ? obj.actual_sets_data[0] : {};
          const reps = typeof set.reps === 'number' ? set.reps : null;
          const weight = typeof set.weight === 'number' ? set.weight : null;
          const volume = (reps && weight) ? (reps * weight) : null;
          return { exercise_id: id, name: nameById.get(id) || 'Esercizio', date: obj.date, reps, weight, volume };
        }).sort((a,b)=> (b.date || '').localeCompare(a.date || ''));
      }
    }

    res.json({ recent_completed: workouts, recent_exercises: exerciseSummary });
  } catch (error) {
    console.error('Get recent data error:', error);
    res.status(500).json({ error: 'Failed to fetch recent data' });
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
