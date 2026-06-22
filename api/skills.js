// GET /api/skills — approved uploads, shaped exactly like skills.json entries.
import { getServiceClient, rowToCatalog } from '../lib/supabase.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ ok: false, error: 'method_not_allowed' });
  }
  res.setHeader('Cache-Control', 'public, max-age=30, stale-while-revalidate=300');

  const slug = String(req.query.slug || '').toLowerCase();

  try {
    const supabase = getServiceClient();

    // Single-skill file payload for the in-page viewer.
    if (slug && req.query.files) {
      const { data: row, error } = await supabase
        .from('skills')
        .select('files_json')
        .eq('slug', slug)
        .eq('status', 'approved')
        .maybeSingle();
      if (error) throw error;
      return res.status(200).json({ files: (row && row.files_json) || [] });
    }

    const { data, error } = await supabase
      .from('skills')
      .select('*')
      .eq('status', 'approved')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return res.status(200).json((data || []).map(rowToCatalog));
  } catch (e) {
    // Never break the catalog: index.html treats a non-OK / empty response as "no uploads".
    console.error('[api/skills]', e && e.message);
    return res.status(200).json([]);
  }
}
