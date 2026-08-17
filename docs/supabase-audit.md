# Supabase Audit — OBCI Project

- **Audit date:** 2026-08-17
- **Project ref:** `gmglssmdrsackqgkqdbu`
- **API URL:** `https://gmglssmdrsackqgkqdbu.supabase.co`
- **Verdict:** the project is a **clean greenfield**. There is no application schema, no data, no users and no storage. We can design the OBCI schema from scratch without any migration-compatibility constraints.

---

## 1. Database

### 1.1 `public` schema

| Object type | Count | Notes |
|---|---|---|
| Tables | 0 | — |
| Views | 0 | — |
| Functions | 1 | `rls_auto_enable()` — see §1.3 |
| Triggers | 0 | — |
| RLS policies | 0 | — |
| Custom enum types | 0 | — |

### 1.2 `auth` / `storage` schemas

Standard Supabase-managed schemas only (GoTrue v-latest with OAuth/WebAuthn tables, storage with analytics/vector bucket support). Nothing customised.

- `auth.users`: **0 rows** — no existing users to preserve.
- `auth.schema_migrations`: 77 internal auth migrations (Supabase-managed, not ours).
- `storage.objects` / `storage.buckets`: **0 rows / 0 buckets**.

### 1.3 Pre-existing custom object: `ensure_rls` event trigger

The only non-default object in the database:

- **Function:** `public.rls_auto_enable()` (`SECURITY DEFINER`, `search_path = pg_catalog`)
- **Event trigger:** `ensure_rls` on `ddl_command_end`
- **Behaviour:** whenever a table is created in `public`, RLS is automatically enabled on it.

**Assessment:** benign and actually useful — it guarantees no table we create ships without RLS. Two security-advisor warnings exist because `anon` and `authenticated` hold `EXECUTE` on it (event-trigger functions cannot actually be invoked via RPC, so exploitability is nil, but we will revoke `EXECUTE` in our first migration as hygiene).

### 1.4 Migrations

`supabase_migrations` history: **empty**. No migrations have ever been applied. Our migrations will start the history.

### 1.5 Extensions

Installed (all defaults): `plpgsql`, `pgcrypto`, `uuid-ossp`, `pg_stat_statements`, `supabase_vault`.
Available if needed later: `pg_trgm` (search), `unaccent`, `citext`, `pg_cron`, `pgmq`, `vector`, `pgroonga` (CJK full-text search — relevant for Chinese content search later).

---

## 2. Auth configuration

- **Users:** 0. **Identities/sessions:** 0. No SSO/SAML providers configured.
- Default email/password auth is available; no custom OAuth providers registered.
- Advisor (performance, INFO): auth server uses an absolute cap of 10 DB connections — switch to percentage-based allocation before production scale-up.
- Roles present are the Supabase defaults only (`anon`, `authenticated`, `service_role`, etc.). No custom Postgres roles.

**Implication for us:** application roles (admin / editor / membership_manager / event_manager / member) will be modelled in our own `profiles` table + helper functions and enforced through RLS, not through bespoke Postgres roles.

---

## 3. Storage

- **Buckets:** none exist yet.
- **Global config:** 50 MB file-size limit, image transformation **enabled**, S3 protocol enabled.
- Buckets to be created by us (Phase 7): `media` (public — news/events/leadership/partners imagery) and `member-documents` (private — membership application documents, signed-URL access only).

---

## 4. Edge Functions

None deployed. We will use Next.js server actions / route handlers for server-side logic (incl. the future Stripe webhook), so Edge Functions are not required initially.

---

## 5. Security advisors (current state)

| Level | Finding | Action |
|---|---|---|
| WARN ×2 | `public.rls_auto_enable()` executable by `anon`/`authenticated` (SECURITY DEFINER) | Revoke `EXECUTE` from `anon`, `authenticated` in first migration |
| INFO | Auth DB connections use absolute (10) not percentage allocation | Revisit before production launch |

No other findings. Re-run advisors after every DDL phase.

---

## 6. Constraints & decisions flowing from this audit

1. **Greenfield:** no destructive-migration risk exists today; nevertheless all changes go through named migrations (`apply_migration`) so history stays reproducible.
2. **RLS-by-default is enforced automatically** by the `ensure_rls` event trigger — every new table still gets explicit policies written for it (the trigger enables RLS but grants nothing, so an unpoliced table is simply inaccessible, which is the safe default).
3. **Bilingual content model** (zh/en) to be decided in the schema design — with only two fixed locales, explicit `*_zh` / `*_en` columns are the pragmatic choice over a translations table (per the "don't over-engineer" directive).
4. **TypeScript types** will be generated from the live schema (`database.types.ts`) once tables exist.
