#!/usr/bin/env bash
# add-skill.sh — scaffold and publish a NEW skill to the Capsule Skills catalog.
#
# Counterpart to sync-release.sh, which only UPDATES skills that already exist.
# This follows the documented manual repo flow for first-party (seed) skills:
#   create skills/<slug>/ (the .skill + files.json + install-guide.html),
#   append an entry to skills.json, commit, push to main -> Vercel auto-deploys.
#
# A .skill is just a zip of a folder containing SKILL.md.
#
# Usage:
#   ./add-skill.sh <slug> <path-to-SKILL.md | path-to-skill-folder> [options]
#
#   Pass a FOLDER to bundle assets (assets/, scripts/, references/ ...) into the .skill.
#   Pass a bare SKILL.md to package just that file — you'll be warned if siblings exist.
#
# Options (all have sensible defaults; override the ones you care about):
#   --name "Display Name"        default: Title-cased slug
#   --mono XX                    default: first two letters of slug, uppercased
#   --accent "#0a66c2"           default: #646b78
#   --tagline "..."              default: first sentence of the SKILL.md description
#   --invoke "/slug"             default: /<slug>
#   --needs "..."                default: generic
#   --say "a|b|c"                 pipe-separated examples; card shows the 1st, guide lists all
#   --tags "Marketing,Writing"   default: none
#   --icon "<path .../>"         default: a generic file glyph (lucide)
#   --version 1.0.0              default: 1.0.0
#   --dry-run                    build into /tmp and print the plan; touch nothing
#   --no-push                    write + commit, but don't push
#
# Examples:
#   ./add-skill.sh client-work-linkedin /tmp/SKILL.md \
#     --name "Client Work → LinkedIn" --mono LI --accent "#0a66c2" \
#     --invoke "/client-work-linkedin" --tags "Marketing,Writing"
#   ./add-skill.sh my-skill ./SKILL.md --dry-run

set -euo pipefail

SITE_REPO="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

SLUG="${1:-}"; SRC_MD="${2:-}"
shift 2 2>/dev/null || true

NAME=""; MONO=""; ACCENT="#646b78"; TAGLINE=""; INVOKE=""
NEEDS="Whatever the skill works on — point Claude at a folder, connect the right app, or paste the details into the chat."
SAY="Use the skill on this."
TAGS=""; ICON=""; VERSION="1.0.0"; DRY=0; NO_PUSH=0

while [[ $# -gt 0 ]]; do
  case "$1" in
    --name) NAME="$2"; shift 2 ;;
    --mono) MONO="$2"; shift 2 ;;
    --accent) ACCENT="$2"; shift 2 ;;
    --tagline) TAGLINE="$2"; shift 2 ;;
    --invoke) INVOKE="$2"; shift 2 ;;
    --needs) NEEDS="$2"; shift 2 ;;
    --say) SAY="$2"; shift 2 ;;
    --tags) TAGS="$2"; shift 2 ;;
    --icon) ICON="$2"; shift 2 ;;
    --version) VERSION="$2"; shift 2 ;;
    --dry-run) DRY=1; shift ;;
    --no-push) NO_PUSH=1; shift ;;
    *) echo "✗ unknown option: $1"; exit 1 ;;
  esac
done

if [[ -z "$SLUG" || -z "$SRC_MD" ]]; then
  echo "Usage: ./add-skill.sh <slug> <path-to-SKILL.md | path-to-skill-folder> [options]"
  echo "  Pass a FOLDER to bundle assets (scripts/, assets/, references/ ...) into the .skill."
  echo "  Pass a bare SKILL.md to package just that file."
  echo "(see the header of this script for options)"
  exit 1
fi
if [[ ! "$SLUG" =~ ^[a-z0-9]+(-[a-z0-9]+)*$ ]]; then
  echo "✗ slug must be lowercase kebab-case (got: $SLUG)"; exit 1
fi

# Accept either a SKILL.md path or a folder containing one.
# SRC_DIR is set only when we should bundle a whole directory.
SRC_DIR=""
if [[ -d "$SRC_MD" ]]; then
  SRC_DIR="$(cd "$SRC_MD" && pwd)"
  SRC_MD="$SRC_DIR/SKILL.md"
  if [[ ! -f "$SRC_MD" ]]; then
    echo "✗ no SKILL.md inside folder: $SRC_DIR"; exit 1
  fi
fi
if [[ ! -f "$SRC_MD" ]]; then
  echo "✗ SKILL.md not found at: $SRC_MD"; exit 1
fi

# Given a bare SKILL.md that has siblings, warn — those would be silently dropped.
if [[ -z "$SRC_DIR" ]]; then
  _par="$(cd "$(dirname "$SRC_MD")" && pwd)"
  _sib=$(find "$_par" -mindepth 1 -maxdepth 1 ! -name 'SKILL.md' ! -name '.*' 2>/dev/null | wc -l | tr -d ' ')
  if [[ "$_sib" -gt 0 ]]; then
    echo "⚠ $_sib item(s) sit next to that SKILL.md and will NOT be packaged."
    echo "  If the skill needs them, re-run with the folder instead:"
    echo "      ./add-skill.sh $SLUG \"$_par\""
  fi
fi

# Refuse to clobber an existing skill — that's sync-release.sh's job.
EXISTS="$(python3 -c "import json,sys;d=json.load(open('$SITE_REPO/skills.json'));print('yes' if any(x.get('slug')==sys.argv[1] for x in d) else 'no')" "$SLUG")"
if [[ "$EXISTS" == "yes" ]]; then
  echo "✗ '$SLUG' already exists in skills.json."
  echo "  To update an existing skill, use:  ./sync-release.sh $SLUG patch --update"
  exit 1
fi

SKILLDIR="$SITE_REPO/skills/$SLUG"
TODAY="$(date +%Y-%m-%d)"
PFX=""; [[ "$DRY" == 1 ]] && PFX="[dry-run] "

# carry CLI flags into the python env (python reads them via os.environ)
export NAME MONO ACCENT TAGLINE INVOKE NEEDS SAY TAGS ICON

# ---- 1. package the .skill (zip of <slug>/SKILL.md) ----
rm -rf /tmp/skrel && mkdir -p "/tmp/skrel/$SLUG"
if [[ -n "$SRC_DIR" ]]; then
  # bundle the whole skill folder (assets/, scripts/, references/ ...)
  ( cd "$SRC_DIR" && tar cf - --exclude '.DS_Store' --exclude '._*' --exclude '.git' . ) \
    | ( cd "/tmp/skrel/$SLUG" && tar xf - )
else
  cp "$SRC_MD" "/tmp/skrel/$SLUG/SKILL.md"
fi
find /tmp/skrel \( -name '._*' -o -name '.DS_Store' \) -delete 2>/dev/null || true
( cd /tmp/skrel && rm -f "$SLUG.skill" && zip -r -X -y -q "$SLUG.skill" "$SLUG" )
PKGCOUNT=$(cd "/tmp/skrel/$SLUG" && find . -type f | wc -l | tr -d ' ')
echo "packaged $PKGCOUNT file(s) into $SLUG.skill$([[ -n "$SRC_DIR" ]] && echo " (from folder $SRC_DIR)")"
PKG=$(wc -c < "/tmp/skrel/$SLUG.skill" | tr -d ' ')
INNER=$(wc -c < "/tmp/skrel/$SLUG/SKILL.md" | tr -d ' ')

# ---- 2. render files.json, install-guide.html, and the skills.json entry ----
# All templating is done in python (handles JSON + HTML with CSS braces cleanly).
OUT_DIR="$SKILLDIR"; [[ "$DRY" == 1 ]] && OUT_DIR="/tmp/skrel/preview"
mkdir -p "$OUT_DIR"

python3 - "$SITE_REPO" "$SLUG" "$SRC_MD" "$OUT_DIR" "$VERSION" "$TODAY" "$DRY" <<'PY'
import json, re, sys

site, slug, src_md, out_dir, version, today, dry = sys.argv[1:8]
dry = dry == "1"

raw = open(src_md).read()

# defaults derived from the slug / SKILL.md frontmatter
import os
def env(k, d=""):
    return os.environ.get(k, d)

name    = env("NAME")    or " ".join(w.capitalize() for w in slug.split("-"))
mono    = (env("MONO")   or "".join(slug.split("-"))[:2]).upper()
accent  = env("ACCENT")  or "#646b78"
invoke  = env("INVOKE")  or "/" + slug
needs   = env("NEEDS")
say     = env("SAY")
tagline = env("TAGLINE")
icon    = env("ICON")    or '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/>'
tags    = [t.strip() for t in env("TAGS").split(",") if t.strip()]

# tagline default = first sentence of the frontmatter description
if not tagline:
    m = re.search(r'^description:\s*(.+)$', raw, re.M)
    if m:
        desc = m.group(1).strip()
        tagline = re.split(r'(?<=[.!?])\s', desc)[0]
    else:
        tagline = name

# ---- files.json ----
# Baseline: SKILL.md only. If the skill was packaged from a folder, the shell
# step after this python block rewrites files.json to include the bundled files.
files_json = [{"name": "SKILL.md", "lang": "md", "content": raw}]
json.dump(files_json, open(os.path.join(out_dir, "files.json"), "w"))

# ---- skills.json entry ----
entry = {
    "name": name, "slug": slug, "version": version, "updated": today,
    "mono": mono, "accent": accent, "tagline": tagline, "invoke": invoke,
    "needs": needs, "say": say.split("|")[0].strip(),
    "file": f"skills/{slug}/{slug}.skill",
    "guide": f"skills/{slug}/install-guide.html",
    "icon": icon, "tags": tags,
}

# ---- install-guide.html from a tokenized template ----
say_items = "".join(f"      <li>{s.strip()}</li>\n" for s in say.split("|")) or f"      <li>{say}</li>\n"

TEMPLATE = open(os.path.join(site, ".add-skill-guide.template.html")).read()
guide = (TEMPLATE
    .replace("%%TITLE%%", name)
    .replace("%%TAGLINE%%", tagline)
    .replace("%%VERSION%%", version)
    .replace("%%ACCENT%%", accent)
    .replace("%%ICON%%", icon)
    .replace("%%SLUG%%", slug)
    .replace("%%INVOKE%%", invoke)
    .replace("%%NEEDS%%", needs)
    .replace("%%SAY_ITEMS%%", say_items.rstrip("\n")))
open(os.path.join(out_dir, "install-guide.html"), "w").write(guide)

if dry:
    print("[dry-run] skills.json entry that WOULD be appended:")
    print(json.dumps(entry, indent=2, ensure_ascii=False))
    print(f"[dry-run] wrote preview artifacts to {out_dir}")
else:
    p = os.path.join(site, "skills.json")
    d = [x for x in json.load(open(p)) if x.get("slug") != slug]
    d.append(entry)
    json.dump(d, open(p, "w"), indent=2, ensure_ascii=False)
    open(p, "a").write("\n")
    print("appended skills.json entry for", slug)
PY

# ---- 2b. if packaged from a folder, list every bundled file in files.json ----
if [[ -n "$SRC_DIR" ]]; then
  python3 - "/tmp/skrel/$SLUG" "$OUT_DIR/files.json" <<'PY'
import json,os,sys
root,out=sys.argv[1:3]
LANG={'.md':'md','.py':'python','.js':'javascript','.sh':'bash','.json':'json',
      '.svg':'svg','.html':'html','.css':'css','.txt':'text','.yml':'yaml','.yaml':'yaml'}
BIN={'.png','.jpg','.jpeg','.gif','.pdf','.zip','.otf','.ttf','.woff','.woff2','.ico'}
files=[]
for dp,_,fns in os.walk(root):
    for fn in sorted(fns):
        if fn=='.DS_Store': continue
        full=os.path.join(dp,fn); rel=os.path.relpath(full,root)
        ext=os.path.splitext(fn)[1].lower()
        if ext in BIN: continue
        try: content=open(full,encoding='utf-8').read()
        except UnicodeDecodeError: continue
        files.append({"name":rel,"lang":LANG.get(ext,'text'),"content":content})
files.sort(key=lambda f:(f['name']!='SKILL.md', f['name']))
json.dump(files,open(out,'w'))
print(f"files.json lists {len(files)} file(s)")
PY
fi

echo ""
echo "${PFX}Skill:        $SLUG  (v$VERSION, $TODAY)"
echo "${PFX}.skill:       $PKG bytes (inner SKILL.md $INNER bytes)"

if [[ "$DRY" == 1 ]]; then
  echo ""
  echo "✅ [dry-run] Built everything in /tmp/skrel — nothing in the repo was touched."
  echo "   Re-run without --dry-run to publish."
  exit 0
fi

# move the packaged .skill into place
cp "/tmp/skrel/$SLUG.skill" "$SKILLDIR/$SLUG.skill"

echo ""
echo "Files written:"
echo "  $SKILLDIR/$SLUG.skill"
echo "  $SKILLDIR/files.json"
echo "  $SKILLDIR/install-guide.html"
echo "  skills.json (+1 entry)"

cd "$SITE_REPO"
git pull --rebase --autostash origin main >/dev/null 2>&1 || echo "⚠ pull skipped (offline or conflict) — resolve before pushing"
git add -A
git commit -m "$SLUG v$VERSION (site) — add skill" >/dev/null
echo "✔ committed"

if [[ "$NO_PUSH" == 1 ]]; then
  echo "(--no-push set — not pushing. Push with: git push origin main)"
else
  GIT_TERMINAL_PROMPT=0 git push origin main
  echo "✔ pushed — Vercel will redeploy in ~30-60s"
fi

echo ""
echo "📝 Heads-up: the install guide is a BASELINE (download → upload → use)."
echo "   For skill-specific setup (an engine to deploy, connectors, file access),"
echo "   edit $SKILLDIR/install-guide.html steps 3-4 and the troubleshooting list."
echo "📝 And add a dated 'Update' entry to the catalog Notion page so the other"
echo "   machine + the team see the new skill."
