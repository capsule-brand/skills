// POST /api/delete — gated removal of an uploaded skill.
// JSON body: { slug, gate }. The gate is the same shared access key as upload.
// Soft-deletes the row (status='removed') so the slug stays reserved, then
// best-effort removes the stored blob. Only uploads live in the DB, so static
// seed skills can never be hit here.
import crypto from 'node:crypto';
import { getServiceClient, BUCKET } from '../lib/supabase.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ ok: false, error: 'method_not_allowed' });
  }

  let body;
  try {
    body = await readJson(req);
  } catch (e) {
    return res.status(400).json({ ok: false, error: 'bad_request', message: 'Could not read the request.' });
  }

  const slug = String(body.slug || '').toLowerCase();
  if (!/^[a-z0-9][a-z0-9-]{0,38}[a-z0-9]$/.test(slug)) {
    return res.status(400).json({ ok: false, error: 'bad_slug', message: 'Unknown skill.' });
  }

  if (!safeEqual(body.gate, process.env.UPLOAD_SHARED_SECRET)) {
    return res.status(401).json({ ok: false, error: 'bad_gate', message: 'Incorrect access key.' });
  }

  let supabase;
  try {
    supabase = getServiceClient();
  } catch (e) {
    console.error('[api/delete] config', e && e.message);
    return res.status(500).json({ ok: false, error: 'server_misconfigured' });
  }

  try {
    const { data: row, error } = await supabase
      .from('skills')
      .select('id, slug, status, storage_path')
      .eq('slug', slug)
      .neq('status', 'removed')
      .maybeSingle();
    if (error) throw error;
    if (!row) return res.status(404).json({ ok: false, error: 'not_found', message: 'That skill no longer exists.' });

    const { error: updErr } = await supabase
      .from('skills')
      .update({ status: 'removed' })
      .eq('id', row.id);
    if (updErr) throw updErr;

    // Best-effort blob cleanup — the row is already gone from the catalog even
    // if storage removal fails, so don't surface a 500 for it.
    if (row.storage_path) {
      await supabase.storage.from(BUCKET).remove([row.storage_path]).catch(() => {});
    }

    return res.status(200).json({ ok: true, slug });
  } catch (e) {
    console.error('[api/delete]', e && e.message);
    return res.status(500).json({ ok: false, error: 'delete_failed', message: 'Could not delete the skill.' });
  }
}

// ---- helpers ----

function safeEqual(a, b) {
  if (a == null || b == null) return false;
  const ab = Buffer.from(String(a));
  const bb = Buffer.from(String(b));
  if (ab.length !== bb.length || ab.length === 0) return false;
  return crypto.timingSafeEqual(ab, bb);
}

// Read a JSON body whether or not the platform already parsed it.
function readJson(req) {
  return new Promise((resolve, reject) => {
    if (req.body != null) {
      if (typeof req.body === 'object') return resolve(req.body);
      try { return resolve(JSON.parse(req.body)); } catch (e) { return reject(e); }
    }
    const chunks = [];
    req.on('data', (c) => chunks.push(c));
    req.on('error', reject);
    req.on('end', () => {
      const raw = Buffer.concat(chunks).toString('utf8').trim();
      if (!raw) return resolve({});
      try { resolve(JSON.parse(raw)); } catch (e) { reject(e); }
    });
  });
}
