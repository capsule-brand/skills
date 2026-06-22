#!/usr/bin/env bash
# sync-release.sh — release a skill to BOTH Capsule channels from one command,
# keeping the SKILL.md content identical while respecting each channel's own
# version line.
#
#   Marketplace plugin : capsule-brand/CapsulePlugins  (claude plugin track, 0.x line)
#   Cowork .skill site : capsule-brand/skills           (download/upload track, 1.x line)
#
# Canonical content = the marketplace plugin's SKILL.md. Edit that, then run this.
# (For site-only skills with no marketplace plugin, the current .skill's SKILL.md
#  is used as-is and only the version is bumped.)
#
# Usage:
#   ./sync-release.sh <slug> [patch|minor|major] [--update] [--dry-run]
# Examples:
#   ./sync-release.sh ebillity-timesheet patch
#   ./sync-release.sh ebillity-timesheet minor --update
#   ./sync-release.sh ebillity-timesheet --dry-run

set -euo pipefail

SLUG="${1:-}"; BUMP="patch"; DO_UPDATE=0; DRY=0
shift || true
for a in "$@"; do
  case "$a" in
    --update) DO_UPDATE=1 ;;
    --dry-run) DRY=1 ;;
    *) BUMP="$a" ;;
  esac
done

SITE_REPO="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
MKT_REPO="$HOME/.claude/plugins/marketplaces/capsule-plugins"
DESK="$HOME/Desktop/Skills"

if [[ -z "$SLUG" ]]; then
  echo "Usage: ./sync-release.sh <slug> [patch|minor|major] [--update] [--dry-run]"
  echo "Site skills:"
  python3 -c "import json;[print('  -',x['slug'],x['version']) for x in json.load(open('$SITE_REPO/skills.json'))]" 2>/dev/null || true
  exit 1
fi

SKILLDIR="$SITE_REPO/skills/$SLUG"
if [[ ! -f "$SKILLDIR/$SLUG.skill" ]]; then
  echo "✗ No site .skill at $SKILLDIR/$SLUG.skill"; exit 1
fi

PLUGIN_MANIFEST="$MKT_REPO/plugins/$SLUG/.claude-plugin/plugin.json"
HAS_PLUGIN=0; [[ -f "$PLUGIN_MANIFEST" ]] && HAS_PLUGIN=1

# Canonical SKILL.md: marketplace plugin if present, else the current .skill's inner copy.
if [[ "$HAS_PLUGIN" == 1 ]]; then
  CANON="$MKT_REPO/plugins/$SLUG/skills/$SLUG/SKILL.md"
else
  CANON="/tmp/canon_$SLUG.md"
  unzip -p "$SKILLDIR/$SLUG.skill" "*SKILL.md" > "$CANON" 2>/dev/null || { echo "✗ couldn't read SKILL.md from .skill"; exit 1; }
fi
[[ -f "$CANON" ]] || { echo "✗ canonical SKILL.md not found ($CANON)"; exit 1; }

UPD=""; if [[ "$DO_UPDATE" == 1 ]]; then UPD="--update"; fi
PFX=""; if [[ "$DRY" == 1 ]]; then PFX="[dry-run] "; fi

echo "=== 1/2  Marketplace plugin ($SLUG) ==="
if [[ "$HAS_PLUGIN" == 1 ]]; then
  if [[ "$DRY" == 1 ]]; then
    echo "${PFX}would run: $MKT_REPO/release.sh $SLUG $BUMP $UPD"
  else
    "$MKT_REPO/release.sh" "$SLUG" "$BUMP" $UPD
  fi
else
  echo "(no marketplace plugin for $SLUG — site-only skill, skipping plugin channel)"
fi

echo ""
echo "=== 2/2  Cowork .skill site ($SLUG) ==="
cd "$SITE_REPO"
if [[ "$DRY" != 1 ]]; then
  git pull --rebase --autostash origin main || echo "⚠ site pull skipped (offline or conflict) — resolve before continuing"
fi

CURVER="$(python3 -c "import json,sys;print(next((x['version'] for x in json.load(open('skills.json')) if x['slug']==sys.argv[1]),'0.0.0'))" "$SLUG")"
NEWVER="$(python3 - "$CURVER" "$BUMP" <<'PY'
import re,sys
cur,bump=sys.argv[1:3]
if re.match(r'^\d+\.\d+\.\d+$',bump):
    print(bump); raise SystemExit
M,mi,pa=map(int,cur.split('.'))
if bump=='major': M,mi,pa=M+1,0,0
elif bump=='minor': mi,pa=mi+1,0
else: pa=pa+1
print(f"{M}.{mi}.{pa}")
PY
)"
TODAY="$(date +%Y-%m-%d)"
echo "${PFX}site version: $CURVER -> $NEWVER"

# Repackage the .skill from canonical SKILL.md
rm -rf /tmp/skrel && mkdir -p "/tmp/skrel/$SLUG"
cp "$CANON" "/tmp/skrel/$SLUG/SKILL.md"
( cd /tmp/skrel && rm -f "$SLUG.skill" && zip -r -X -q "$SLUG.skill" "$SLUG" )
SHA=$(shasum -a 256 "/tmp/skrel/$SLUG.skill" | awk '{print $1}')
PKG=$(wc -c < "/tmp/skrel/$SLUG.skill"); INNER=$(wc -c < "$CANON")

if [[ "$DRY" == 1 ]]; then
  echo "${PFX}would repackage $SLUG.skill ($PKG bytes, sha ${SHA:0:8}…${SHA: -4}; inner $INNER bytes)"
  echo "${PFX}would update files.json, skills.json ($SLUG -> $NEWVER/$TODAY), install guide, Desktop folder, then commit+push"
else
  cp "/tmp/skrel/$SLUG.skill" "$SKILLDIR/$SLUG.skill"
  python3 - "$CANON" "$SKILLDIR/files.json" <<'PY'
import json,sys
json.dump([{"name":"SKILL.md","lang":"md","content":open(sys.argv[1]).read()}], open(sys.argv[2],"w"))
PY
  python3 - "$SITE_REPO/skills.json" "$SLUG" "$NEWVER" "$TODAY" <<'PY'
import json,sys
p,slug,ver,today=sys.argv[1:5]; d=json.load(open(p))
for x in d:
    if x.get('slug')==slug: x['version']=ver; x['updated']=today
json.dump(d,open(p,'w'),indent=2,ensure_ascii=False); open(p,'a').write('\n')
PY
  if [[ -f "$SKILLDIR/install-guide.html" ]]; then
    sed -i '' -E "s/v[0-9]+\.[0-9]+\.[0-9]+/v$NEWVER/g" "$SKILLDIR/install-guide.html"
  fi
  # Desktop staging: find the folder holding this slug's .skill, refresh + rename
  OLD_DESK="$(find "$DESK" -maxdepth 1 -type d 2>/dev/null | while read -r d; do [[ -f "$d/$SLUG.skill" ]] && echo "$d"; done | head -1)"
  if [[ -n "$OLD_DESK" ]]; then
    BASE="$(basename "$OLD_DESK" | sed -E 's/ [0-9]+\.[0-9]+\.[0-9]+$//')"
    NEW_DESK="$DESK/$BASE $NEWVER"
    cp "$SKILLDIR/$SLUG.skill" "$OLD_DESK/$SLUG.skill"
    [[ -f "$SKILLDIR/install-guide.html" ]] && cp "$SKILLDIR/install-guide.html" "$OLD_DESK/$SLUG-install-guide.html"
    [[ "$OLD_DESK" != "$NEW_DESK" ]] && mv "$OLD_DESK" "$NEW_DESK"
    echo "✔ Desktop staging → $(basename "$NEW_DESK")"
  fi
  git add -A
  git -c user.name="$(git config user.name 2>/dev/null||echo Capsule)" -c user.email="$(git config user.email 2>/dev/null||echo dev@clearancelab.ai)" commit -m "$SLUG v$NEWVER (site) — sync .skill with canonical SKILL.md" >/dev/null
  GIT_TERMINAL_PROMPT=0 git push origin HEAD
  echo "✔ site pushed: $SLUG v$NEWVER"
fi

echo ""
echo "✅ ${PFX}Done."
echo "   Site .skill: v$NEWVER  ($PKG bytes, sha256 ${SHA:0:8}…${SHA: -4}; inner $INNER bytes)"
echo "   📋 Notion (manual): update the $SLUG catalog page — version v$NEWVER, the sha/sizes above, and a changelog line."
