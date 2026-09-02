-- 008 · OBAI rebrand + DOCX-approved content seed (data-only, additive)
-- STATUS: authored locally on 2026-09-02; NOT yet applied to the remote
-- project. Apply only after explicit approval, and only AFTER
-- 20260902120000_application_form_v2.sql (schema first, then this data).
-- PRECONDITION: as for 007 — the six 20260827* remote migrations must be
-- mirrored locally (`supabase db pull`) before this chain is replayed
-- anywhere other than the current remote project.
--
-- Every value below is taken from the approved redesign DOCX or names a
-- real, already-published content row. Content the chamber has not
-- supplied (industry taglines/introductions, mission, core values,
-- committee/secretariat descriptions, confirmed contact details, partner
-- confirmation, approved legal texts) is deliberately left EMPTY so the
-- site hides those modules until the CMS is filled in. Nothing is deleted:
--  * identity settings are merged (previous values remain in the report);
--  * the six DOCX industries are inserted as NEW rows; the ten legacy
--    chapters are archived via is_active=false (recoverable);
--  * ABS service item lists are trimmed to the DOCX-confirmed entries
--    (removed handbook-only extras are listed in the pre-push report and
--    can be restored once the chamber confirms them);
--  * no news/event is assigned to a chapter (that association awaits the
--    chamber and is made in the CMS).

-- 1 · Brand identity → OBAI (public-facing copy; legal name unchanged).
update public.site_settings
set value = value || jsonb_build_object(
  'acronym', 'OBAI',
  'name_zh', '大洋洲工商协会',
  'name_en', 'Oceania Business Association',
  'tagline_zh', '搭建中澳及大洋洲多边商业互通枢纽',
  'tagline_en', 'A multilateral business hub for China, Australia and Oceania'
)
where key = 'identity';

-- 2 · Contact: NO field is confirmed for publication — the addresses,
--     phone numbers, email, WeChat account and membership contact all
--     await the chamber's ratification. The values stay in the CMS but are
--     not shown until `confirmed_fields` is ticked in the admin settings
--     module. This only initialises the key; no contact value is asserted.
update public.site_settings
set value = value || jsonb_build_object('confirmed_fields', jsonb_build_array())
where key = 'contact' and not (value ? 'confirmed_fields');

-- 3 · DOCX content blocks (fixed-shape site_settings keys; editable in the
--     extended admin settings module). mission / core_values /
--     strategy_committee / secretariat are NOT seeded: the DOCX marks
--     them as content still to be supplied.
insert into public.site_settings (key, value) values
(
  'vision',
  jsonb_build_object(
    'text_zh', '搭建中澳及大洋洲多边商业互通枢纽，赋能中国企业轻资产出海、澳洲企业拓展亚太市场，打造政商资源一体化、全链路合规落地的跨境商贸服务平台。',
    'text_en', 'To build a multilateral business hub linking China, Australia and Oceania — enabling Chinese enterprises to go global asset-light and Australian businesses to expand into the Asia-Pacific, on a cross-border trade platform that unites government and business resources with end-to-end compliant delivery.'
  )
),
(
  'pillars',
  jsonb_build_object('items', jsonb_build_array(
    jsonb_build_object(
      'title_zh', '政商资源支撑', 'title_en', 'Government & business resources',
      'text_zh', '澳洲前议员、前贸易部长、墨尔本前市长等荣誉顾问团，州政府合作渠道与高层供需闭门会。',
      'text_en', 'An honorary advisory council of former Australian parliamentarians, a former federal trade minister and a former Lord Mayor of Melbourne, with state-government channels and executive closed-door sessions.'
    ),
    jsonb_build_object(
      'title_zh', '行业垂直赋能', 'title_en', 'Industry verticals',
      'text_zh', '六大行业分会与专家顾问团，细分赛道精准对接。',
      'text_en', 'Six industry chapters and expert advisers, matching businesses precisely within their sectors.'
    ),
    jsonb_build_object(
      'title_zh', '一站式出海服务（ABS）', 'title_en', 'One-stop market entry (ABS)',
      'text_zh', '合规准入、市场渠道、全澳售后、资本扶持，全链路落地执行。',
      'text_en', 'Compliance and market entry, channels, nationwide aftersales and capital support — executed end to end.'
    ),
    jsonb_build_object(
      'title_zh', '会员生态网络', 'title_en', 'Member ecosystem',
      'text_zh', '全球会员名录、资源匹配、活动对接与政策资讯推送。',
      'text_en', 'A global member directory with resource matching, event access and policy intelligence.'
    )
  ))
),
(
  'member_benefits',
  jsonb_build_object('items', jsonb_build_array(
    jsonb_build_object('text_zh', '全大洋洲城市线下服务窗口', 'text_en', 'In-person service desks across Oceania''s major cities'),
    jsonb_build_object('text_zh', '会员名录线上曝光', 'text_en', 'Online exposure in the member directory'),
    jsonb_build_object('text_zh', '会员间交易折扣', 'text_en', 'Member-to-member trading discounts'),
    jsonb_build_object('text_zh', '全部活动参会优惠', 'text_en', 'Preferential rates for all association events'),
    jsonb_build_object('text_zh', '行业政策与市场资讯专属推送', 'text_en', 'Dedicated policy and market intelligence briefings'),
    jsonb_build_object('text_zh', '中澳企业资源对接与政企决策人对接沙龙', 'text_en', 'Business resource matching across China and Australia, and salons with government and business decision-makers')
  ))
),
(
  'revenue_note',
  jsonb_build_object(
    'text_zh', '服务模式说明：固定年费、交易佣金、售后服务利差、认证 / 补贴等专项增值服务费。',
    'text_en', 'Service model: fixed annual membership fees, transaction commissions, aftersales service margins, and fees for specialist value-added services such as certification and grant support.'
  )
),
(
  'banners',
  jsonb_build_object('items', jsonb_build_array(
    jsonb_build_object(
      'key', 'vision', 'is_active', true, 'image_path', null,
      'title_zh', '搭建中澳及大洋洲多边商业互通枢纽',
      'title_en', 'A multilateral business hub for China, Australia and Oceania',
      'text_zh', '赋能中国企业轻资产出海、澳洲企业拓展亚太市场——政商资源一体化、全链路合规落地的跨境商贸服务平台。',
      'text_en', 'Empowering Chinese enterprises to go global asset-light and Australian businesses to expand into the Asia-Pacific — uniting government and business resources with end-to-end compliant delivery.',
      'cta_label_zh', '加入我们', 'cta_label_en', 'Join OBAI',
      'cta_href', '/membership/apply'
    )
  ))
),
(
  -- DOCX §组织架构: unit names only, no personnel. The chapters unit
  -- expands to the active industry_chapters rows at render time.
  'org_structure',
  jsonb_build_object('items', jsonb_build_array(
    jsonb_build_object('key', 'leadership', 'kind', 'leadership', 'name_zh', '会长、执行会长与荣誉顾问', 'name_en', 'Presidents, Executive President and honorary advisers', 'note_zh', '', 'note_en', ''),
    jsonb_build_object('key', 'strategy-committee', 'kind', 'committee', 'name_zh', '中国企业出海战略委员会', 'name_en', 'China Enterprise Going-Global Strategy Committee', 'note_zh', '', 'note_en', ''),
    jsonb_build_object('key', 'chapters', 'kind', 'chapters', 'name_zh', '各行业分会', 'name_en', 'Industry chapters', 'note_zh', '', 'note_en', ''),
    jsonb_build_object('key', 'secretariat', 'kind', 'secretariat', 'name_zh', '专业秘书处', 'name_en', 'Professional secretariat', 'note_zh', '', 'note_en', '')
  ))
),
(
  -- Gallery: only media the association has already published on its own
  -- site (cover images of published news/event rows). Captions and links
  -- resolve from those rows at render time.
  'gallery',
  jsonb_build_object('items', jsonb_build_array(
    jsonb_build_object('image_path', 'events/agm-2026.jpg', 'event_slug', 'agm-2026'),
    jsonb_build_object('image_path', 'events/world-traditional-medicine-forum-2025.jpg', 'event_slug', 'world-traditional-medicine-forum-2025'),
    jsonb_build_object('image_path', 'news/taizhou-delegation-visits-melbourne-cooperation.jpg', 'news_slug', 'taizhou-delegation-visits-melbourne-cooperation'),
    jsonb_build_object('image_path', 'news/obc-delegation-visits-liaoning-ccpit.jpg', 'news_slug', 'obc-delegation-visits-liaoning-ccpit'),
    jsonb_build_object('image_path', 'news/7th-world-traditional-medicine-forum-melbourne.jpg', 'news_slug', '7th-world-traditional-medicine-forum-melbourne'),
    jsonb_build_object('image_path', 'news/acbca-chinese-new-year-networking-event.jpg', 'news_slug', 'acbca-chinese-new-year-networking-event')
  ))
),
(
  -- Chamber confirmation gates. Nothing is confirmed yet: the partner wall
  -- (brochure p5 list) stays hidden until 'partners' is added here.
  'review',
  jsonb_build_object('confirmed_modules', jsonb_build_array())
)
on conflict (key) do update set value = excluded.value;

-- 4 · Fee-table wording per the DOCX where it differs from the brochure
--     (Chinese only; English names await the chamber's confirmation):
--     top tier 企业顶级会员, fourth tier 小微企业会员, individual threshold
--     自然人创业者. Fees and turnover bands already match the DOCX.
update public.membership_types
set name_zh = '企业顶级会员'
where code = 'corporate-group';

update public.membership_types
set name_zh = '小微企业会员'
where code = 'small';

update public.membership_types
set turnover_zh = '自然人创业者'
where code = 'individual';

-- 5 · ABS service items trimmed to the DOCX-confirmed lists. The one-line
--     summaries are the DOCX item lists joined (the previous summaries were
--     build-authored paraphrases).
update public.service_offerings set
  summary_zh = 'TGA / RCM / 有机认证代办、FIRB 外资投资审批、税务架构规划、本地授权代表 / 进口商代持。',
  summary_en = 'TGA, RCM and organic certification support; FIRB foreign-investment approvals; tax structure planning; local authorised representative and importer-of-record services.',
  items_zh = array['TGA / RCM / 有机认证代办','FIRB 外资投资审批','税务架构规划','本地授权代表 / 进口商代持'],
  items_en = array['TGA, RCM and organic certification support','FIRB foreign-investment approvals','Tax structure planning','Local authorised representative and importer-of-record services']
where slug = 'market-entry';

update public.service_offerings set
  summary_zh = '会员金牌代理商筛选、政商闭门供需对接、订单前置匹配——先有采购意向再落地。',
  summary_en = 'Vetted top-tier agents drawn from the membership, closed-door government-and-business supply-demand sessions, and pre-matched orders — demand secured before you land.',
  items_zh = array['会员金牌代理商筛选','政商闭门供需对接','订单前置匹配——先有采购意向再落地'],
  items_en = array['Vetted top-tier agents drawn from the membership','Closed-door government-and-business supply-demand sessions','Pre-matched orders — demand secured before you land']
where slug = 'market-channels';

update public.service_offerings set
  summary_zh = '悉尼 / 墨尔本共享备件仓、全澳持证维保网络、统一派单托管——企业无需自建澳洲团队。',
  summary_en = 'Shared spare-parts warehouses in Sydney and Melbourne, a nationwide licensed maintenance network, and centralised dispatch — no local team required.',
  items_zh = array['悉尼 / 墨尔本共享备件仓','全澳持证维保网络','统一派单托管——企业无需自建澳洲团队'],
  items_en = array['Shared spare-parts warehouses in Sydney and Melbourne','A nationwide licensed maintenance network','Centralised dispatch and managed service — no local team required']
where slug = 'local-operations';

update public.service_offerings set
  summary_zh = '州政府补贴 / 土地政策对接、品牌危机公关、澳洲上市辅导、中澳产业基金对接。',
  summary_en = 'State-government grant and land-policy introductions, brand and crisis communications, Australian listing advisory, and Australia–China industry fund introductions.',
  items_zh = array['州政府补贴 / 土地政策对接','品牌危机公关','澳洲上市辅导','中澳产业基金对接'],
  items_en = array['State-government grant and land-policy introductions','Brand and crisis communications','Australian listing advisory','Australia–China industry fund introductions']
where slug = 'capital-government';

-- 6 · Six DOCX industries as new chapter rows — names only. Taglines,
--     introductions, resources, experts, certifications and industry ABS
--     services are left empty (DOCX: 行业赛道介绍 客户后续提供文字素材) so every
--     content block hides until the chamber supplies it via the CMS. The
--     English names are draft translations pending confirmation.
insert into public.industry_chapters
  (slug, name_zh, name_en, display_order, is_active)
values
  ('health-products', '大健康／健康产品', 'Health & Wellness Products', 1, true),
  ('new-energy', '新能源产业', 'New Energy', 2, true),
  ('building-materials', '建材基建', 'Building Materials & Infrastructure', 3, true),
  ('cross-border-ecommerce', '跨境电商', 'Cross-Border E-commerce', 4, true),
  ('education-tourism', '教育文旅', 'Education, Culture & Tourism', 5, true),
  ('mining-investment', '矿产投资', 'Mining & Resources Investment', 6, true)
on conflict (slug) do nothing;

-- 7 · Archive (NOT delete) the ten legacy chapters — recoverable by
--     setting is_active back to true.
update public.industry_chapters
set is_active = false
where slug in (
  'construction', 'real-estate', 'education', 'health', 'talent-innovation',
  'business-services', 'culture-arts', 'tech-innovation', 'study-migration',
  'canberra-branch'
);

-- 8 · Leadership portraits: the existing portrait_path values reference
--     storage objects that were never uploaded (broken images on the live
--     site today). The six official portraits from the handbook are
--     uploaded to the media bucket as leadership/<slug>.jpg IMMEDIATELY
--     BEFORE this migration runs; these updates point the rows at them.
--     (Old dangling values are recorded in the pre-push report.)
update public.leadership set portrait_path = 'leadership/bruce-atkinson.jpg' where name_en = 'Hon. Bruce Atkinson AM';
update public.leadership set portrait_path = 'leadership/ken-smith.jpg' where name_en = 'The Hon Ken Smith AM';
update public.leadership set portrait_path = 'leadership/andrew-robb.jpg' where name_en = 'The Hon Andrew Robb AO';
update public.leadership set portrait_path = 'leadership/john-so.jpg' where name_en = 'John Chun Sai So AO';
update public.leadership set portrait_path = 'leadership/george-tambassis.jpg' where name_en = 'George Tambassis';
update public.leadership set portrait_path = 'leadership/sunny-sun.jpg' where name_en = 'Sunny Sun';

-- 9 · (intentionally empty) No news/event is assigned to an industry
--     chapter by this migration: which articles and events belong to which
--     chapter is the chamber's decision, to be made in the CMS (news.tags /
--     events.tags editors) after approval. The fixture build's health-chapter
--     association is a labelled demonstration only.
