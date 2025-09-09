const express = require('express');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const { Pool } = require('pg');

const router = express.Router();

// Optional direct Postgres access (bypasses Supabase REST schema cache issues)
let pgPool = null;
const pgConnStr = process.env.DATABASE_URL || process.env.SUPABASE_DB_URL;
if (pgConnStr) {
  try {
    pgPool = new Pool({ connectionString: pgConnStr, ssl: { rejectUnauthorized: false } });
    console.log('ℹ️ Trainer routes: PG pool enabled');
  } catch (e) {
    console.warn('⚠️ Failed to init PG pool, falling back to REST only:', e?.message);
    pgPool = null;
  }
}

function srHeaders() {
  return {
    'apikey': process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY,
    'Authorization': 'Bearer ' + (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY),
    'Content-Type': 'application/json'
  };
}

function restUrl(pathWithQuery) {
  return `${process.env.SUPABASE_URL}/rest/v1/${pathWithQuery}`;
}

// List clients (optionally filter by utente_attivo)
router.get('/clients', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const active = (req.query.active || 'all').toLowerCase();
    let query = 'user_profiles?select=id,email,full_name,utente_attivo,user_type&order=full_name.asc';
    if (active === 'true') query = 'user_profiles?utente_attivo=eq.true&select=id,email,full_name,utente_attivo,user_type&order=full_name.asc';
    if (active === 'false') query = 'user_profiles?utente_attivo=eq.false&select=id,email,full_name,utente_attivo,user_type&order=full_name.asc';

    const r = await fetch(restUrl(query), { headers: srHeaders() });
    const data = await r.json();
    if (!r.ok) return res.status(500).json({ error: 'Failed to fetch clients', details: data });
    res.json({ clients: data });
  } catch (e) {
    res.status(500).json({ error: 'Failed to fetch clients' });
  }
});

// Update client (utente_attivo toggle)
router.put('/clients/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const id = req.params.id;
    const payload = {};
    // For now allow only utente_attivo toggle to be safe
    if (typeof req.body.utente_attivo === 'boolean') payload.utente_attivo = req.body.utente_attivo;
    if (Object.keys(payload).length === 0) return res.status(400).json({ error: 'No fields to update' });

    const r = await fetch(restUrl(`user_profiles?id=eq.${encodeURIComponent(id)}`), {
      method: 'PATCH',
      headers: { ...srHeaders(), Prefer: 'return=representation' },
      body: JSON.stringify(payload)
    });
    const data = await r.json();
    if (!r.ok) return res.status(500).json({ error: 'Failed to update client', details: data });
    res.json({ client: Array.isArray(data) ? data[0] : data });
  } catch (e) {
    res.status(500).json({ error: 'Failed to update client' });
  }
});

// List plans for a user
router.get('/plans', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const userId = req.query.user_id;
    if (!userId) return res.status(400).json({ error: 'user_id required' });
    const r = await fetch(restUrl(`schede?user_id=eq.${encodeURIComponent(userId)}&select=*&order=created_at.desc`), { headers: srHeaders() });
    const data = await r.json();
    if (!r.ok) return res.status(500).json({ error: 'Failed to fetch plans', details: data });
    res.json({ plans: data });
  } catch (e) {
    res.status(500).json({ error: 'Failed to fetch plans' });
  }
});

// Plan detail (plan + sessions + exercises)
router.get('/plans/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const planId = req.params.id;
    const h = srHeaders();
    const pRes = await fetch(restUrl(`schede?id=eq.${encodeURIComponent(planId)}&select=*`), { headers: h });
    const plans = await pRes.json();
    if (!pRes.ok || !Array.isArray(plans) || plans.length === 0) return res.status(404).json({ error: 'Plan not found' });
    const plan = plans[0];

    const sRes = await fetch(restUrl(`sessioni?scheda_id=eq.${encodeURIComponent(planId)}&select=*`), { headers: h });
    const sessions = await sRes.json();
    if (!sRes.ok) return res.status(500).json({ error: 'Failed to fetch sessions', details: sessions });

    // Fetch exercises for all sessions in one go if possible
    let exercises = [];
    if (sessions.length) {
      const ids = sessions.map(s => s.id).map(encodeURIComponent).join(',');
      const eRes = await fetch(restUrl(`exercises?sessione_id=in.(${ids})&select=*`), { headers: h });
      exercises = await eRes.json();
    }

    res.json({ plan, sessions, exercises });
  } catch (e) {
    res.status(500).json({ error: 'Failed to fetch plan detail' });
  }
});

// Create plan
router.post('/plans', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { user_id, titolo, descrizione, attiva = true } = req.body || {};
    if (!user_id || !titolo) return res.status(400).json({ error: 'user_id and titolo are required' });
    const r = await fetch(restUrl('schede'), {
      method: 'POST',
      headers: { ...srHeaders(), Prefer: 'return=representation' },
      body: JSON.stringify({ user_id, titolo, descrizione: descrizione || null, attiva })
    });
    const data = await r.json();
    if (!r.ok) return res.status(500).json({ error: 'Failed to create plan', details: data });
    res.status(201).json({ plan: Array.isArray(data) ? data[0] : data });
  } catch (e) {
    res.status(500).json({ error: 'Failed to create plan' });
  }
});

// Update plan
router.put('/plans/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const id = req.params.id;
    const payload = {};
    const allowed = ['titolo','descrizione','attiva','autore','durata_settimane','sessioni_settimana','note','cancellata'];
    allowed.forEach(k => { if (req.body[k] !== undefined) payload[k] = req.body[k]; });
    if (Object.keys(payload).length === 0) return res.status(400).json({ error: 'No fields to update' });
    const r = await fetch(restUrl(`schede?id=eq.${encodeURIComponent(id)}`), {
      method: 'PATCH',
      headers: { ...srHeaders(), Prefer: 'return=representation' },
      body: JSON.stringify(payload)
    });
    const data = await r.json();
    if (!r.ok) return res.status(500).json({ error: 'Failed to update plan', details: data });
    res.json({ plan: Array.isArray(data) ? data[0] : data });
  } catch (e) {
    res.status(500).json({ error: 'Failed to update plan' });
  }
});

// Activate one plan exclusively (set others inactive for same user)
router.post('/plans/:id/activate', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const id = req.params.id;
    const h = srHeaders();
    // 1) Load plan to get user_id
    const getRes = await fetch(restUrl(`schede?id=eq.${encodeURIComponent(id)}&select=id,user_id`), { headers: h });
    const rows = await getRes.json();
    if (!getRes.ok || !Array.isArray(rows) || rows.length === 0) {
      return res.status(404).json({ error: 'Plan not found' });
    }
    const plan = rows[0];

    // 2) Deactivate other plans for this user
    const offRes = await fetch(restUrl(`schede?user_id=eq.${encodeURIComponent(plan.user_id)}&id=neq.${encodeURIComponent(id)}`), {
      method: 'PATCH',
      headers: { ...h, Prefer: 'return=minimal' },
      body: JSON.stringify({ attiva: false })
    });
    if (!offRes.ok) {
      const d = await offRes.text().catch(()=> '');
      return res.status(500).json({ error: 'Failed to deactivate other plans', details: d });
    }

    // 3) Activate selected plan
    const onRes = await fetch(restUrl(`schede?id=eq.${encodeURIComponent(id)}`), {
      method: 'PATCH',
      headers: { ...h, Prefer: 'return=representation' },
      body: JSON.stringify({ attiva: true })
    });
    const data = await onRes.json();
    if (!onRes.ok) return res.status(500).json({ error: 'Failed to activate plan', details: data });

    res.json({ plan: Array.isArray(data) ? data[0] : data });
  } catch (e) {
    res.status(500).json({ error: 'Failed to activate plan' });
  }
});

// Delete plan
router.delete('/plans/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const id = req.params.id;
    const r = await fetch(restUrl(`schede?id=eq.${encodeURIComponent(id)}`), {
      method: 'DELETE',
      headers: srHeaders()
    });
    if (!r.ok) return res.status(500).json({ error: 'Failed to delete plan' });
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: 'Failed to delete plan' });
  }
});

// Create session
router.post('/sessions', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { scheda_id, nome, descrizione } = req.body || {};
    if (!scheda_id || !nome) return res.status(400).json({ error: 'scheda_id and nome are required' });
    const r = await fetch(restUrl('sessioni'), {
      method: 'POST',
      headers: { ...srHeaders(), Prefer: 'return=representation' },
      body: JSON.stringify({ scheda_id, nome, descrizione: descrizione || null })
    });
    const data = await r.json();
    if (!r.ok) return res.status(500).json({ error: 'Failed to create session', details: data });
    res.status(201).json({ session: Array.isArray(data) ? data[0] : data });
  } catch (e) {
    res.status(500).json({ error: 'Failed to create session' });
  }
});

// Update session
router.put('/sessions/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const id = req.params.id;
    const payload = {};
    const allowed = ['nome','descrizione','giorno_settimana','durata_stimata_minuti','note','attiva'];
    allowed.forEach(k => { if (req.body[k] !== undefined) payload[k] = req.body[k]; });
    if (Object.keys(payload).length === 0) return res.status(400).json({ error: 'No fields to update' });
    const r = await fetch(restUrl(`sessioni?id=eq.${encodeURIComponent(id)}`), {
      method: 'PATCH',
      headers: { ...srHeaders(), Prefer: 'return=representation' },
      body: JSON.stringify(payload)
    });
    const data = await r.json();
    if (!r.ok) return res.status(500).json({ error: 'Failed to update session', details: data });
    res.json({ session: Array.isArray(data) ? data[0] : data });
  } catch (e) {
    res.status(500).json({ error: 'Failed to update session' });
  }
});

// Delete session
router.delete('/sessions/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const id = req.params.id;
    const r = await fetch(restUrl(`sessioni?id=eq.${encodeURIComponent(id)}`), {
      method: 'DELETE',
      headers: srHeaders()
    });
    if (!r.ok) return res.status(500).json({ error: 'Failed to delete session' });
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: 'Failed to delete session' });
  }
});

// Create exercise
router.post('/exercises', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { sessione_id, name, sets_count = 3, reps_min = 8, reps_max = 12, weight_suggested = 0, rest_seconds = 90 } = req.body || {};
    if (!sessione_id || !name) return res.status(400).json({ error: 'sessione_id and name are required' });
    const r = await fetch(restUrl('exercises'), {
      method: 'POST',
      headers: { ...srHeaders(), Prefer: 'return=representation' },
      body: JSON.stringify({ sessione_id, name, sets_count, reps_min, reps_max, weight_suggested, rest_seconds })
    });
    const data = await r.json();
    if (!r.ok) return res.status(500).json({ error: 'Failed to create exercise', details: data });
    res.status(201).json({ exercise: Array.isArray(data) ? data[0] : data });
  } catch (e) {
    res.status(500).json({ error: 'Failed to create exercise' });
  }
});

// Update exercise
router.put('/exercises/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const id = req.params.id;
    const payload = {};
    const allowed = ['name','description','sets_count','reps_min','reps_max','weight_suggested','rest_seconds','order_index','trainer_notes','intensity','external_url'];
    allowed.forEach(k => { if (req.body[k] !== undefined) payload[k] = req.body[k]; });
    if (Object.keys(payload).length === 0) return res.status(400).json({ error: 'No fields to update' });
    const r = await fetch(restUrl(`exercises?id=eq.${encodeURIComponent(id)}`), {
      method: 'PATCH',
      headers: { ...srHeaders(), Prefer: 'return=representation' },
      body: JSON.stringify(payload)
    });
    const data = await r.json();
    if (!r.ok) return res.status(500).json({ error: 'Failed to update exercise', details: data });
    res.json({ exercise: Array.isArray(data) ? data[0] : data });
  } catch (e) {
    res.status(500).json({ error: 'Failed to update exercise' });
  }
});

// Delete exercise
router.delete('/exercises/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const id = req.params.id;
    const r = await fetch(restUrl(`exercises?id=eq.${encodeURIComponent(id)}`), {
      method: 'DELETE',
      headers: srHeaders()
    });
    if (!r.ok) return res.status(500).json({ error: 'Failed to delete exercise' });
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: 'Failed to delete exercise' });
  }
});

// ==========================
// Calendar endpoints
// Table expected: scheduled_sessions (id uuid pk, user_id uuid, sessione_id uuid, date date, created_at, updated_at)

// Get active plan and sessions for a user
router.get('/active-plan', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const userId = req.query.user_id;
    if (!userId) return res.status(400).json({ error: 'user_id required' });
    const h = srHeaders();
    const pRes = await fetch(restUrl(`schede?user_id=eq.${encodeURIComponent(userId)}&attiva=eq.true&select=*`), { headers: h });
    const plans = await pRes.json();
    if (!pRes.ok) return res.status(500).json({ error: 'Failed to fetch plan', details: plans });
    if (!Array.isArray(plans) || plans.length === 0) return res.status(404).json({ error: 'No active plan' });
    const plan = plans[0];
    const sRes = await fetch(restUrl(`sessioni?scheda_id=eq.${encodeURIComponent(plan.id)}&select=*`), { headers: h });
    const sessions = await sRes.json();
    if (!sRes.ok) return res.status(500).json({ error: 'Failed to fetch sessions', details: sessions });
    res.json({ plan, sessions });
  } catch (e) {
    res.status(500).json({ error: 'Failed to fetch active plan' });
  }
});

// Get scheduled sessions within date range (uses workout_logs as planning store)
router.get('/schedule', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { user_id, start, end } = req.query;
    if (!user_id || !start || !end) return res.status(400).json({ error: 'user_id, start, end required (YYYY-MM-DD)' });
    if (pgPool) {
      console.log('[trainer/schedule][GET][PG]', { user_id, start, end });
      const q = `
        select wl.id, wl.user_id, wl.sessione_id, wl.workout_date as date,
               json_build_object('id', se.id, 'nome', se.nome) as sessioni
        from workout_logs wl
        left join sessioni se on se.id = wl.sessione_id
        where wl.user_id = $1 and wl.workout_date between $2 and $3
        order by wl.workout_date asc
      `;
      const { rows } = await pgPool.query(q, [user_id, start, end]);
      console.log('[trainer/schedule][GET][PG] rows:', rows.length);
      return res.json({ items: rows });
    } else {
      const h = srHeaders();
      const url = restUrl(`workout_logs?user_id=eq.${encodeURIComponent(user_id)}&workout_date=gte.${encodeURIComponent(start)}&workout_date=lte.${encodeURIComponent(end)}&select=id,user_id,sessione_id,date:workout_date,sessioni:sessione_id(id,nome)`);
      console.log('[trainer/schedule][GET][REST]', url);
      const r = await fetch(url, { headers: h });
      if (r.status === 404 || r.status === 406) return res.json({ items: [] });
      const data = await r.json();
      if (!r.ok) return res.status(500).json({ error: 'Failed to fetch schedule', details: data });
      console.log('[trainer/schedule][GET][REST] rows:', Array.isArray(data)? data.length : 0);
      res.json({ items: data });
    }
  } catch (e) {
    console.error('[trainer/schedule][GET] error', e);
    res.status(500).json({ error: 'Failed to fetch schedule' });
  }
});

// Create a scheduled session (insert planned log)
router.post('/schedule', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { user_id, sessione_id, date } = req.body || {};
    if (!user_id || !sessione_id || !date) return res.status(400).json({ error: 'user_id, sessione_id, date required' });
    if (pgPool) {
      console.log('[trainer/schedule][POST][PG]', { user_id, sessione_id, date });
      const q = `insert into workout_logs(user_id, sessione_id, workout_date, status) values ($1,$2,$3,'planned') returning id, user_id, sessione_id, workout_date as date`;
      const { rows } = await pgPool.query(q, [user_id, sessione_id, date]);
      return res.status(201).json({ item: rows[0] });
    } else {
      console.log('[trainer/schedule][POST][REST]', { user_id, sessione_id, date });
      const r = await fetch(restUrl('workout_logs'), {
        method: 'POST',
        headers: { ...srHeaders(), Prefer: 'return=representation' },
        body: JSON.stringify({ user_id, sessione_id, workout_date: date, status: 'planned' })
      });
      const data = await r.json();
      if (!r.ok) return res.status(500).json({ error: 'Failed to create schedule', details: data });
      res.status(201).json({ item: Array.isArray(data) ? data[0] : data });
    }
  } catch (e) {
    console.error('[trainer/schedule][POST] error', e);
    res.status(500).json({ error: 'Failed to create schedule' });
  }
});

// Delete a scheduled item (remove planned log)
router.delete('/schedule/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const id = req.params.id;
    if (pgPool) {
      console.log('[trainer/schedule][DELETE one][PG]', { id });
      await pgPool.query('delete from workout_logs where id = $1', [id]);
      res.json({ ok: true });
    } else {
      console.log('[trainer/schedule][DELETE one][REST]', { id });
      const r = await fetch(restUrl(`workout_logs?id=eq.${encodeURIComponent(id)}`), {
        method: 'DELETE',
        headers: srHeaders()
      });
      if (!r.ok) return res.status(500).json({ error: 'Failed to delete schedule' });
      res.json({ ok: true });
    }
  } catch (e) {
    console.error('[trainer/schedule][DELETE one] error', e);
    res.status(500).json({ error: 'Failed to delete schedule' });
  }
});

// Bulk delete scheduled items in range (uses workout_logs)
router.delete('/schedule', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { user_id, start, end } = req.query;
    if (!user_id || !start) return res.status(400).json({ error: 'user_id and start required (YYYY-MM-DD). end optional' });
    if (pgPool) {
      console.log('[trainer/schedule][DELETE bulk][PG]', { user_id, start, end });
      const q = end
        ? 'delete from workout_logs where user_id=$1 and workout_date between $2 and $3'
        : 'delete from workout_logs where user_id=$1 and workout_date >= $2';
      const params = end ? [user_id, start, end] : [user_id, start];
      const result = await pgPool.query(q, params);
      console.log('[trainer/schedule][DELETE bulk][PG] deleted:', result.rowCount || 0);
      return res.json({ ok: true, deleted: result.rowCount || 0 });
    } else {
      const base = `workout_logs?user_id=eq.${encodeURIComponent(user_id)}&workout_date=gte.${encodeURIComponent(start)}`;
      const url = end ? `${base}&workout_date=lte.${encodeURIComponent(end)}` : base;
      console.log('[trainer/schedule][DELETE bulk][REST]', url);
      const r = await fetch(restUrl(url), { method: 'DELETE', headers: srHeaders() });
      if (!r.ok) {
        const d = await r.text().catch(()=> '');
        return res.status(500).json({ error: 'Failed to bulk delete schedule', details: d });
      }
      return res.json({ ok: true });
    }
  } catch (e) {
    console.error('[trainer/schedule][DELETE bulk] error', e);
    res.status(500).json({ error: 'Failed to bulk delete schedule' });
  }
});

// Extend current week to N future weeks (bounded by plan duration if available)
router.post('/schedule/extend', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { user_id, start_week, weeks } = req.body || {};
    if (!user_id || !start_week || !weeks) return res.status(400).json({ error: 'user_id, start_week (YYYY-MM-DD Monday or "first"), weeks required' });
    const fmt = (d) => d.toISOString().slice(0,10);
    const mondayOf = (dateLike) => { const d = new Date(dateLike); const day = d.getDay(); const diff = (day === 0 ? -6 : 1) - day; d.setDate(d.getDate() + diff); d.setHours(0,0,0,0); return d; };
    let startWeekStr = start_week;
    const h = srHeaders();
    // If asked to start from first occurrence, resolve earliest workout_date for this user
    if (start_week === 'first') {
      if (pgPool) {
        const { rows } = await pgPool.query('select min(workout_date) as d from workout_logs where user_id = $1', [user_id]);
        const d = rows?.[0]?.d;
        if (!d) return res.json({ inserted: 0, note: 'no base week found' });
        startWeekStr = fmt(mondayOf(d));
      } else {
        const r = await fetch(restUrl(`workout_logs?user_id=eq.${encodeURIComponent(user_id)}&select=workout_date&order=workout_date.asc&limit=1`), { headers: h });
        const arr = await r.json();
        if (!Array.isArray(arr) || !arr.length) return res.json({ inserted: 0, note: 'no base week found' });
        startWeekStr = fmt(mondayOf(arr[0].workout_date));
      }
    }
    console.log('[trainer/schedule][EXTEND] start', { user_id, start_week, resolved: startWeekStr, weeks });
    if (pgPool) {
      const h = srHeaders();
      const pRes = await fetch(restUrl(`schede?user_id=eq.${encodeURIComponent(user_id)}&attiva=eq.true&select=id,durata_settimane`), { headers: h });
      const plans = await pRes.json();
      let maxWeeks = parseInt(weeks, 10);
      if (Array.isArray(plans) && plans.length && plans[0]?.durata_settimane) {
        maxWeeks = Math.min(maxWeeks, parseInt(plans[0].durata_settimane, 10));
      }
      const start = new Date(startWeekStr);
      const end = new Date(start);
      end.setDate(end.getDate() + 6);
      const { rows: base } = await pgPool.query(
        'select sessione_id, workout_date as date from workout_logs where user_id=$1 and workout_date between $2 and $3',
        [user_id, fmt(start), fmt(end)]
      );
      console.log('[trainer/schedule][EXTEND][PG] base count:', base.length);
      const inserts = [];
      for (let w = 1; w <= maxWeeks; w++) {
        for (const it of base) {
          const d = new Date(it.date);
          d.setDate(d.getDate() + (7 * w));
          inserts.push({ user_id, sessione_id: it.sessione_id, date: fmt(d) });
        }
      }
      if (!inserts.length) return res.json({ inserted: 0 });
      // Insert planned logs; avoid duplicates via NOT EXISTS check
      let inserted = 0;
      for (const it of inserts) {
        const result = await pgPool.query(
          `insert into workout_logs(user_id, sessione_id, workout_date, status)
           select $1, $2, $3, 'planned'
           where not exists (
             select 1 from workout_logs where user_id=$1 and sessione_id=$2 and workout_date=$3
           )`,
          [it.user_id, it.sessione_id, it.date]
        );
        inserted += (result.rowCount || 0);
      }
      console.log('[trainer/schedule][EXTEND][PG] inserted:', inserted);
      res.json({ inserted });
    } else {
      const pRes = await fetch(restUrl(`schede?user_id=eq.${encodeURIComponent(user_id)}&attiva=eq.true&select=id,durata_settimane`), { headers: h });
      const plans = await pRes.json();
      let maxWeeks = parseInt(weeks, 10);
      if (Array.isArray(plans) && plans.length && plans[0]?.durata_settimane) {
        maxWeeks = Math.min(maxWeeks, parseInt(plans[0].durata_settimane, 10));
      }
      const start = new Date(startWeekStr);
      const end = new Date(start);
      end.setDate(end.getDate() + 6);
      const baseRes = await fetch(restUrl(`workout_logs?user_id=eq.${encodeURIComponent(user_id)}&workout_date=gte.${fmt(start)}&workout_date=lte.${fmt(end)}&select=sessione_id,date:workout_date`), { headers: h });
      const base = await baseRes.json();
      console.log('[trainer/schedule][EXTEND][REST] base count:', Array.isArray(base)? base.length : 0);
      if (!baseRes.ok) return res.status(500).json({ error: 'Failed to read base week', details: base });
      const inserts = [];
      for (let w = 1; w <= maxWeeks; w++) {
        for (const it of base) {
          const d = new Date(it.date);
          d.setDate(d.getDate() + (7 * w));
          inserts.push({ user_id, sessione_id: it.sessione_id, workout_date: fmt(d), status: 'planned' });
        }
      }
      if (inserts.length === 0) return res.json({ inserted: 0 });
      const insRes = await fetch(restUrl('workout_logs'), {
        method: 'POST',
        headers: { ...h, Prefer: 'return=minimal' },
        body: JSON.stringify(inserts)
      });
      if (!insRes.ok) {
        const d = await insRes.text().catch(()=> '');
        return res.status(500).json({ error: 'Failed to extend schedule', details: d });
      }
      console.log('[trainer/schedule][EXTEND][REST] attempted inserts:', inserts.length);
      res.json({ inserted: inserts.length });
    }
  } catch (e) {
    console.error('[trainer/schedule][EXTEND] error', e);
    res.status(500).json({ error: 'Failed to extend schedule' });
  }
});

module.exports = router;
// Dashboard Overview: active/inactive counts, weekly matrix, and adherence rankings
router.get('/dashboard/overview', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const weeks = Math.max(4, Math.min(16, parseInt(req.query.weeks || '8', 10)));
    const end = new Date();
    const mondayOf = (d) => { const x = new Date(d); const day = x.getDay(); const diff = (day === 0 ? -6 : 1) - day; x.setDate(x.getDate()+diff); x.setHours(0,0,0,0); return x; };
    const endMonday = mondayOf(end);
    const weekStarts = [];
    for (let i = weeks-1; i >= 0; i--) { const dt = new Date(endMonday); dt.setDate(dt.getDate() - 7*i); weekStarts.push(dt); }
    const fmt = (d) => d.toISOString().slice(0,10);

    const headers = srHeaders();
    // Clients
    const cRes = await fetch(restUrl('user_profiles?select=id,full_name,email,utente_attivo&order=full_name.asc'), { headers });
    const clients = cRes.ok ? await cRes.json() : [];
    const active_count = clients.filter(c => !!c.utente_attivo).length;
    const inactive_count = clients.length - active_count;

    const userIds = clients.map(c => c.id);
    if (!userIds.length) return res.json({ active_count, inactive_count, weeks: weekStarts.map(fmt), clients: [] });

    // Fetch workout logs in the whole range covering these weeks
    const startRange = fmt(weekStarts[0]);
    const endRange = fmt(new Date(weekStarts[weekStarts.length-1].getTime() + 6*24*60*60*1000));
    const inList = userIds.map(encodeURIComponent).join(',');
    const wlUrl = restUrl(`workout_logs?user_id=in.(${inList})&workout_date=gte.${encodeURIComponent(startRange)}&workout_date=lte.${encodeURIComponent(endRange)}&select=user_id,workout_date,status`);
    const wlRes = await fetch(wlUrl, { headers });
    const logs = wlRes.ok ? await wlRes.json() : [];

    // Index logs by user and week
    const startToIdx = new Map(weekStarts.map((d,i)=> [fmt(d), i]));
    const weekIdxOf = (dateStr) => {
      const d = new Date(dateStr);
      const m = mondayOf(d);
      return startToIdx.get(fmt(m));
    };
    const byUser = new Map(userIds.map(id => [id, { weeks: Array(weeks).fill(null).map(()=> ({ planned:0, completed:0 })), total:{planned:0,completed:0} }]));
    for (const l of logs) {
      const idx = weekIdxOf(l.workout_date);
      if (idx == null) continue;
      const row = byUser.get(l.user_id);
      if (!row) continue;
      row.weeks[idx].planned += 1;
      row.total.planned += 1;
      if ((l.status||'').toLowerCase() === 'completed') { row.weeks[idx].completed += 1; row.total.completed += 1; }
    }

    const clientsOut = clients.map(c => {
      const row = byUser.get(c.id) || { weeks: Array(weeks).fill({planned:0,completed:0}), total:{planned:0,completed:0} };
      const weekly = row.weeks.map((w, i) => ({
        week: fmt(weekStarts[i]),
        status: w.planned === 0 ? 'none' : (w.completed >= w.planned ? 'done' : 'miss')
      }));
      const adherence = row.total.planned ? Math.round((row.total.completed/row.total.planned) * 100) : 0;
      // Trend: last half vs previous half
      const half = Math.floor(weeks/2);
      let a1p=0,a1c=0,a2p=0,a2c=0;
      row.weeks.forEach((w, i) => { if (i < weeks-half) { a1p+=w.planned; a1c+=w.completed; } else { a2p+=w.planned; a2c+=w.completed; } });
      const t1 = a1p ? (a1c/a1p) : 0; const t2 = a2p ? (a2c/a2p) : 0; const trendDelta = Math.round((t2 - t1) * 100);
      return { id: c.id, name: c.full_name || c.email || 'Cliente', email: c.email, active: !!c.utente_attivo, weekly, adherence, trendDelta };
    });

    res.json({ active_count, inactive_count, weeks: weekStarts.map(fmt), clients: clientsOut });
  } catch (e) {
    console.error('trainer/dashboard/overview error', e);
    res.status(500).json({ error: 'Failed to compute overview' });
  }
});
