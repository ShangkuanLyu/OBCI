-- 009 · News categories per the DOCX (§资讯中心): five first-level categories.
--
-- Applied to the remote project on 2026-09-10 (launch), as migration
-- news_categories_first_level. Additive: one column with a default, an upsert-by-slug of the
-- five confirmed categories (names + order), and one flag update. No row is
-- deleted; every article keeps its category_id. Mirrors
-- src/lib/news/categories.ts (DOCX_NEWS_CATEGORIES) — keep the two in step.
--
-- Data-safety notes for review:
--   * UPDATE (via ON CONFLICT) of name_zh/name_en/display_order on the five
--     existing rows — e.g. policy-insights name_en "Policy & Regulation" →
--     "China–Australia Trade Policy".
--   * trade-cooperation ("中澳经贸合作 / Trade & Cooperation") is NOT in the
--     DOCX list: it stays, flagged is_active=false. Its two articles remain
--     published under "全部文章" and are marked "历史分类待整理" until the
--     chamber re-assigns them in the CMS.

alter table public.news_categories
  add column if not exists is_active boolean not null default true;

comment on column public.news_categories.is_active is
  'false = legacy category: not offered as a first-level category; its articles stay published and are marked 历史分类待整理 until re-assigned.';

insert into public.news_categories (slug, name_zh, name_en, display_order, is_active) values
  ('association-news', '商会动态',     'Association News',             1, true),
  ('policy-insights',  '中澳经贸政策', 'China–Australia Trade Policy', 2, true),
  ('market-insights',  '行业市场资讯', 'Industry & Market Insights',   3, true),
  ('going-global',     '出海实操指南', 'Market Entry Guides',          4, true),
  ('events-coverage',  '活动预告回顾', 'Event Previews & Recaps',      5, true)
on conflict (slug) do update set
  name_zh       = excluded.name_zh,
  name_en       = excluded.name_en,
  display_order = excluded.display_order,
  is_active     = true;

update public.news_categories
set is_active = false,
    display_order = 99
where slug = 'trade-cooperation';
