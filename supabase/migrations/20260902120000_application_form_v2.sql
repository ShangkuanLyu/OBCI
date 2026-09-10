-- 007 · Application form v2, chapter template columns, industry tags on events
-- STATUS: applied to the remote project on 2026-09-10 (launch), as
-- migration application_form_v2.
-- NOTE: the remote project also carries six 20260827* migrations
-- (company_address/fax/mobile/company_intro/directory_consent/
-- agreed_terms/agreed_marketing etc.) that are still not mirrored in this
-- folder, so this chain cannot be replayed on an empty database as is —
-- run `supabase db pull` before recreating the project elsewhere.
--
-- Additive only:
--  * membership_applications gains the remaining DOCX/brief fields:
--    first/last name split, per-language company introductions, the three
--    separately recorded consents (constitution, terms, privacy), the
--    consent timestamp and the policy-version stamp. Existing columns and
--    rows are untouched (company_intro keeps receiving a merged copy).
--  * industry_chapters gains the two chapter-template blocks that had no
--    data model: expert advisers and certification information
--    (resources_* = local agents / channels, services_* = ABS industry
--    services), plus deputy_secretary_general (the 2026 committee roster
--    lists an Executive Deputy Secretary-General for the Construction
--    Committee).
--  * leadership.group_key CHECK is widened to accept the 2026 public
--    groups 'executive' and 'honorary' (the five original values stay
--    valid; no row is rewritten here — 20260902121000 §7 regroups them).
--  * events gains a tags text[] column (chapter association mechanism,
--    mirroring news.tags) + GIN indexes for tag lookups.
--  * submit_membership_application_v2 writes the full field set and
--    enforces the legal gate server-side. It also records the applicant's
--    chosen payment method (p_payment_method → the existing remote column
--    membership_applications.payment_method; no online payment exists —
--    owner decision D7, 2026-09-10) and requires the company address and
--    company telephone (brochure application form). The v1 RPC is kept
--    unchanged for backwards compatibility; revoke its anon grant once the
--    v2 form is live (see docs/preview-to-production-matrix.md §5).

alter table public.membership_applications
  add column if not exists first_name text,
  add column if not exists last_name text,
  add column if not exists company_intro_zh text,
  add column if not exists company_intro_en text,
  add column if not exists agreed_constitution boolean not null default false,
  add column if not exists agreed_privacy boolean not null default false,
  add column if not exists consent_at timestamptz,
  add column if not exists policy_version text;

comment on column public.membership_applications.agreed_constitution is
  'Applicant agreed to the association constitution (required; recorded separately from terms/privacy).';
comment on column public.membership_applications.agreed_privacy is
  'Applicant accepted the privacy policy (required; recorded separately from agreed_terms).';
comment on column public.membership_applications.consent_at is
  'Server timestamp at which the consents were recorded.';
comment on column public.membership_applications.policy_version is
  'Versions of the legal texts consented to, e.g. constitution=2026-10;terms=2026-10;privacy=2026-10 (verified against site_settings.legal).';
comment on column public.membership_applications.company_intro is
  'Legacy merged introduction (zh, else en) kept for existing admin views; see company_intro_zh / company_intro_en.';

alter table public.industry_chapters
  add column if not exists experts_zh text[] not null default '{}',
  add column if not exists experts_en text[] not null default '{}',
  add column if not exists certifications_zh text[] not null default '{}',
  add column if not exists certifications_en text[] not null default '{}',
  add column if not exists deputy_secretary_general text;

comment on column public.industry_chapters.resources_zh is
  'Australian local agents / channel resources (one item per element).';
comment on column public.industry_chapters.experts_zh is
  'Expert advisers of the chapter (one item per element).';
comment on column public.industry_chapters.certifications_zh is
  'Relevant Australian certifications, e.g. TGA, AS/NZS (one item per element).';
comment on column public.industry_chapters.deputy_secretary_general is
  'Executive Deputy Secretary-General of the committee (常务副秘书长), stored like secretary_general as "Latin 中文".';

-- Leadership display groups: the 2026 roster publishes three public groups
-- (executive / honorary / secretariat). The original five keys remain valid
-- so no existing row can violate the constraint; the data migration that
-- follows moves rows between groups.
alter table public.leadership
  drop constraint if exists leadership_group_key_check;
alter table public.leadership
  add constraint leadership_group_key_check check (
    group_key in (
      'president', 'honorary_chairman', 'vice_chair', 'advisor', 'secretariat',
      'executive', 'honorary'
    )
  );

alter table public.events
  add column if not exists tags text[] not null default '{}';

create index if not exists events_tags_gin_idx on public.events using gin (tags);
create index if not exists news_tags_gin_idx on public.news using gin (tags);

-- Full-field application submission. Validation mirrors the client 1:1
-- (src/lib/apply/intro-limits.ts, src/lib/review.ts):
--  * the published policies must be approved: site_settings.legal carries
--    terms_version and privacy_version, and the caller's p_policy_version
--    must equal the server-computed stamp "terms=…;privacy=…" (so it cannot
--    be forged or omitted). The constitution is issued by the secretariat on
--    request and has no published version; the undertaking to be bound by it
--    is still recorded per application;
--  * membership type must exist and be active;
--  * constitution, terms AND privacy consent are each mandatory and each
--    stored as the value received (never a literal);
--  * at least one company introduction is required;
--  * Chinese introduction: at most 500 characters;
--  * English introduction: at most 500 whitespace-separated words and at
--    most 4000 characters;
--  * both introductions are trimmed of ASCII and ideographic whitespace
--    with the same character class the client uses;
--  * company address and company telephone are required (brochure form);
--  * p_payment_method must be one of bank_transfer | cheque | credit_card
--    (src/lib/utils/payment-methods.mjs) and is stored verbatim in the
--    existing payment_method column — it records the applicant's intent
--    only; the fee is paid manually (EFT / cheque / card via the
--    secretariat) after approval.
create or replace function public.submit_membership_application_v2(
  p_membership_type_code text,
  p_first_name text,
  p_last_name text,
  p_email text,
  p_mobile text default null,
  p_company_name text default null,
  p_company_address text default null,
  p_company_phone text default null,
  p_fax text default null,
  p_position text default null,
  p_company_intro_zh text default null,
  p_company_intro_en text default null,
  p_directory_consent boolean default false,
  p_agreed_constitution boolean default false,
  p_agreed_terms boolean default false,
  p_agreed_privacy boolean default false,
  p_agreed_marketing boolean default false,
  p_policy_version text default null,
  p_locale text default 'zh',
  p_payment_method text default null
) returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_type_id bigint;
  v_id bigint;
  v_token uuid;
  v_legal jsonb;
  v_expected text;
  -- Same trim/split class as the client: ASCII whitespace + U+3000.
  v_edge text := '^[\s　]+|[\s　]+$';
  v_intro_zh text := nullif(regexp_replace(coalesce(p_company_intro_zh, ''), '^[\s　]+|[\s　]+$', '', 'g'), '');
  v_intro_en text := nullif(regexp_replace(coalesce(p_company_intro_en, ''), '^[\s　]+|[\s　]+$', '', 'g'), '');
  v_first text := btrim(coalesce(p_first_name, ''));
  v_last text := btrim(coalesce(p_last_name, ''));
  v_address text := nullif(btrim(coalesce(p_company_address, '')), '');
  v_phone text := nullif(btrim(coalesce(p_company_phone, '')), '');
begin
  -- Legal gate: the two policies the website itself publishes must carry a
  -- version stamp before an application can be accepted. The constitution is
  -- the association's own governing document, issued by the secretariat on
  -- request, so it has no published version; the applicant's undertaking to
  -- be bound by it is still recorded (p_agreed_constitution below), exactly
  -- as on the paper application form.
  select value into v_legal from public.site_settings where key = 'legal';
  if v_legal is null
     or coalesce(btrim(v_legal->>'terms_version'), '') = ''
     or coalesce(btrim(v_legal->>'privacy_version'), '') = '' then
    raise exception 'legal texts not approved';
  end if;
  v_expected := 'terms=' || btrim(v_legal->>'terms_version')
             || ';privacy=' || btrim(v_legal->>'privacy_version');
  if nullif(btrim(coalesce(p_policy_version, '')), '') is distinct from v_expected then
    raise exception 'policy version mismatch';
  end if;

  select id into v_type_id
  from public.membership_types
  where code = p_membership_type_code and is_active;
  if v_type_id is null then
    raise exception 'invalid membership type';
  end if;

  if v_first = '' or v_last = '' then
    raise exception 'name required';
  end if;
  if v_address is null then
    raise exception 'company address required';
  end if;
  if v_phone is null then
    raise exception 'company phone required';
  end if;
  if p_payment_method is null
     or p_payment_method not in ('bank_transfer', 'cheque', 'credit_card') then
    raise exception 'invalid payment method';
  end if;

  if coalesce(p_agreed_constitution, false) is not true then
    raise exception 'constitution not accepted';
  end if;
  if coalesce(p_agreed_terms, false) is not true then
    raise exception 'terms not accepted';
  end if;
  if coalesce(p_agreed_privacy, false) is not true then
    raise exception 'privacy not accepted';
  end if;

  if v_intro_zh is null and v_intro_en is null then
    raise exception 'company intro required';
  end if;
  if v_intro_zh is not null and char_length(v_intro_zh) > 500 then
    raise exception 'company intro zh too long';
  end if;
  if v_intro_en is not null then
    if char_length(v_intro_en) > 4000 then
      raise exception 'company intro en too long';
    end if;
    if coalesce(array_length(regexp_split_to_array(v_intro_en, '[\s　]+'), 1), 0) > 500 then
      raise exception 'company intro en too long';
    end if;
  end if;
  perform v_edge; -- keeps the documented class next to its two uses

  insert into public.membership_applications (
    membership_type_id, applicant_user_id, applicant_name,
    first_name, last_name, email, mobile, phone,
    organisation_name, company_address, fax, "position",
    company_intro, company_intro_zh, company_intro_en,
    directory_consent, agreed_constitution, agreed_terms, agreed_privacy, agreed_marketing,
    consent_at, policy_version, locale, payment_method
  ) values (
    v_type_id,
    (select auth.uid()),
    v_first || ' ' || v_last,
    v_first,
    v_last,
    lower(btrim(p_email)),
    nullif(btrim(coalesce(p_mobile, '')), ''),
    v_phone,
    nullif(btrim(coalesce(p_company_name, '')), ''),
    v_address,
    nullif(btrim(coalesce(p_fax, '')), ''),
    nullif(btrim(coalesce(p_position, '')), ''),
    coalesce(v_intro_zh, v_intro_en),
    v_intro_zh,
    v_intro_en,
    coalesce(p_directory_consent, false),
    coalesce(p_agreed_constitution, false),
    coalesce(p_agreed_terms, false),
    coalesce(p_agreed_privacy, false),
    coalesce(p_agreed_marketing, false),
    now(),
    v_expected,
    case when p_locale in ('zh', 'en') then p_locale else 'zh' end,
    p_payment_method
  )
  returning id, access_token into v_id, v_token;

  return jsonb_build_object('application_id', v_id, 'access_token', v_token);
end;
$$;

revoke execute on function public.submit_membership_application_v2(
  text, text, text, text, text, text, text, text, text, text, text, text,
  boolean, boolean, boolean, boolean, boolean, text, text, text
) from public;
grant execute on function public.submit_membership_application_v2(
  text, text, text, text, text, text, text, text, text, text, text, text,
  boolean, boolean, boolean, boolean, boolean, text, text, text
) to anon, authenticated, service_role;
