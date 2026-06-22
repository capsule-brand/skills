// Metadata + .skill (zip) validation. No human review gate on publish, so these
// rules are the only thing standing between an uploader and the live catalog.
import { unzipSync } from 'fflate';

export const MAX_BYTES = Number(process.env.UPLOAD_MAX_BYTES) || 2_000_000; // 2 MB compressed
const MAX_ENTRIES = 200;
const MAX_TOTAL_UNCOMPRESSED = 10_000_000; // 10 MB across the whole archive
const MAX_ENTRY_UNCOMPRESSED = 4_000_000; // 4 MB any single entry
const MAX_TEXT_FILE_BYTES = 262_144; // 256 KB — only smaller text files get inlined
const MAX_FILES_JSON_FILES = 60;
const MAX_FILES_JSON_TOTAL = 600_000; // cap the inlined viewer payload

// Seed slugs live in static skills.json, not the DB; protect them by name.
export const RESERVED_SLUGS = [
  'colorproof',
  'ebillity-timesheet',
  'illustrator-data-merge',
  'panelproof',
  'reskin-kit',
];

const SLUG_RE = /^[a-z0-9][a-z0-9-]{0,38}[a-z0-9]$/;
const INVOKE_RE = /^\/[a-z0-9][a-z0-9-]{0,38}$/;
const VERSION_RE = /^\d+\.\d+\.\d+$/;
const ACCENT_RE = /^#[0-9a-fA-F]{6}$/;
const MONO_RE = /^[A-Za-z0-9]{2}$/;
const TAG_RE = /^[A-Za-z0-9 ]{1,24}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const LANG_BY_EXT = {
  md: 'md', markdown: 'md', txt: 'text',
  json: 'json', js: 'javascript', mjs: 'javascript', cjs: 'javascript',
  jsx: 'javascript', ts: 'typescript', tsx: 'typescript',
  py: 'python', rb: 'ruby', sh: 'bash', bash: 'bash',
  html: 'html', htm: 'html', css: 'css', svg: 'html',
  yml: 'yaml', yaml: 'yaml', toml: 'toml', csv: 'text', jsx_: 'javascript',
};
const TEXT_EXTS = new Set(Object.keys(LANG_BY_EXT));

function fail(status, error, message, field) {
  return { ok: false, status, error, message, field };
}

function str(v) {
  if (Array.isArray(v)) v = v[0];
  return (v == null ? '' : String(v)).trim();
}

/** Validate + normalize the submitted metadata fields. Returns {ok, value} or a fail(). */
export function validateMetadata(fields) {
  const name = str(fields.name);
  if (name.length < 1 || name.length > 60) {
    return fail(400, 'bad_name', 'Name must be 1–60 characters.', 'name');
  }

  const slug = str(fields.slug).toLowerCase();
  if (!SLUG_RE.test(slug)) {
    return fail(400, 'bad_slug', 'Slug must be 2–40 lowercase letters, numbers, or hyphens.', 'slug');
  }
  if (RESERVED_SLUGS.includes(slug)) {
    return fail(409, 'reserved_slug', 'That slug is reserved. Choose another.', 'slug');
  }

  const version = str(fields.version) || '1.0.0';
  if (!VERSION_RE.test(version)) {
    return fail(400, 'bad_version', 'Version must look like 1.0.0.', 'version');
  }

  const tagline = str(fields.tagline);
  if (tagline.length < 1 || tagline.length > 140) {
    return fail(400, 'bad_tagline', 'Tagline must be 1–140 characters.', 'tagline');
  }

  let invoke = str(fields.invoke);
  if (invoke) {
    if (!invoke.startsWith('/')) invoke = '/' + invoke;
    if (!INVOKE_RE.test(invoke)) {
      return fail(400, 'bad_invoke', 'Command must look like /my-skill.', 'invoke');
    }
  }

  const needs = str(fields.needs);
  if (needs.length > 200) return fail(400, 'bad_needs', '“Needs” must be ≤200 characters.', 'needs');
  const say = str(fields.say);
  if (say.length > 200) return fail(400, 'bad_say', '“Just say” must be ≤200 characters.', 'say');

  let mono = str(fields.mono).toUpperCase();
  if (mono && !MONO_RE.test(mono)) {
    return fail(400, 'bad_mono', 'Mono badge must be exactly 2 letters or digits.', 'mono');
  }
  if (!mono) mono = deriveMono(name);

  const accent = str(fields.accent);
  if (!ACCENT_RE.test(accent)) {
    return fail(400, 'bad_accent', 'Accent must be a hex color like #3b74f0.', 'accent');
  }

  // tags: accept a repeated field (array) or a comma-separated string (or both).
  let rawTags = fields.tags;
  if (!Array.isArray(rawTags)) rawTags = [str(rawTags)];
  rawTags = rawTags.flatMap((t) => String(t || '').split(','));
  const seen = new Set();
  const tags = [];
  for (let t of rawTags) {
    t = String(t || '').trim();
    if (!t) continue;
    if (!TAG_RE.test(t)) {
      return fail(400, 'bad_tag', 'Tags may use letters, numbers, and spaces (≤24 chars each).', 'tags');
    }
    const key = t.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    tags.push(t);
    if (tags.length > 6) return fail(400, 'too_many_tags', 'At most 6 tags.', 'tags');
  }

  const submitter_email = str(fields.submitter_email);
  if (submitter_email && (submitter_email.length > 120 || !EMAIL_RE.test(submitter_email))) {
    return fail(400, 'bad_email', 'Enter a valid email, or leave it blank.', 'submitter_email');
  }

  return {
    ok: true,
    value: { name, slug, version, tagline, invoke, needs, say, mono, accent, tags, submitter_email },
  };
}

function deriveMono(name) {
  const words = name.replace(/[^A-Za-z0-9 ]/g, ' ').trim().split(/\s+/).filter(Boolean);
  let m;
  if (words.length >= 2) m = words[0][0] + words[1][0];
  else m = (words[0] || 'SK').slice(0, 2);
  return m.toUpperCase();
}

function extOf(name) {
  const base = name.split('/').pop() || '';
  const i = base.lastIndexOf('.');
  return i > 0 ? base.slice(i + 1).toLowerCase() : '';
}

/** Reject zip-slip / unsafe entry paths. */
function unsafePath(name) {
  if (!name) return true;
  if (name.startsWith('/') || name.startsWith('\\')) return true;
  if (/^[a-zA-Z]:/.test(name)) return true; // drive letter
  return name.split(/[/\\]/).some((seg) => seg === '..');
}

/**
 * Validate the raw .skill bytes are a real, safe zip containing a top-level
 * SKILL.md, and extract small text files into the {name,lang,content}[] shape
 * the in-page viewer uses. Returns {ok, hasSkillMd, files} or a fail().
 */
export function validateSkillZip(buf) {
  // Magic bytes — the only trustworthy MIME signal. PK\x03\x04 or empty-archive PK\x05\x06.
  if (
    buf.length < 4 ||
    buf[0] !== 0x50 || buf[1] !== 0x4b ||
    !((buf[2] === 0x03 && buf[3] === 0x04) || (buf[2] === 0x05 && buf[3] === 0x06))
  ) {
    return fail(415, 'not_a_zip', 'That file is not a .skill (zip) archive.', 'skill');
  }

  const allNames = [];
  let entryCount = 0;
  let totalUncompressed = 0;
  let unzipped;
  try {
    unzipped = unzipSync(buf, {
      filter: (f) => {
        entryCount++;
        if (entryCount > MAX_ENTRIES) throw new Error('too_many_entries');
        if (unsafePath(f.name)) throw new Error('unsafe_path');
        totalUncompressed += f.originalSize || 0;
        if (totalUncompressed > MAX_TOTAL_UNCOMPRESSED) throw new Error('zip_too_large');
        if ((f.originalSize || 0) > MAX_ENTRY_UNCOMPRESSED) throw new Error('entry_too_large');
        const isDir = f.name.endsWith('/');
        if (!isDir) allNames.push(f.name);
        // Only decompress small text files (for the viewer); everything else is
        // validated above but skipped to bound memory.
        return !isDir && TEXT_EXTS.has(extOf(f.name)) && (f.originalSize || 0) <= MAX_TEXT_FILE_BYTES;
      },
    });
  } catch (e) {
    const map = {
      too_many_entries: 'Archive has too many files.',
      unsafe_path: 'Archive contains an unsafe file path.',
      zip_too_large: 'Archive contents are too large when unpacked.',
      entry_too_large: 'A file inside the archive is too large.',
    };
    const msg = map[e && e.message];
    if (msg) return fail(400, e.message, msg, 'skill');
    return fail(400, 'bad_zip', 'Could not read that .skill archive.', 'skill');
  }

  // Determine top-level SKILL.md, allowing a single wrapping directory.
  const topDir = singleTopDir(allNames);
  const skillMdKey = topDir ? topDir + 'SKILL.md' : 'SKILL.md';
  const hasSkillMd = allNames.includes(skillMdKey) || allNames.includes('SKILL.md');
  if (!hasSkillMd) {
    return fail(400, 'missing_skill_md', 'A .skill must contain a top-level SKILL.md.', 'skill');
  }

  const decoder = new TextDecoder('utf-8', { fatal: false });
  const files = [];
  let filesTotal = 0;
  // Stable order: SKILL.md first, then the rest alphabetically.
  const keys = Object.keys(unzipped).sort((a, b) => {
    const am = /(^|\/)SKILL\.md$/.test(a) ? 0 : 1;
    const bm = /(^|\/)SKILL\.md$/.test(b) ? 0 : 1;
    return am - bm || a.localeCompare(b);
  });
  for (const key of keys) {
    if (files.length >= MAX_FILES_JSON_FILES || filesTotal >= MAX_FILES_JSON_TOTAL) break;
    const display = topDir && key.startsWith(topDir) ? key.slice(topDir.length) : key;
    if (!display) continue;
    const content = decoder.decode(unzipped[key]);
    filesTotal += content.length;
    files.push({ name: display, lang: LANG_BY_EXT[extOf(display)] || 'text', content });
  }

  return { ok: true, hasSkillMd: true, files };
}

/** If every entry shares one top-level directory, return it (with trailing slash); else ''. */
function singleTopDir(names) {
  let top = null;
  for (const n of names) {
    const seg = n.indexOf('/');
    if (seg === -1) return ''; // a root-level file exists → no single wrapper
    const dir = n.slice(0, seg + 1);
    if (top === null) top = dir;
    else if (top !== dir) return '';
  }
  return top || '';
}
