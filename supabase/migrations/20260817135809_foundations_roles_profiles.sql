-- Applied to project gmglssmdrsackqgkqdbu via MCP apply_migration; mirror copy.
-- 001 · Foundations: extensions, enums, private helpers, profiles.

create extension if not exists moddatetime schema extensions;

-- Hygiene (from supabase-audit): the pre-existing RLS auto-enable helper
-- should not be executable through the API roles.
revoke execute on function public.rls_auto_enable() from public, anon, authenticated;

-- Application enums
create type public.app_role as enum ('admin','editor','membership_manager','event_manager','member');
create type public.content_status as enum ('draft','published','archived');
create type public.application_status as enum ('submitted','under_review','approved','rejected','withdrawn');
create type public.payment_status as enum ('pending','succeeded','failed','refunded');
create type public.enquiry_status as enum ('new','in_progress','closed');
create type public.registration_status as enum ('pending','confirmed','cancelled');
create type public.member_status as enum ('active','lapsed','suspended');

-- Non-API schema for helpers used inside RLS policies.
create schema if not exists private;
revoke all on schema private from public;
grant usage on schema private to anon, authenticated, service_role;

-- Profiles: one row per auth user, carries the app role.
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role public.app_role not null default 'member',
  full_name text not null default '',
  email text not null default '',
  phone text,
  organisation_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger set_updated_at
  before update on public.profiles
  for each row execute function extensions.moddatetime(updated_at);

-- Role of the calling user (null when anonymous). Runs once per query when
-- wrapped in (select ...) inside policies.
create or replace function private.app_role()
returns public.app_role
language sql stable security definer set search_path = ''
as $$
  select role from public.profiles where id = (select auth.uid())
$$;
revoke execute on function private.app_role() from public;
grant execute on function private.app_role() to anon, authenticated, service_role;

-- True when the calling user's role is in the allowed list.
create or replace function private.role_in(allowed text[])
returns boolean
language sql stable security definer set search_path = ''
as $$
  select coalesce(
    (select p.role::text from public.profiles p where p.id = (select auth.uid())) = any (allowed),
    false
  )
$$;
revoke execute on function private.role_in(text[]) from public;
grant execute on function private.role_in(text[]) to anon, authenticated, service_role;

-- Auto-create a profile for every new auth user.
create or replace function private.handle_new_user()
returns trigger
language plpgsql security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    coalesce(new.email, ''),
    coalesce(new.raw_user_meta_data ->> 'full_name', '')
  );
  return new;
end
$$;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function private.handle_new_user();

-- Only admins may change roles (service-role/dashboard sessions have no
-- auth.uid() and are allowed through).
create or replace function private.protect_profile_role()
returns trigger
language plpgsql security definer set search_path = ''
as $$
begin
  if new.role is distinct from old.role
     and (select auth.uid()) is not null
     and not private.role_in(array['admin'])
  then
    raise exception 'only admins may change roles';
  end if;
  return new;
end
$$;
create trigger protect_profile_role
  before update on public.profiles
  for each row execute function private.protect_profile_role();

-- RLS (enabled automatically by the ensure_rls event trigger; explicit anyway)
alter table public.profiles enable row level security;

create policy "profiles_select_own_or_staff" on public.profiles
  for select to authenticated
  using (
    id = (select auth.uid())
    or (select private.role_in(array['admin','editor','membership_manager','event_manager']))
  );

create policy "profiles_update_own" on public.profiles
  for update to authenticated
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));

create policy "profiles_admin_update" on public.profiles
  for update to authenticated
  using ((select private.role_in(array['admin'])))
  with check ((select private.role_in(array['admin'])));
