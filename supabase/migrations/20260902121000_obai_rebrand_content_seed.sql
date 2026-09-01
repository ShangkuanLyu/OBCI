-- 008 · OBAI rebrand + DOCX-approved content seed (data-only, additive)
-- STATUS: authored locally on 2026-09-02; NOT yet applied to the remote
-- project. Apply only after explicit approval.
--
-- Every value below is either taken from the approved redesign DOCX, from
-- the conversation brief, or is provisional neutral copy explicitly listed
-- in the pre-push report. Nothing is deleted:
--  * identity settings are merged (previous values remain in the report);
--  * the six DOCX industries are inserted as NEW rows; the ten legacy
--    chapters are archived via is_active=false (recoverable);
--  * ABS service item lists are trimmed to the DOCX-confirmed entries
--    (removed handbook-only extras are listed in the pre-push report and
--    can be restored once the chamber confirms them);
--  * three real, already-published health articles/events are tagged to
--    the health chapter.

-- 1 · Brand identity → OBAI (public-facing copy; legal name unchanged).
update public.site_settings
set value = value || jsonb_build_object(
  'acronym', 'OBAI',
  'name_zh', '大洋洲工商协会',
  'name_en', 'Oceania Business Association',
  'tagline_zh', '搭建中澳及大洋洲多边商业互通枢纽',
  'tagline_en', 'A multilateral business hub for China, Australia and Oceania',
  'subtitle_zh', '赋能企业跨境成长',
  'subtitle_en', 'Empowering cross-border growth'
)
where key = 'identity';

-- 2 · DOCX content blocks (fixed-shape site_settings keys; editable in the
--     extended admin settings module).
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
)
on conflict (key) do update set value = excluded.value;

-- 3 · Top tier renamed per the DOCX (Chinese only; the English name awaits
--     the chamber's confirmation).
update public.membership_types
set name_zh = '企业顶级会员'
where code = 'corporate-group';

-- 4 · ABS service items trimmed to the DOCX-confirmed lists.
update public.service_offerings set
  items_zh = array['TGA / RCM / 有机认证代办','FIRB 外资投资审批','税务架构规划','本地授权代表 / 进口商代持'],
  items_en = array['TGA, RCM and organic certification support','FIRB foreign-investment approvals','Tax structure planning','Local authorised representative and importer-of-record services']
where slug = 'market-entry';

update public.service_offerings set
  items_zh = array['会员金牌代理商筛选','政商闭门供需对接','订单前置匹配——先有采购意向再落地'],
  items_en = array['Vetted top-tier agents drawn from the membership','Closed-door government-and-business supply-demand sessions','Pre-matched orders — demand secured before you land']
where slug = 'market-channels';

update public.service_offerings set
  items_zh = array['悉尼 / 墨尔本共享备件仓','全澳持证维保网络','统一派单托管——企业无需自建澳洲团队'],
  items_en = array['Shared spare-parts warehouses in Sydney and Melbourne','A nationwide licensed maintenance network','Centralised dispatch and managed service — no local team required']
where slug = 'local-operations';

update public.service_offerings set
  items_zh = array['州政府补贴 / 土地政策对接','品牌危机公关','澳洲上市辅导','中澳产业基金对接'],
  items_en = array['State-government grant and land-policy introductions','Brand and crisis communications','Australian listing advisory','Australia–China industry fund introductions']
where slug = 'capital-government';

-- 5 · Six DOCX industries as new chapter rows. Taglines/descriptions are
--     provisional neutral copy pending the chamber's industry content;
--     the ABS industry-service items are the generic DOCX template trio.
insert into public.industry_chapters
  (slug, name_zh, name_en, tagline_zh, tagline_en, description_zh, description_en,
   services_zh, services_en, display_order, is_active)
values
(
  'health-products', '大健康／健康产品', 'Health & Wellness Products',
  '保健品、健康食品与健康产业的中澳双向贸易赛道。',
  'Two-way trade in supplements, health foods and the wellness industry.',
  E'大健康／健康产品行业分会是协会六大行业分会之一，面向保健品、健康食品与健康产业链上下游企业。分会依托协会的政商资源与 ABS 一站式出海服务体系，围绕产品合规、渠道对接与行业交流开展工作。\n\n健康产品进入澳洲市场通常涉及澳大利亚药品管理局（TGA）等监管体系的合规要求；进入中国市场则需应对跨境注册与渠道准入。分会关注行业合规与市场动态，并通过协会服务体系为会员对接相应支持。',
  E'The Health & Wellness Products chapter is one of the association''s six industry chapters, serving businesses across supplements, health foods and the wider wellness supply chain. Drawing on the association''s government and business network and the ABS one-stop market-entry services, the chapter focuses on product compliance, channel matching and industry exchange.\n\nHealth products entering the Australian market typically face regulatory requirements under the Therapeutic Goods Administration (TGA); entering China involves cross-border registration and channel access. The chapter follows compliance and market developments and connects members to support through the association''s services.',
  array['行业合规代办','定向采购匹配','行业专属展会'],
  array['Industry compliance handling','Targeted procurement matching','Industry-specific trade events'],
  1, true
),
(
  'new-energy', '新能源产业', 'New Energy',
  '新能源技术、装备与项目在澳洲市场的落地与合作。',
  'New-energy technology, equipment and projects entering the Australian market.',
  null, null,
  array['行业合规代办','定向采购匹配','行业专属展会'],
  array['Industry compliance handling','Targeted procurement matching','Industry-specific trade events'],
  2, true
),
(
  'building-materials', '建材基建', 'Building Materials & Infrastructure',
  '建筑材料与基建工程领域的供需与项目对接。',
  'Supply, demand and project matching in building materials and infrastructure.',
  null, null,
  array['行业合规代办','定向采购匹配','行业专属展会'],
  array['Industry compliance handling','Targeted procurement matching','Industry-specific trade events'],
  3, true
),
(
  'cross-border-ecommerce', '跨境电商', 'Cross-Border E-commerce',
  '跨境电商渠道、物流与品牌出海的行业交流。',
  'Channels, logistics and brand-building for cross-border e-commerce.',
  null, null,
  array['行业合规代办','定向采购匹配','行业专属展会'],
  array['Industry compliance handling','Targeted procurement matching','Industry-specific trade events'],
  4, true
),
(
  'education-tourism', '教育文旅', 'Education, Culture & Tourism',
  '教育、文化与旅游产业的中澳合作与交流。',
  'Australia–China cooperation across education, culture and tourism.',
  null, null,
  array['行业合规代办','定向采购匹配','行业专属展会'],
  array['Industry compliance handling','Targeted procurement matching','Industry-specific trade events'],
  5, true
),
(
  'mining-investment', '矿产投资', 'Mining & Resources Investment',
  '矿产资源领域的投资对接与行业交流。',
  'Investment matching and exchange in mining and resources.',
  null, null,
  array['行业合规代办','定向采购匹配','行业专属展会'],
  array['Industry compliance handling','Targeted procurement matching','Industry-specific trade events'],
  6, true
)
on conflict (slug) do nothing;

-- 6 · Archive (NOT delete) the ten legacy chapters — recoverable by
--     setting is_active back to true.
update public.industry_chapters
set is_active = false
where slug in (
  'construction', 'real-estate', 'education', 'health', 'talent-innovation',
  'business-services', 'culture-arts', 'tech-innovation', 'study-migration',
  'canberra-branch'
);

-- 7 · Leadership portraits: the existing portrait_path values reference
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

-- 8 · Tag real, already-published health content to the health chapter.
update public.news
set tags = array_append(tags, 'health-products')
where slug in (
  'melbourne-australia-china-health-expo-tcm-forum-2025',
  '7th-world-traditional-medicine-forum-melbourne',
  'world-traditional-medicine-forum-preparatory-meeting'
) and not (tags @> array['health-products']);

update public.events
set tags = array_append(tags, 'health-products')
where slug = 'world-traditional-medicine-forum-2025'
  and not (tags @> array['health-products']);
