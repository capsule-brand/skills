// POST /api/upload — gated, validated, instant-publish ingest of a .skill.
// multipart/form-data: metadata fields + a `skill` file part.
import crypto from 'node:crypto';
import Busboy from 'busboy';
import { getServiceClient, BUCKET, rowToCatalog } from '../lib/supabase.js';
import { validateMetadata, validateSkillZip, MAX_BYTES } from '../lib/validate.js';

const RATE_WINDOW_SHORT_MS = 10 * 60 * 1000;
const RATE_LIMIT_SHORT = 5;
const RATE_WINDOW_DAY_MS = 24 * 60 * 60 * 1000;
const RATE_LIMIT_DAY = 30;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ ok: false, error: 'method_not_allowed' });
  }

  // Cheap early bail before buffering anything. File is capped tighter by busboy;
  // this just rejects absurd bodies (file + fields + multipart overhead).
  const declaredLen = Number(req.headers['content-length'] || 0);
  if (declaredLen && declaredLen > MAX_BYTES + 1_000_000) {
    return res.status(413).json({ ok: false, error: 'too_large', message: 'File is too large (2 MB max).', field: 'skill' });
  }

  let supabase;
  try {
    supabase = getServiceClient();
  } catch (e) {
    console.error('[api/upload] config', e && e.message);
    return res.status(500).json({ ok: false, error: 'server_misconfigured' });
  }

  const ip = clientIp(req);
  if (!(await withinRateLimit(supabase, ip))) {
    res.setHeader('Retry-After', '600');
    return res.status(429).json({ ok: false, error: 'rate_limited', message: 'Too many uploads. Try again later.' });
  }

  // Parse multipart.
  let parsed;
  try {
    parsed = await parseMultipart(req);
  } catch (e) {
    return res.status(e.status || 400).json({ ok: false, error: 'bad_request', message: 'Could not read the upload.' });
  }
  if (parsed.truncated) {
    return res.status(413).json({ ok: false, error: 'too_large', message: 'File is too large (2 MB max).', field: 'skill' });
  }

  // Light gate.
  if (!safeEqual(parsed.fields.gate, process.env.UPLOAD_SHARED_SECRET)) {
    return res.status(401).json({ ok: false, error: 'bad_gate', message: 'Incorrect access key.', field: 'gate' });
  }

  // Metadata.
  const meta = validateMetadata(parsed.fields);
  if (!meta.ok) {
    return res.status(meta.status).json({ ok: false, error: meta.error, message: meta.message, field: meta.field });
  }
  const m = meta.value;

  // File.
  if (!parsed.fileBuffer || parsed.fileBuffer.length === 0) {
    return res.status(400).json({ ok: false, error: 'no_file', message: 'Attach a .skill file.', field: 'skill' });
  }
  if (parsed.fileBuffer.length > MAX_BYTES) {
    return res.status(413).json({ ok: false, error: 'too_large', message: 'File is too large (2 MB max).', field: 'skill' });
  }
  const zip = validateSkillZip(parsed.fileBuffer);
  if (!zip.ok) {
    return res.status(zip.status).json({ ok: false, error: zip.error, message: zip.message, field: zip.field });
  }

  // Slug uniqueness against existing live uploads (reserved seeds already blocked in validate).
  const { data: clash } = await supabase
    .from('skills')
    .select('id')
    .eq('slug', m.slug)
    .neq('status', 'removed')
    .maybeSingle();
  if (clash) {
    return res.status(409).json({ ok: false, error: 'slug_taken', message: 'That slug is already in use.', field: 'slug' });
  }

  const sha256 = crypto.createHash('sha256').update(parsed.fileBuffer).digest('hex');
  const storagePath = `uploads/${m.slug}/${sha256}.skill`;

  // Store blob.
  const { error: upErr } = await supabase.storage
    .from(BUCKET)
    .upload(storagePath, parsed.fileBuffer, { contentType: 'application/zip', upsert: true });
  if (upErr) {
    console.error('[api/upload] storage', upErr.message);
    return res.status(500).json({ ok: false, error: 'storage_failed', message: 'Could not store the file.' });
  }

  // Insert metadata row (status defaults to 'approved' → instant publish).
  const { data: row, error: insErr } = await supabase
    .from('skills')
    .insert({
      name: m.name,
      slug: m.slug,
      version: m.version,
      mono: m.mono,
      accent: m.accent,
      tagline: m.tagline,
      invoke: m.invoke || null,
      needs: m.needs || null,
      say: m.say || null,
      tags: m.tags,
      submitter_email: m.submitter_email || null,
      storage_path: storagePath,
      file_size: parsed.fileBuffer.length,
      sha256,
      files_json: zip.files,
      has_skill_md: true,
    })
    .select('*')
    .single();

  if (insErr) {
    if (insErr.code === '23505') {
      // Raced another insert for this slug; leave any existing blob untouched.
      return res.status(409).json({ ok: false, error: 'slug_taken', message: 'That slug is already in use.', field: 'slug' });
    }
    console.error('[api/upload] insert', insErr.message);
    // No row created → remove the orphaned blob.
    await supabase.storage.from(BUCKET).remove([storagePath]).catch(() => {});
    return res.status(500).json({ ok: false, error: 'db_failed', message: 'Could not save the skill.' });
  }

  return res.status(201).json({ ok: true, skill: rowToCatalog(row) });
}

// ---- helpers ----

function clientIp(req) {
  const fwd = String(req.headers['x-forwarded-for'] || '').split(',')[0].trim();
  return fwd || (req.socket && req.socket.remoteAddress) || 'unknown';
}

function safeEqual(a, b) {
  if (a == null || b == null) return false;
  const ab = Buffer.from(String(a));
  const bb = Buffer.from(String(b));
  if (ab.length !== bb.length || ab.length === 0) return false;
  return crypto.timingSafeEqual(ab, bb);
}

// Best-effort IP rate limit. Fails open if the table is missing/errors — an
// internal tool shouldn't be bricked by a limiter outage.
async function withinRateLimit(supabase, ip) {
  try {
    const now = Date.now();
    const shortSince = new Date(now - RATE_WINDOW_SHORT_MS).toISOString();
    const daySince = new Date(now - RATE_WINDOW_DAY_MS).toISOString();

    const { count: recent } = await supabase
      .from('rate_events')
      .select('*', { count: 'exact', head: true })
      .eq('ip', ip)
      .gte('created_at', shortSince);
    if ((recent || 0) >= RATE_LIMIT_SHORT) return false;

    const { count: daily } = await supabase
      .from('rate_events')
      .select('*', { count: 'exact', head: true })
      .eq('ip', ip)
      .gte('created_at', daySince);
    if ((daily || 0) >= RATE_LIMIT_DAY) return false;

    await supabase.from('rate_events').insert({ ip });
    return true;
  } catch (e) {
    console.error('[api/upload] rate-limit', e && e.message);
    return true;
  }
}

function parseMultipart(req) {
  return new Promise((resolve, reject) => {
    let bb;
    try {
      bb = Busboy({
        headers: req.headers,
        limits: { files: 1, fileSize: MAX_BYTES, fields: 30, fieldSize: 20_000, fieldNameSize: 100 },
      });
    } catch (e) {
      return reject(Object.assign(new Error('bad_headers'), { status: 400 }));
    }
    const fields = {};
    const chunks = [];
    let fileName = '';
    let gotFile = false;
    let truncated = false;

    bb.on('field', (name, val) => {
      if (name === 'tags') {
        if (!Array.isArray(fields.tags)) fields.tags = [];
        fields.tags.push(val);
      } else {
        fields[name] = val;
      }
    });
    bb.on('file', (_name, stream, info) => {
      gotFile = true;
      fileName = (info && info.filename) || '';
      stream.on('data', (d) => chunks.push(d));
      stream.on('limit', () => { truncated = true; });
      stream.on('error', reject);
    });
    bb.on('error', reject);
    bb.on('close', () => {
      resolve({ fields, fileBuffer: gotFile ? Buffer.concat(chunks) : null, fileName, truncated });
    });
    req.pipe(bb);
  });
}
