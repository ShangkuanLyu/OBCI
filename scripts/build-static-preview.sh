#!/bin/bash
# Builds the GitHub-Pages-style static export locally, exactly as the
# workflows do (strip server-only parts → next build with STATIC_EXPORT),
# and stages the result for scripts/pages-preview-server.mjs.
#
# Two modes:
#   scripts/build-static-preview.sh            # production-shaped build (no flags)
#   PREVIEW=1 scripts/build-static-preview.sh  # LOCAL internal review: NEXT_PUBLIC_PREVIEW_DEPLOYMENT=1
#                                              # + NEXT_PUBLIC_DESIGN_FIXTURES=1 (same as OBCI-preview)
#                                              # + NEXT_PUBLIC_INTERNAL_REVIEW=1 (unconfirmed contact
#                                              #   details shown with a "pending" marker; never deployed)
#
# The repo working tree is never modified: sources are rsynced to a scratch
# copy (node_modules hard-linked — Turbopack rejects symlinks). Read-only
# anon credentials come from .env.local; explicit exports override its
# localhost SITE_URL.
set -euo pipefail

REPO="$(cd "$(dirname "$0")/.." && pwd)"
WORK="${WORK:-${TMPDIR:-/tmp}/obai-static-build}"
OUT="${OUT:-${TMPDIR:-/tmp}/obai-preview-site}"
BASE="${NEXT_PUBLIC_BASE_PATH:-/OBCI}"
SITE_URL="${NEXT_PUBLIC_SITE_URL:-https://shangkuanlyu.github.io${BASE}}"

rm -rf "$WORK"
mkdir -p "$WORK"
rsync -a --exclude node_modules --exclude .git --exclude .next --exclude out \
  --exclude "docs/support docs" "$REPO/" "$WORK/"
cp -al "$REPO/node_modules" "$WORK/node_modules"

cd "$WORK"

# CI strip step (verbatim from .github/workflows/deploy-pages.yml)
rm -f src/proxy.ts
rm -rf src/app/api src/app/actions
rm -rf "src/app/[locale]/admin" "src/app/[locale]/(site)/login"
rm -rf src/components/admin src/components/forms/LoginForm.tsx

if [ -f "$REPO/.env.local" ]; then
  set -a; source "$REPO/.env.local"; set +a
fi
rm -f .env.local

export STATIC_EXPORT="1"
export NEXT_PUBLIC_BASE_PATH="$BASE"
export NEXT_PUBLIC_SITE_URL="$SITE_URL"
if [ "${PREVIEW:-0}" = "1" ]; then
  export NEXT_PUBLIC_PREVIEW_DEPLOYMENT="1"
  export NEXT_PUBLIC_DESIGN_FIXTURES="1"
  export NEXT_PUBLIC_INTERNAL_REVIEW="${INTERNAL_REVIEW:-1}"
else
  unset NEXT_PUBLIC_PREVIEW_DEPLOYMENT NEXT_PUBLIC_DESIGN_FIXTURES NEXT_PUBLIC_INTERNAL_REVIEW
fi

npm run build

# Pages extras (mirrors the workflow)
touch out/.nojekyll
cat > out/index.html <<HTML
<!doctype html>
<html lang="zh">
  <head>
    <meta charset="utf-8" />
    <meta http-equiv="refresh" content="0; url=${BASE}/zh/" />
    <link rel="canonical" href="${SITE_URL}/zh/" />
    <title>大洋洲工商协会 OBAI</title>
  </head>
  <body><a href="${BASE}/zh/">进入网站 / Enter site</a></body>
</html>
HTML

# Fail the build on unresolved template variables ({count} …) in titles,
# meta/OG/JSON-LD or visible markup, heading/metadata defects and — in
# preview mode — any enabled form. Same checker as the Pages workflow.
if [ "${PREVIEW:-0}" = "1" ]; then
  node scripts/check-static-output.mjs out --preview
else
  node scripts/check-static-output.mjs out
fi

rm -rf "$OUT"
mv out "$OUT"
echo "static site staged at $OUT (base path $BASE, preview=${PREVIEW:-0})"
