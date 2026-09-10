#!/bin/bash
# Builds the GitHub-Pages static export locally, exactly as the deploy
# workflow does (strip server-only parts → next build with STATIC_EXPORT →
# static-output check), and stages the result for scripts/pages-preview-server.mjs
# so the production-shaped site can be browsed at http://localhost:4173/OBCI/.
#
#   scripts/build-static.sh
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

# CI strip step (verbatim from .github/workflows/deploy-pages.yml): the admin
# CMS, auth and the Stripe webhook need a Node host and cannot be exported.
# public/news-media and public/portraits are site assets and stay.
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
    <title>大洋洲工商业委员会 OBCI</title>
  </head>
  <body><a href="${BASE}/zh/">进入网站 / Enter site</a></body>
</html>
HTML

# Fail the build on unresolved template variables ({count} …) in titles,
# meta/OG/JSON-LD or visible markup, and on heading/metadata/robots defects.
# Same checker as the Pages workflow.
node scripts/check-static-output.mjs out

rm -rf "$OUT"
mv out "$OUT"
echo "static site staged at $OUT (base path $BASE)"
