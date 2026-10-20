#!/usr/bin/env bash
# The ONLY way to publish the course site, from either Mac.
#
# What goes live is always a fresh full build of what is committed and pushed
# to GitHub, never whatever happens to be in this machine's _site/ (gitignored,
# so it is machine-local and can be months stale). Then anything on gh-pages
# that the build no longer produces is deleted, because `quarto publish` only
# copies files over and never removes them.
#
#   ./publish.sh --dry-run   build and check everything, publish nothing
#   ./publish.sh             build, check, publish, prune gh-pages
#
# Stops before publishing if: the repo has uncommitted or unpushed changes, it
# is behind GitHub, the render changes any tracked file (e.g. _freeze re-ran a
# model: commit that first), or the build fails a sanity check.
set -euo pipefail
cd "$(dirname "$0")"

DRY=0
[ "${1:-}" = "--dry-run" ] && DRY=1

die() { printf '\nSTOPPED: %s\n' "$*" >&2; exit 1; }
step() { printf '\n== %s\n' "$*"; }

QUARTO="$(command -v quarto || true)"
[ -n "$QUARTO" ] || QUARTO=/Applications/RStudio.app/Contents/Resources/app/quarto/bin/quarto
[ -x "$QUARTO" ] || die "Quarto not found (neither on PATH nor bundled with RStudio)."

# Pushes of re-rendered figures can exceed git's default buffer (Oct 11, 2026).
export GIT_CONFIG_COUNT=1 GIT_CONFIG_KEY_0=http.postBuffer GIT_CONFIG_VALUE_0=524288000

step "1. Repo matches GitHub"
[ "$(git rev-parse --abbrev-ref HEAD)" = main ] || die "Not on main."
git fetch -q origin main gh-pages
[ -z "$(git status --porcelain)" ] || { git status --short; die "Uncommitted or untracked files. Commit (or remove) them, push, then rerun."; }
LOCAL="$(git rev-parse HEAD)"; REMOTE="$(git rev-parse origin/main)"
if [ "$LOCAL" != "$REMOTE" ]; then
  if git merge-base --is-ancestor HEAD origin/main; then die "Behind GitHub. Run: git pull"
  elif git merge-base --is-ancestor origin/main HEAD; then die "Unpushed commits. Run: git push"
  else die "main and origin/main have diverged. Sort that out first."; fi
fi
echo "main = origin/main = $(git rev-parse --short HEAD); Quarto $("$QUARTO" --version)"

step "2. Full render from scratch (about 2 minutes)"
rm -rf _site
"$QUARTO" render

step "3. Render left the repo untouched"
[ -z "$(git status --porcelain)" ] || { git status --short; die "The render changed tracked files (a frozen page re-executed, or stray output). Review, commit, push, then rerun."; }
echo "clean"

step "4. Sanity checks on _site"
[ -f _site/index.html ] || die "_site/index.html missing."
[ ! -e _site/_private ] || die "_private/ is in _site."
[ ! -e _site/.claude ] || die ".claude/ is in _site."
if grep -rlE -- '-key\.(html|qmd|R)|_private/' _site --include='*.html' | head -5 | grep .; then
  die "A page links to an answer key or _private/."
fi
echo "ok"

step "5. Files on gh-pages that this build no longer produces"
STALE="$(mktemp)"; trap 'rm -f "$STALE"' EXIT
comm -23 <(git ls-tree -r --name-only origin/gh-pages | sort) \
         <(cd _site && find . -type f | sed 's|^\./||' | sort) \
  | grep -vxE '\.nojekyll|CNAME' > "$STALE" || true
if [ -s "$STALE" ]; then sed 's/^/  /' "$STALE"; echo "($(wc -l < "$STALE" | tr -d ' ') files)"; else echo "none"; fi

if [ "$DRY" = 1 ]; then
  step "Dry run: nothing published. The build above is what ./publish.sh would ship."
  exit 0
fi

step "6. Publish"
"$QUARTO" publish gh-pages --id crju705-gh-pages --no-prompt --no-browser --no-render

if [ -s "$STALE" ]; then
  step "7. Delete stale files from gh-pages"
  WT="$(mktemp -d)"
  git fetch -q origin gh-pages
  git worktree add -q "$WT" origin/gh-pages
  (cd "$WT" && tr '\n' '\0' < "$STALE" | xargs -0 git rm -q --ignore-unmatch \
     && git commit -q -m "Remove files the site no longer builds" \
     && git push -q origin HEAD:gh-pages)
  git worktree remove --force "$WT"
fi

step "Done. GitHub Pages takes a minute or two to deploy; check the live site after."
