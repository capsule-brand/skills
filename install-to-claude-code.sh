#!/usr/bin/env bash
# install-to-claude-code.sh — install/update catalog skills into ~/.claude/skills/
# so a skill published to this catalog is immediately available in Claude Code (terminal).
#
# This closes the loop the site + sync-forge don't: the site distributes .skill files
# to the macOS app, and sync-forge mirrors ~/.claude between machines — but nothing
# unpacked a published catalog skill INTO ~/.claude/skills. Run this on each machine
# after `git pull`, and both machines converge on the catalog as the single source.
#
# Usage:
#   ./install-to-claude-code.sh --all              # install/update every catalog skill
#   ./install-to-claude-code.sh capsule-estimator  # one or more slugs
#   ./install-to-claude-code.sh --all --dry-run     # preview, touch nothing
set -euo pipefail
cd "$(dirname "$0")"
DEST="$HOME/.claude/skills"
DRY=0
SLUGS=()
for a in "$@"; do
  case "$a" in
    --all)     while IFS= read -r d; do SLUGS+=("$(basename "$d")"); done < <(find skills -mindepth 1 -maxdepth 1 -type d) ;;
    --dry-run) DRY=1 ;;
    -*)        echo "unknown flag: $a" >&2; exit 2 ;;
    *)         SLUGS+=("$a") ;;
  esac
done
[ ${#SLUGS[@]} -eq 0 ] && { echo "usage: $0 [--all | <slug> ...] [--dry-run]" >&2; exit 2; }
mkdir -p "$DEST"
for slug in "${SLUGS[@]}"; do
  pkg=$(find "skills/$slug" -maxdepth 1 -name '*.skill' 2>/dev/null | head -1 || true)
  if [ -z "$pkg" ]; then echo "!! $slug: no .skill under skills/$slug — skipping" >&2; continue; fi
  tmp=$(mktemp -d)
  unzip -q -o "$pkg" -d "$tmp"
  # inner root = directory holding the shallowest SKILL.md (packaged root isn't always the slug)
  rel=$(cd "$tmp" && find . -name SKILL.md | awk -F/ '{print NF"\t"$0}' | sort -n | head -1 | cut -f2-)
  if [ -z "$rel" ]; then echo "!! $slug: no SKILL.md inside $pkg — skipping" >&2; rm -rf "$tmp"; continue; fi
  inner=$(dirname "$rel")
  if [ "$DRY" -eq 1 ]; then
    echo "[dry-run] $slug <- $pkg  (files: $(cd "$tmp/$inner" && ls | tr '\n' ' '))"
  else
    rm -rf "$DEST/$slug"; mkdir -p "$DEST/$slug"
    cp -R "$tmp/$inner"/. "$DEST/$slug"/
    echo "OK  $slug -> $DEST/$slug"
  fi
  rm -rf "$tmp"
done
