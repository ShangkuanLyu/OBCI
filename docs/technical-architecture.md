# Technical Architecture — OBCI Website

- **Stack:** Next.js 15 (App Router, RSC) · TypeScript · Tailwind CSS v4 · Supabase (Postgres, Auth, Storage) · next-intl · Stripe
- **Supabase project:** `gmglssmdrsackqgkqdbu` → `https://gmglssmdrsackqgkqdbu.supabase.co`
- **Hosting target:** Vercel (or any Node host); no Supabase Edge Functions required initially.

---

## 1. Repository layout

```
/                       ← Next.js app at repo root
├── docs/               ← project documentation (audits, IA, this file)
├── messages/           ← next-intl message catalogues: zh.json, en.json
├── public/             ← static assets (logo, favicons, local placeholder imagery)
├── supabase/
│   └── migrations/     ← SQL mirror of every migration applied via MCP (source of truth = DB history)
└── src/
    ├── app/
    │   ├── [locale]/           ← localized public site + member area
    │   │   ├── (site)/         ← public pages (home, news, events, about, membership, contact…)
    │   │   └── admin/          ← CMS dashboard (role-gated)
    │   └── api/
    │       └── stripe/webhook/ ← Stripe webhook route handler (locale-free)
    ├── components/
    │   ├── ui/                 ← primitives (Button, Container, SectionHeading, Divider…)
    │   ├── layout/             ← Header, Footer, Nav, LocaleSwitcher
    │   └── …feature components
    ├── lib/
    │   ├── supabase/
    │   │   ├── client.ts       ← browser client (publishable key)
    │   │   ├── server.ts       ← RSC/server-action client bound to cookies (@supabase/ssr)
    │   │   └── admin.ts        ← service-role client; imports "server-only"
    │   ├── i18n/               ← next-intl routing + request config
    │   └── utils/
    ├── services/               ← ALL database access lives here (news.ts, events.ts, membership.ts…)
    ├── types/
    │   └── database.types.ts   ← generated from live Supabase schema
    └── middleware.ts           ← next-intl locale negotiation + admin session refresh
```

**Rule: UI never calls `supabase.from(...)` directly.** Components consume typed functions from `src/services/*`; those functions receive/construct the appropriate client. This is the Service Layer required by the brief.

---

## 2. Internationalisation (next-intl)

- Locales: `zh` (default) and `en`. Prefixed routing for both: `/zh/...`, `/en/...`; `/` redirects to the negotiated locale (`as-needed` prefix strategy would hide `zh`; we use explicit prefixes so hreflang and analytics stay unambiguous).
- **UI chrome strings** (nav labels, buttons, form labels, footer) live in `messages/{zh,en}.json`.
- **CMS content** (news, events, leadership, chapters…) is bilingual at the database level via explicit `*_zh` / `*_en` columns (decision recorded in the Supabase audit — two fixed locales, so a translations table is over-engineering). Services select the right column pair and fall back `zh → en` (or vice-versa) when one side is empty.
- `generateMetadata` on every page emits localized titles/descriptions + `alternates.languages` hreflang pairs.

## 3. Data flow & rendering strategy

| Surface | Strategy |
|---|---|
| Public content pages (home, news, events, about…) | RSC, server-side fetch through services, `revalidateTag`-based ISR. Each content domain gets a cache tag (`news`, `events`, `leadership`, `partners`, `settings`). |
| News article / event detail | `generateStaticParams` for recent slugs + on-demand ISR for the rest. |
| Admin dashboard | Fully dynamic (`no-store`), session-gated. |
| Mutations (admin CRUD, membership application, contact form) | **Server Actions** with zod validation → service layer → `revalidateTag`. |

Admin mutations call `revalidateTag(domain)` so public pages refresh immediately after a CMS edit.

## 4. Supabase clients & auth

- `client.ts` — `createBrowserClient` (publishable key). Used only where interactivity requires it (auth UI, admin file upload progress).
- `server.ts` — `createServerClient` bound to Next.js cookies; used by RSC + server actions. Session refresh handled in `middleware.ts`.
- `admin.ts` — service-role key, `import "server-only"`, used exclusively by trusted server code (webhook, admin operations that must bypass RLS such as reading all applications). Every use site performs an explicit app-role check first.

### Roles

App roles: `admin`, `editor`, `membership_manager`, `event_manager`, `member` — stored on `public.profiles.role` (enum), auto-created via `on auth.users insert` trigger (default `member`).

Enforcement is three-layered, per the brief:
1. **RLS policies** referencing a `security definer` helper `public.app_role()` (reads the caller's profile role; stable, safe search_path).
2. **Server-side checks** in server actions/route handlers before any privileged operation.
3. UI gating (menu visibility) — cosmetic only, never the security boundary.

### RLS posture

- Public content tables (`news`, `events`, `leadership`, …): `select` for `anon`/`authenticated` restricted to `status = 'published'`; write access only for the responsible roles.
- Personal tables (`membership_applications`, `payments`, `contact_enquiries`…): owners read their own rows; staff roles per domain; no public access.
- The pre-existing `ensure_rls` event trigger auto-enables RLS on every new table; our migrations still enable it explicitly and always ship policies in the same migration.

## 5. Storage

| Bucket | Visibility | Contents | Constraints |
|---|---|---|---|
| `media` | public | news/event/leadership/partner/site imagery | images only (`image/*`), 10 MB cap, image transformation for responsive sizes |
| `member-documents` | private | membership application documents | pdf/doc/images, 20 MB cap, access via signed URLs created server-side; upload path `applications/{application_id}/…` guarded by storage RLS |

## 6. Stripe (Phase 10)

- Server creates a Checkout Session (`mode: payment`) for the selected membership type; client is redirected — card data never touches our code.
- `POST /api/stripe/webhook` verifies the signature, then (service-role) records `payments`, flips `membership_applications.status → paid`, activates `members`. **Payment status is only ever written server-side from the verified webhook** — never from the client.
- Until credentials exist: `STRIPE_SECRET_KEY` absent → checkout action returns a mocked session and the webhook handler is inert; the Supabase payment/membership architecture is real either way.

## 7. Environment variables

```
NEXT_PUBLIC_SUPABASE_URL=https://gmglssmdrsackqgkqdbu.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=…        # publishable key
SUPABASE_SECRET_KEY=…                  # server-only secret (service role); NOT committed — read by src/lib/supabase/admin.ts
STRIPE_SECRET_KEY=…                    # optional until Phase 10 goes live
STRIPE_WEBHOOK_SECRET=…
NEXT_PUBLIC_SITE_URL=…                 # absolute origin incl. base path; canonical/hreflang/OG/sitemap URLs
```

`.env.local` is git-ignored; `.env.example` documents the contract.

### Build flags per deployment

| Flag | Node / Vercel | GitHub Pages CI (production) | Chamber-review preview |
| --- | --- | --- | --- |
| `STATIC_EXPORT=1` — `output: "export"`, trailing slashes, `basePath` applied; server-only parts stripped by the workflow | unset | `1` | `1` |
| `NEXT_PUBLIC_BASE_PATH` — sub-path of the static export (e.g. `/OBCI`); honoured only when `STATIC_EXPORT=1` | unset | `/OBCI` | set to the preview repo path |
| `NEXT_PUBLIC_SITE_URL` — absolute origin incl. base path | deployment origin | `https://<owner>.github.io/OBCI` | preview origin |
| `NEXT_PUBLIC_PREVIEW_DEPLOYMENT=1` — noindex + `robots` disallow all + empty sitemap, review banner and module review notes, unconfirmed content hidden (`src/lib/preview.ts`, `src/lib/review.ts`) | unset | unset | `1` |
| `NEXT_PUBLIC_DESIGN_FIXTURES=1` — flag-gated design-review fixtures for rows whose migration is not applied (`src/lib/fixtures/`) | unset | unset | `1` |
| `NEXT_PUBLIC_INTERNAL_REVIEW=1` — local internal review only: unconfirmed contact details render with a "pending chamber confirmation" marker (`contactFieldState` in `src/lib/review.ts`) | unset | unset | unset (only `scripts/build-static-preview.sh PREVIEW=1` sets it) |

Either review flag disables every public write path at the HTML level (`submissionsDisabled()`), so a build showing provisional content can never accept real submissions. Production leaves both unset.

## 8. Types

`src/types/database.types.ts` is generated from the live schema (MCP `generate_typescript_types`) after every migration batch. Services are typed `Database['public']['Tables']['news']['Row']` etc. — no hand-written row interfaces, no `any`.

## 9. Migration discipline

1. Design in `supabase/migrations/NNN_name.sql` (mirror file).
2. Apply via MCP `apply_migration` (named, snake_case) — this records it in the project's migration history.
3. Verify (`list_tables`, advisors, test queries).
4. Regenerate types.

Non-destructive first, always: additive DDL; any breaking change goes through analyse → migrate data → verify → clean up.

## 10. Performance / SEO baseline

- `next/image` everywhere (Supabase image transformation as loader for storage-hosted images).
- Font: variable font(s) self-hosted via `next/font` (no layout shift, no external font CDN).
- Per-page metadata, `sitemap.ts`, `robots.ts`, OpenGraph images, JSON-LD (`Organization`, `NewsArticle`, `Event`).
- Animations: CSS/IntersectionObserver opacity+translate reveals only — no animation libraries by default.
