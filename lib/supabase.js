// Service-role Supabase client factory. SERVER-ONLY — the service-role key
// bypasses RLS, so this module must never be imported into client code.
import { createClient } from '@supabase/supabase-js';

export const BUCKET = 'skills';

let _client = null;

/** Lazily build a singleton service-role client. Throws if env is missing. */
export function getServiceClient() {
  if (_client) return _client;
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error('Supabase env not configured (SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY)');
  }
  _client = createClient(url, key, {
    // Catalog tables live in a dedicated `skills` schema (shared internal DB,
    // walled off from other apps in the same project).
    db: { schema: 'skills' },
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return _client;
}

/**
 * Map a DB row to the exact shape index.html expects for a catalog card,
 * identical to a skills.json entry plus a `source` discriminator.
 */
export function rowToCatalog(row) {
  return {
    name: row.name,
    slug: row.slug,
    version: row.version,
    // created_at/updated_at is a timestamptz; the catalog's fmtDate wants YYYY-MM-DD.
    updated: (row.updated_at || row.created_at || '').slice(0, 10),
    mono: row.mono || '',
    accent: row.accent || '#646b78',
    tagline: row.tagline || '',
    invoke: row.invoke || '',
    needs: row.needs || '',
    say: row.say || '',
    file: '/api/download?slug=' + encodeURIComponent(row.slug),
    guide: '', // uploads carry no rich install-guide.html
    icon: '', // uploads carry no inline SVG; the mono chip is used instead
    tags: Array.isArray(row.tags) ? row.tags : [],
    source: 'upload',
  };
}
