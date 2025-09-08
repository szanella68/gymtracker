const express = require('express');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

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
    const { scheda_id, nome, descrizione, ordine } = req.body || {};
    if (!scheda_id || !nome) return res.status(400).json({ error: 'scheda_id and nome are required' });
    const r = await fetch(restUrl('sessioni'), {
      method: 'POST',
      headers: { ...srHeaders(), Prefer: 'return=representation' },
      body: JSON.stringify({ scheda_id, nome, descrizione: descrizione || null, ordine: ordine || 1 })
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
    const allowed = ['nome','descrizione','ordine','giorno_settimana','durata_stimata_minuti','note','attiva'];
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
    const allowed = ['name','description','sets_count','reps_min','reps_max','weight_suggested','rest_seconds','order_index','trainer_notes'];
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

module.exports = router;
