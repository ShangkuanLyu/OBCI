-- Applied to project gmglssmdrsackqgkqdbu via MCP apply_migration; mirror copy.
-- 002 · Content domain: news, events, chapters, leadership, partners,
-- projects, navigation, settings, media, contact, newsletter.

-- ---------------------------------------------------------------- news
create table public.news_categories (
  id bigint generated always as identity primary key,
  slug text not null unique check (slug ~ '^[a-z0-9-]+$'),
  name_zh text not null,
  name_en text not null,
  display_order int not null default 0
);

create table public.news (
  id bigint generated always as identity primary key,
  slug text not null unique check (slug ~ '^[a-z0-9-]+$'),
  category_id bigint references public.news_categories(id) on delete set null,
  title_zh text,
  title_en text,
  summary_zh text,
  summary_en text,
  body_zh text,
  body_en text,
  tags text[] not null default '{}',
  cover_image_path text,
  status public.content_status not null default 'draft',
  published_at timestamptz,
  is_featured boolean not null default false,
  author_name text,
  source_url text,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint news_has_title check (title_zh is not null or title_en is not null),
  constraint news_published_has_date check (status <> 'published' or published_at is not null)
);
create index news_status_published_idx on public.news (status, published_at desc);
create index news_category_idx on public.news (category_id);
create index news_created_by_idx on public.news (created_by);
create trigger set_updated_at before update on public.news
  for each row execute function extensions.moddatetime(updated_at);

-- --------------------------------------------------------------- events
create table public.events (
  id bigint generated always as identity primary key,
  slug text not null unique check (slug ~ '^[a-z0-9-]+$'),
  title_zh text,
  title_en text,
  summary_zh text,
  summary_en text,
  body_zh text,
  body_en text,
  location_zh text,
  location_en text,
  starts_at timestamptz not null,
  ends_at timestamptz,
  cover_image_path text,
  status public.content_status not null default 'draft',
  is_featured boolean not null default false,
  registration_open boolean not null default false,
  registration_url text,
  capacity int check (capacity > 0),
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint events_has_title check (title_zh is not null or title_en is not null),
  constraint events_time_order check (ends_at is null or ends_at >= starts_at)
);
create index events_status_starts_idx on public.events (status, starts_at desc);
create index events_created_by_idx on public.events (created_by);
create trigger set_updated_at before update on public.events
  for each row execute function extensions.moddatetime(updated_at);

create table public.event_registrations (
  id bigint generated always as identity primary key,
  event_id bigint not null references public.events(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  name text not null check (length(name) between 1 and 200),
  email text not null check (email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  phone text,
  organisation_name text,
  note text,
  status public.registration_status not null default 'pending',
  created_at timestamptz not null default now(),
  unique (event_id, email)
);
create index event_registrations_user_idx on public.event_registrations (user_id);

-- ------------------------------------------------------------- chapters
create table public.industry_chapters (
  id bigint generated always as identity primary key,
  slug text not null unique check (slug ~ '^[a-z0-9-]+$'),
  name_zh text not null,
  name_en text not null,
  description_zh text,
  description_en text,
  secretary_general text,
  contact_email text,
  cover_image_path text,
  display_order int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger set_updated_at before update on public.industry_chapters
  for each row execute function extensions.moddatetime(updated_at);

-- ----------------------------------------------------------- leadership
-- Advisors are a display group here rather than a separate table.
create table public.leadership (
  id bigint generated always as identity primary key,
  name_zh text not null,
  name_en text not null,
  title_zh text not null,
  title_en text not null,
  bio_zh text,
  bio_en text,
  portrait_path text,
  group_key text not null check (group_key in ('president','honorary_chairman','vice_chair','advisor','secretariat')),
  display_order int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create trigger set_updated_at before update on public.leadership
  for each row execute function extensions.moddatetime(updated_at);

-- ------------------------------------------------------------- partners
create table public.partners (
  id bigint generated always as identity primary key,
  name_zh text not null,
  name_en text not null,
  kind text not null check (kind in ('government','chamber','enterprise','provincial','media')),
  logo_path text,
  website text,
  region text,
  display_order int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- ------------------------------------------------------------- projects
create table public.projects (
  id bigint generated always as identity primary key,
  slug text not null unique check (slug ~ '^[a-z0-9-]+$'),
  title_zh text,
  title_en text,
  summary_zh text,
  summary_en text,
  body_zh text,
  body_en text,
  kind text not null check (kind in ('investment','requirement','cooperation')),
  cover_image_path text,
  status public.content_status not null default 'draft',
  published_at timestamptz,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint projects_has_title check (title_zh is not null or title_en is not null),
  constraint projects_published_has_date check (status <> 'published' or published_at is not null)
);
create index projects_status_published_idx on public.projects (status, published_at desc);
create index projects_created_by_idx on public.projects (created_by);
create trigger set_updated_at before update on public.projects
  for each row execute function extensions.moddatetime(updated_at);

-- --------------------------------------------------- navigation/settings
create table public.navigation_items (
  id bigint generated always as identity primary key,
  menu text not null check (menu in ('header','footer')),
  parent_id bigint references public.navigation_items(id) on delete cascade,
  label_zh text not null,
  label_en text not null,
  href text not null,
  display_order int not null default 0,
  is_active boolean not null default true
);
create index navigation_items_parent_idx on public.navigation_items (parent_id);

create table public.site_settings (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now()
);
create trigger set_updated_at before update on public.site_settings
  for each row execute function extensions.moddatetime(updated_at);

-- ---------------------------------------------------------------- media
create table public.media (
  id bigint generated always as identity primary key,
  bucket text not null,
  storage_path text not null unique,
  file_name text not null,
  mime_type text,
  width int,
  height int,
  alt_zh text,
  alt_en text,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);
create index media_created_by_idx on public.media (created_by);

-- ------------------------------------------------------ contact/newsletter
create table public.contact_enquiries (
  id bigint generated always as identity primary key,
  name text not null check (length(name) between 1 and 200),
  email text not null check (email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  phone text,
  organisation_name text,
  subject text,
  message text not null check (length(message) between 1 and 5000),
  locale text not null default 'zh' check (locale in ('zh','en')),
  status public.enquiry_status not null default 'new',
  handled_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);
create index contact_enquiries_status_idx on public.contact_enquiries (status, created_at desc);
create index contact_enquiries_handled_by_idx on public.contact_enquiries (handled_by);

create table public.newsletter_subscribers (
  id bigint generated always as identity primary key,
  email text not null check (email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  name text,
  locale text not null default 'zh' check (locale in ('zh','en')),
  source text,
  subscribed_at timestamptz not null default now(),
  unsubscribed_at timestamptz
);
create unique index newsletter_subscribers_email_idx on public.newsletter_subscribers (lower(email));

-- ------------------------------------------------------------------ RLS
alter table public.news_categories enable row level security;
alter table public.news enable row level security;
alter table public.events enable row level security;
alter table public.event_registrations enable row level security;
alter table public.industry_chapters enable row level security;
alter table public.leadership enable row level security;
alter table public.partners enable row level security;
alter table public.projects enable row level security;
alter table public.navigation_items enable row level security;
alter table public.site_settings enable row level security;
alter table public.media enable row level security;
alter table public.contact_enquiries enable row level security;
alter table public.newsletter_subscribers enable row level security;

-- Public read of published/active content; editors manage.
create policy "news_categories_read" on public.news_categories
  for select to anon, authenticated using (true);
create policy "news_categories_manage" on public.news_categories
  for all to authenticated
  using ((select private.role_in(array['admin','editor'])))
  with check ((select private.role_in(array['admin','editor'])));

create policy "news_public_read" on public.news
  for select to anon, authenticated
  using (status = 'published' and published_at <= now());
create policy "news_editor_manage" on public.news
  for all to authenticated
  using ((select private.role_in(array['admin','editor'])))
  with check ((select private.role_in(array['admin','editor'])));

create policy "events_public_read" on public.events
  for select to anon, authenticated
  using (status = 'published');
create policy "events_manager_manage" on public.events
  for all to authenticated
  using ((select private.role_in(array['admin','editor','event_manager'])))
  with check ((select private.role_in(array['admin','editor','event_manager'])));

create policy "event_registrations_insert" on public.event_registrations
  for insert to anon, authenticated
  with check (status = 'pending');
create policy "event_registrations_select_own" on public.event_registrations
  for select to authenticated
  using (user_id = (select auth.uid()));
create policy "event_registrations_staff" on public.event_registrations
  for all to authenticated
  using ((select private.role_in(array['admin','event_manager'])))
  with check ((select private.role_in(array['admin','event_manager'])));

create policy "chapters_read" on public.industry_chapters
  for select to anon, authenticated
  using (is_active or (select private.role_in(array['admin','editor'])));
create policy "chapters_manage" on public.industry_chapters
  for all to authenticated
  using ((select private.role_in(array['admin','editor'])))
  with check ((select private.role_in(array['admin','editor'])));

create policy "leadership_read" on public.leadership
  for select to anon, authenticated
  using (is_active or (select private.role_in(array['admin','editor'])));
create policy "leadership_manage" on public.leadership
  for all to authenticated
  using ((select private.role_in(array['admin','editor'])))
  with check ((select private.role_in(array['admin','editor'])));

create policy "partners_read" on public.partners
  for select to anon, authenticated
  using (is_active or (select private.role_in(array['admin','editor'])));
create policy "partners_manage" on public.partners
  for all to authenticated
  using ((select private.role_in(array['admin','editor'])))
  with check ((select private.role_in(array['admin','editor'])));

create policy "projects_public_read" on public.projects
  for select to anon, authenticated
  using (status = 'published' and published_at <= now());
create policy "projects_manage" on public.projects
  for all to authenticated
  using ((select private.role_in(array['admin','editor'])))
  with check ((select private.role_in(array['admin','editor'])));

create policy "navigation_read" on public.navigation_items
  for select to anon, authenticated using (true);
create policy "navigation_manage" on public.navigation_items
  for all to authenticated
  using ((select private.role_in(array['admin'])))
  with check ((select private.role_in(array['admin'])));

create policy "site_settings_read" on public.site_settings
  for select to anon, authenticated using (true);
create policy "site_settings_manage" on public.site_settings
  for all to authenticated
  using ((select private.role_in(array['admin'])))
  with check ((select private.role_in(array['admin'])));

create policy "media_read" on public.media
  for select to anon, authenticated using (true);
create policy "media_manage" on public.media
  for all to authenticated
  using ((select private.role_in(array['admin','editor','event_manager','membership_manager'])))
  with check ((select private.role_in(array['admin','editor','event_manager','membership_manager'])));

create policy "contact_enquiries_insert" on public.contact_enquiries
  for insert to anon, authenticated
  with check (status = 'new' and handled_by is null);
create policy "contact_enquiries_staff" on public.contact_enquiries
  for all to authenticated
  using ((select private.role_in(array['admin','membership_manager','editor'])))
  with check ((select private.role_in(array['admin','membership_manager','editor'])));

create policy "newsletter_insert" on public.newsletter_subscribers
  for insert to anon, authenticated
  with check (unsubscribed_at is null);
create policy "newsletter_admin" on public.newsletter_subscribers
  for all to authenticated
  using ((select private.role_in(array['admin'])))
  with check ((select private.role_in(array['admin'])));
