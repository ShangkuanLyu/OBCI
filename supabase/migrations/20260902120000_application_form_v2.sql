-- 007 · Application form v2 + industry tags on events
-- STATUS: authored locally on 2026-09-02; NOT yet applied to the remote
-- project. Apply only after explicit approval, then regenerate types.
--
-- Additive only:
--  * membership_applications gains the remaining DOCX/brief fields
--    (first/last name split, constitution consent placeholder, consent
--    timestamp, policy version). Existing columns and rows untouched.
--  * events gains a tags text[] column (chapter association mechanism,
--    mirroring news.tags) + GIN indexes for tag lookups.
--  * submit_membership_application_v2 writes the full field set. The v1
--    RPC is kept unchanged for backwards compatibility.

alter table public.membership_applications
  add column if not exists first_name text,
  add column if not exists last_name text,
  add column if not exists constitution_agreed boolean not null default false,
  add column if not exists consent_at timestamptz,
  add column if not exists policy_version text;

comment on column public.membership_applications.constitution_agreed is
  'Reserved: the constitution checkbox ships only once the chamber supplies the constitution text.';

alter table public.events
  add column if not exists tags text[] not null default '{}';

create index if not exists events_tags_gin_idx on public.events using gin (tags);
create index if not exists news_tags_gin_idx on public.news using gin (tags);

-- Full-field application submission. Validation mirrors the client 1:1:
--  * membership type must exist and be active;
--  * terms/privacy acceptance is mandatory;
--  * company intro: text containing CJK ideographs (一-鿿) is limited to
--    500 characters, otherwise to 500 words; 4000 chars is a hard cap.
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
  p_company_intro text default null,
  p_directory_consent boolean default false,
  p_agreed_terms boolean default false,
  p_agreed_marketing boolean default false,
  p_policy_version text default null,
  p_locale text default 'zh'
) returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_type_id bigint;
  v_id bigint;
  v_token uuid;
  v_intro text := nullif(btrim(coalesce(p_company_intro, '')), '');
  v_first text := btrim(coalesce(p_first_name, ''));
  v_last text := btrim(coalesce(p_last_name, ''));
begin
  select id into v_type_id
  from public.membership_types
  where code = p_membership_type_code and is_active;
  if v_type_id is null then
    raise exception 'invalid membership type';
  end if;

  if v_first = '' or v_last = '' then
    raise exception 'name required';
  end if;

  if coalesce(p_agreed_terms, false) is not true then
    raise exception 'terms not accepted';
  end if;

  if v_intro is not null then
    if char_length(v_intro) > 4000 then
      raise exception 'company intro too long';
    end if;
    if v_intro ~ '[一-鿿]' then
      if char_length(v_intro) > 500 then
        raise exception 'company intro too long';
      end if;
    elsif coalesce(array_length(regexp_split_to_array(v_intro, '\s+'), 1), 0) > 500 then
      raise exception 'company intro too long';
    end if;
  end if;

  insert into public.membership_applications (
    membership_type_id, applicant_user_id, applicant_name,
    first_name, last_name, email, mobile, phone,
    organisation_name, company_address, fax, "position",
    company_intro, directory_consent, agreed_terms, agreed_marketing,
    consent_at, policy_version, locale
  ) values (
    v_type_id,
    (select auth.uid()),
    v_first || ' ' || v_last,
    v_first,
    v_last,
    lower(btrim(p_email)),
    nullif(btrim(coalesce(p_mobile, '')), ''),
    nullif(btrim(coalesce(p_company_phone, '')), ''),
    nullif(btrim(coalesce(p_company_name, '')), ''),
    nullif(btrim(coalesce(p_company_address, '')), ''),
    nullif(btrim(coalesce(p_fax, '')), ''),
    nullif(btrim(coalesce(p_position, '')), ''),
    v_intro,
    coalesce(p_directory_consent, false),
    true,
    coalesce(p_agreed_marketing, false),
    now(),
    nullif(btrim(coalesce(p_policy_version, '')), ''),
    case when p_locale in ('zh', 'en') then p_locale else 'zh' end
  )
  returning id, access_token into v_id, v_token;

  return jsonb_build_object('application_id', v_id, 'access_token', v_token);
end;
$$;

revoke execute on function public.submit_membership_application_v2(
  text, text, text, text, text, text, text, text, text, text, text,
  boolean, boolean, boolean, text, text
) from public;
grant execute on function public.submit_membership_application_v2(
  text, text, text, text, text, text, text, text, text, text, text,
  boolean, boolean, boolean, text, text
) to anon, authenticated, service_role;
