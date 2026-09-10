# OBCI — Oceania Business Council website

Bilingual (中文 / English) website of the **Oceania Business Council 大洋洲工商业委员会 (OBCI)**: news, events, the nine professional committees, leadership and council roster, membership tiers and online application, plus a role-gated admin CMS that the secretariat uses to maintain everything.

## Stack

- **Next.js 16** (App Router, React Server Components) · TypeScript · **Tailwind CSS v4**
- **next-intl** — `zh` (default) and `en`, both prefixed (`/zh/…`, `/en/…`)
- **Supabase** — Postgres (content + membership), Auth (admin sign-in), Storage (`media`, `member-documents`); RLS is the security boundary
- **Stripe** — membership checkout + webhook (inert until keys are set)
- Hosted on **Vercel** (project `obci-website`) as a full Next.js app, so the admin CMS and auth work and content edits reach the site through ISR. A stripped static export for GitHub Pages is kept as a standby (`npm run build:static`)

## Running it

```bash
npm install
cp .env.example .env.local     # fill in the Supabase URL + publishable key
npm run dev                    # http://localhost:3000 (redirects to /zh)
```

| Command | What it does |
|---|---|
| `npm run dev` | dev server, including the admin CMS at `/zh/admin` |
| `npm run lint` | ESLint |
| `npm run typecheck` | `tsc --noEmit` |
| `npm test` | Node test runner (`tests/**/*.test.mjs`) |
| `npm run build` | Next build (set `STATIC_EXPORT=1` for the export shape) |
| `npm run build:static` | local production-shape static build (`scripts/build-static.sh`) |
| `npm run check:static` | static-output checker over `out/` (see below) |

## Static build

`bash scripts/build-static.sh` reproduces the GitHub Pages build locally: it copies the tree to a scratch directory, applies the same strip step as CI (removes `src/app/api`, `src/app/actions`, the admin routes, the login page and `src/proxy.ts`), builds with `STATIC_EXPORT=1` and `NEXT_PUBLIC_BASE_PATH=/OBCI`, runs `scripts/check-static-output.mjs`, and stages the result. Browse it with:

```bash
npm run build:static                       # = bash scripts/build-static.sh
node scripts/pages-preview-server.mjs      # http://localhost:4173/OBCI/
```

`scripts/check-static-output.mjs` fails the build on unresolved template variables (`{count}` …) in titles, meta/OG/JSON-LD or visible markup, broken heading structure, missing canonical/hreflang/OG/Twitter/JSON-LD, unexpected `noindex`, past events still marked `EventScheduled`, and forbidden placeholder copy. The same check gates the deploy.

## Deployment

Production is **Vercel** (project `obci-website`): pushing to `main` builds and promotes automatically. Public pages are prerendered and revalidate every five minutes, so CMS edits appear without a deploy; the admin CMS, sign-in, server actions and the Stripe webhook run as functions. Required project environment variables are `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`; set `NEXT_PUBLIC_SITE_URL` once a custom domain is attached (until then the code falls back to `VERCEL_PROJECT_PRODUCTION_URL`, so canonical URLs, the sitemap and share images stay correct). Never set `STATIC_EXPORT` or `NEXT_PUBLIC_BASE_PATH` there.

`.github/workflows/deploy-pages.yml` is the standby static export for GitHub Pages. It runs only when started by hand from the Actions tab: two automatically published copies drift apart, and that build has no CMS or auth.

## Where content is edited

The **database is the single source of truth**. Everything public — news, events, committees, leadership, partners, membership tiers, and the `site_settings` blocks (brand, contact, vision/mission/values, banners, council roster, secretariat, bank details, legal version stamps) — is edited in the admin CMS. Repository files hold only the launch seed (`content/news/*.md` → `supabase/migrations/20260910120000_*.sql`), the legal page bodies, and static assets:

- article photographs — `public/news-media/<slug>/`, referenced with a leading slash (`/news-media/…`)
- leadership portraits — `public/portraits/<slug>.jpg`
- images uploaded later through the CMS live in the Supabase `media` bucket

## Docs

| File | Contents |
|---|---|
| `docs/preview-to-production-matrix.md` | **Launch record** — what shipped in September 2026, the four migrations, where each kind of content is now edited, image conventions, open items |
| `docs/news-sources.md` | Per-article provenance of the launch news pack |
| `docs/technical-architecture.md` | Architecture, service layer, RLS/roles, storage, build flags |
| `docs/information-architecture.md` | Site map and page inventory |
| `docs/design-system.md` | Design language, tokens, components |
| `docs/site-audit.md`, `docs/supabase-audit.md` | Baseline audits of the old site and the database |
