-- Applied to project gmglssmdrsackqgkqdbu via MCP apply_migration; mirror copy.
-- 003 · Membership domain: organisations, types, applications, documents,
-- members, chapter membership, payments, invoices + application RPCs.

create table public.organisations (
  id bigint generated always as identity primary key,
  name text not null check (length(name) between 1 and 300),
  name_local text,
  abn text,
  industry text,
  website text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger set_updated_at before update on public.organisations
  for each row execute function extensions.moddatetime(updated_at);

create table public.membership_types (
  id bigint generated always as identity primary key,
  code text not null unique check (code ~ '^[a-z0-9-]+$'),
  name_zh text not null,
  name_en text not null,
  description_zh text,
  description_en text,
  benefits_zh text[] not null default '{}',
  benefits_en text[] not null default '{}',
  price_annual numeric(10,2) check (price_annual >= 0),
  currency text not null default 'AUD' check (length(currency) = 3),
  stripe_price_id text,
  display_order int not null default 0,
  is_active boolean not null default true
);

create table public.membership_applications (
  id bigint generated always as identity primary key,
  access_token uuid not null default gen_random_uuid(),
  applicant_user_id uuid references auth.users(id) on delete set null,
  membership_type_id bigint not null references public.membership_types(id) on delete restrict,
  organisation_id bigint references public.organisations(id) on delete set null,
  status public.application_status not null default 'submitted',
  applicant_name text not null check (length(applicant_name) between 1 and 200),
  email text not null check (email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  phone text,
  organisation_name text,
  position text,
  message text,
  locale text not null default 'zh' check (locale in ('zh','en')),
  reviewed_by uuid references public.profiles(id) on delete set null,
  reviewed_at timestamptz,
  review_note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index membership_applications_status_idx on public.membership_applications (status, created_at desc);
create index membership_applications_user_idx on public.membership_applications (applicant_user_id);
create index membership_applications_type_idx on public.membership_applications (membership_type_id);
create index membership_applications_org_idx on public.membership_applications (organisation_id);
create index membership_applications_reviewed_by_idx on public.membership_applications (reviewed_by);
create trigger set_updated_at before update on public.membership_applications
  for each row execute function extensions.moddatetime(updated_at);

create table public.membership_documents (
  id bigint generated always as identity primary key,
  application_id bigint not null references public.membership_applications(id) on delete cascade,
  storage_path text not null unique,
  file_name text not null,
  mime_type text not null,
  size_bytes bigint not null check (size_bytes between 1 and 20971520),
  uploaded_at timestamptz not null default now()
);
create index membership_documents_application_idx on public.membership_documents (application_id);

create table public.members (
  id bigint generated always as identity primary key,
  user_id uuid unique references auth.users(id) on delete set null,
  application_id bigint references public.membership_applications(id) on delete set null,
  organisation_id bigint references public.organisations(id) on delete set null,
  membership_type_id bigint not null references public.membership_types(id) on delete restrict,
  member_no text unique,
  status public.member_status not null default 'active',
  joined_at date not null default current_date,
  expires_at date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index members_application_idx on public.members (application_id);
create index members_org_idx on public.members (organisation_id);
create index members_type_idx on public.members (membership_type_id);
create trigger set_updated_at before update on public.members
  for each row execute function extensions.moddatetime(updated_at);

create table public.industry_chapter_members (
  chapter_id bigint not null references public.industry_chapters(id) on delete cascade,
  member_id bigint not null references public.members(id) on delete cascade,
  role_title text,
  joined_at date not null default current_date,
  primary key (chapter_id, member_id)
);
create index industry_chapter_members_member_idx on public.industry_chapter_members (member_id);

create table public.payments (
  id bigint generated always as identity primary key,
  application_id bigint references public.membership_applications(id) on delete set null,
  member_id bigint references public.members(id) on delete set null,
  amount numeric(10,2) not null check (amount >= 0),
  currency text not null default 'AUD' check (length(currency) = 3),
  status public.payment_status not null default 'pending',
  method text,
  stripe_checkout_session_id text unique,
  stripe_payment_intent_id text unique,
  description text,
  paid_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index payments_application_idx on public.payments (application_id);
create index payments_member_idx on public.payments (member_id);
create index payments_status_idx on public.payments (status, created_at desc);
create trigger set_updated_at before update on public.payments
  for each row execute function extensions.moddatetime(updated_at);

create table public.invoices (
  id bigint generated always as identity primary key,
  payment_id bigint not null references public.payments(id) on delete restrict,
  invoice_no text not null unique,
  amount numeric(10,2) not null check (amount >= 0),
  currency text not null default 'AUD' check (length(currency) = 3),
  issued_at timestamptz not null default now(),
  pdf_path text,
  metadata jsonb not null default '{}'
);
create index invoices_payment_idx on public.invoices (payment_id);

-- ------------------------------------------------------------------ RLS
alter table public.organisations enable row level security;
alter table public.membership_types enable row level security;
alter table public.membership_applications enable row level security;
alter table public.membership_documents enable row level security;
alter table public.members enable row level security;
alter table public.industry_chapter_members enable row level security;
alter table public.payments enable row level security;
alter table public.invoices enable row level security;

create policy "organisations_staff" on public.organisations
  for all to authenticated
  using ((select private.role_in(array['admin','membership_manager'])))
  with check ((select private.role_in(array['admin','membership_manager'])));
create policy "organisations_member_read_own" on public.organisations
  for select to authenticated
  using (exists (
    select 1 from public.members m
    where m.organisation_id = organisations.id
      and m.user_id = (select auth.uid())
  ));

create policy "membership_types_read" on public.membership_types
  for select to anon, authenticated
  using (is_active or (select private.role_in(array['admin','membership_manager'])));
create policy "membership_types_manage" on public.membership_types
  for all to authenticated
  using ((select private.role_in(array['admin','membership_manager'])))
  with check ((select private.role_in(array['admin','membership_manager'])));

-- Applications are created only through the submit RPC (security definer).
create policy "applications_select_own" on public.membership_applications
  for select to authenticated
  using (applicant_user_id = (select auth.uid()));
create policy "applications_staff" on public.membership_applications
  for all to authenticated
  using ((select private.role_in(array['admin','membership_manager'])))
  with check ((select private.role_in(array['admin','membership_manager'])));

-- Documents: attached only through the attach RPC; staff read/manage.
create policy "membership_documents_staff" on public.membership_documents
  for all to authenticated
  using ((select private.role_in(array['admin','membership_manager'])))
  with check ((select private.role_in(array['admin','membership_manager'])));

create policy "members_select_own" on public.members
  for select to authenticated
  using (user_id = (select auth.uid()));
create policy "members_staff" on public.members
  for all to authenticated
  using ((select private.role_in(array['admin','membership_manager'])))
  with check ((select private.role_in(array['admin','membership_manager'])));

create policy "chapter_members_read" on public.industry_chapter_members
  for select to authenticated
  using (
    (select private.role_in(array['admin','membership_manager','editor']))
    or exists (
      select 1 from public.members m
      where m.id = industry_chapter_members.member_id
        and m.user_id = (select auth.uid())
    )
  );
create policy "chapter_members_staff" on public.industry_chapter_members
  for all to authenticated
  using ((select private.role_in(array['admin','membership_manager'])))
  with check ((select private.role_in(array['admin','membership_manager'])));

-- Payments/invoices: staff read; writes happen server-side only
-- (service role from the verified Stripe webhook), never from clients.
create policy "payments_staff_read" on public.payments
  for select to authenticated
  using ((select private.role_in(array['admin','membership_manager'])));
create policy "invoices_staff_read" on public.invoices
  for select to authenticated
  using ((select private.role_in(array['admin','membership_manager'])));

-- ----------------------------------------------------------------- RPCs
-- Single public entry point for submitting a membership application.
create or replace function public.submit_membership_application(
  p_membership_type_code text,
  p_applicant_name text,
  p_email text,
  p_phone text default null,
  p_organisation_name text default null,
  p_position text default null,
  p_message text default null,
  p_locale text default 'zh'
) returns jsonb
language plpgsql security definer set search_path = ''
as $$
declare
  v_type_id bigint;
  v_id bigint;
  v_token uuid;
begin
  select id into v_type_id
  from public.membership_types
  where code = p_membership_type_code and is_active;

  if v_type_id is null then
    raise exception 'invalid membership type';
  end if;

  insert into public.membership_applications
    (membership_type_id, applicant_user_id, applicant_name, email, phone,
     organisation_name, position, message, locale)
  values
    (v_type_id, (select auth.uid()), trim(p_applicant_name), lower(trim(p_email)),
     nullif(trim(coalesce(p_phone,'')),''), nullif(trim(coalesce(p_organisation_name,'')),''),
     nullif(trim(coalesce(p_position,'')),''), nullif(trim(coalesce(p_message,'')),''),
     case when p_locale in ('zh','en') then p_locale else 'zh' end)
  returning membership_applications.id, membership_applications.access_token
    into v_id, v_token;

  return jsonb_build_object('application_id', v_id, 'access_token', v_token);
end
$$;
revoke execute on function public.submit_membership_application(text,text,text,text,text,text,text,text) from public;
grant execute on function public.submit_membership_application(text,text,text,text,text,text,text,text) to anon, authenticated, service_role;

-- Attach an uploaded document to a fresh application, authorised by the
-- access token returned from submit_membership_application.
create or replace function public.attach_application_document(
  p_application_id bigint,
  p_access_token uuid,
  p_storage_path text,
  p_file_name text,
  p_mime_type text,
  p_size_bytes bigint
) returns void
language plpgsql security definer set search_path = ''
as $$
declare
  v_count int;
begin
  perform 1 from public.membership_applications a
  where a.id = p_application_id
    and a.access_token = p_access_token
    and a.status = 'submitted';
  if not found then
    raise exception 'application not found or no longer editable';
  end if;

  select count(*) into v_count
  from public.membership_documents d
  where d.application_id = p_application_id;
  if v_count >= 10 then
    raise exception 'document limit reached';
  end if;

  if p_storage_path !~ '^applications/' then
    raise exception 'invalid storage path';
  end if;

  insert into public.membership_documents
    (application_id, storage_path, file_name, mime_type, size_bytes)
  values
    (p_application_id, p_storage_path, p_file_name, p_mime_type, p_size_bytes);
end
$$;
revoke execute on function public.attach_application_document(bigint,uuid,text,text,text,bigint) from public;
grant execute on function public.attach_application_document(bigint,uuid,text,text,text,bigint) to anon, authenticated, service_role;
