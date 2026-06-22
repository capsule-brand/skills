// GET /api/download?slug=… — stream an approved upload's .skill from private
// Storage. This is the kill-switch enforcement point: non-approved rows refuse.
import { getServiceClient, BUCKET } from '../lib/supabase.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ ok: false, error: 'method_not_allowed' });
  }
  const slug = String(req.query.slug || '').toLowerCase();
  if (!/^[a-z0-9][a-z0-9-]{0,38}[a-z0-9]$/.test(slug)) {
    return res.status(400).json({ ok: false, error: 'bad_slug' });
  }

  try {
    const supabase = getServiceClient();
    const { data: row, error } = await supabase
      .from('skills')
      .select('slug, status, storage_path')
      .eq('slug', slug)
      .eq('status', 'approved')
      .maybeSingle();
    if (error) throw error;
    if (!row) return res.status(404).json({ ok: false, error: 'not_found' });

    const { data: blob, error: dlErr } = await supabase.storage
      .from(BUCKET)
      .download(row.storage_path);
    if (dlErr || !blob) return res.status(404).json({ ok: false, error: 'blob_missing' });

    const buf = Buffer.from(await blob.arrayBuffer());
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename="${slug}.skill"`);
    // Content-addressed storage path changes on version bump, so long cache is safe.
    res.setHeader('Cache-Control', 'public, max-age=86400');
    return res.status(200).send(buf);
  } catch (e) {
    console.error('[api/download]', e && e.message);
    return res.status(500).json({ ok: false, error: 'download_failed' });
  }
}
