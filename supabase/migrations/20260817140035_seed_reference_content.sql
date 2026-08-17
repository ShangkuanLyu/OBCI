-- Applied to project gmglssmdrsackqgkqdbu via MCP apply_migration; mirror copy.
-- 005 · Seed reference content from the site audit (all client-editable via CMS).

insert into public.news_categories (slug, name_zh, name_en, display_order) values
  ('association-news', '协会动态', 'Association News', 1),
  ('trade-cooperation', '经贸合作', 'Trade & Cooperation', 2),
  ('health-industry', '健康产业', 'Health Industry', 3),
  ('policy-insights', '政策资讯', 'Policy & Insights', 4);

-- Membership types — no fees have been published; price stays null until the
-- client confirms ("contact us" fallback in UI).
insert into public.membership_types
  (code, name_zh, name_en, description_zh, description_en, benefits_zh, benefits_en, display_order) values
  ('individual', '个人会员', 'Individual Member',
   '有意参与大洋洲与中国经贸活动的个人。',
   'Individuals interested in engaging in trade and economic activities between Oceania and China.',
   array['行业洞察与政策解读','活动与论坛参与优惠','会员名录收录','区域代表处优先对接'],
   array['Exclusive industry insights and policy interpretation','Discounts for business activities and forums','Inclusion in the member industry directory','Priority access to regional representative offices'],
   1),
  ('corporate', '企业会员', 'Corporate Member',
   '在大洋洲或中国注册、专注国际贸易与投资的企业或机构。',
   'Enterprises or organisations registered in Oceania or China, focusing on international trade, investment, or related fields.',
   array['行业洞察与政策解读','活动与论坛参与优惠','会员名录收录并提升曝光','区域代表处优先对接'],
   array['Exclusive industry insights and policy interpretation','Discounts for business activities and forums','Inclusion in the member industry directory to increase visibility','Priority access to regional representative offices'],
   2),
  ('association', '行业协会与机构会员', 'Industry Association & Institution',
   '专注多边经济合作的行业协会及其他组织。',
   'Industry associations and other organisations focusing on multilateral economic cooperation.',
   array['行业洞察与政策解读','活动与论坛合作机会','会员名录收录','跨区域合作网络'],
   array['Exclusive industry insights and policy interpretation','Co-hosting opportunities for events and forums','Inclusion in the member industry directory','Cross-regional cooperation network'],
   3);

insert into public.leadership
  (name_zh, name_en, title_zh, title_en, group_key, display_order) values
  ('布鲁斯·阿特金森', 'Hon. Bruce Atkinson AM', '荣誉主席', 'Honorary Chairman', 'honorary_chairman', 1),
  ('肯·史密斯', 'Hon. Ken Smith AM', '创会会长、荣誉主席', 'Founding President & Honorary Chairman', 'honorary_chairman', 2),
  ('孙国钊', 'Sunny Sun', '执行会长', 'Executive President', 'president', 3),
  ('林丹', 'Diana Lin', '理事会副主席', 'Vice Chair of the Board', 'vice_chair', 4);

insert into public.industry_chapters
  (slug, name_zh, name_en, secretary_general, display_order) values
  ('education', '教育委员会', 'Education Committee', 'Yang Li', 1),
  ('construction', '建筑委员会', 'Construction Committee', 'Bryan Guan', 2),
  ('real-estate', '房地产委员会', 'Real Estate Committee', 'Diana Chen', 3),
  ('talent-innovation', '高层次人才与博士创新委员会', 'High-Level Talent & Doctoral Innovation Committee', 'Arina Tang', 4),
  ('business-services', '商业服务委员会', 'Business Services Committee', 'Albert Zhao', 5),
  ('canberra-branch', '堪培拉分会', 'Canberra Branch', 'Ding Ding', 6);

insert into public.partners (name_zh, name_en, kind, region, display_order) values
  ('浙江省', 'Zhejiang Province', 'provincial', 'China', 1),
  ('江苏省', 'Jiangsu Province', 'provincial', 'China', 2),
  ('安徽省', 'Anhui Province', 'provincial', 'China', 3),
  ('上海市', 'Shanghai', 'provincial', 'China', 4),
  ('云南省', 'Yunnan Province', 'provincial', 'China', 5),
  ('广东省', 'Guangdong Province', 'provincial', 'China', 6),
  ('内蒙古自治区', 'Inner Mongolia', 'provincial', 'China', 7);

-- Contact email pending client confirmation (old site mixes three addresses).
insert into public.site_settings (key, value) values
  ('contact', jsonb_build_object(
    'address_en', 'Level 8, 167–169 Queen Street, Melbourne VIC 3000',
    'address_zh', '澳大利亚墨尔本 Queen Street 167–169 号 8 层，VIC 3000',
    'phone', '+61 3 9640 0566',
    'email', 'info@obci.org.au',
    'email_confirmed', false
  )),
  ('identity', jsonb_build_object(
    'name_en', 'Oceania Business Association Incorporated',
    'name_zh', '大洋洲工商协会',
    'acronym', 'OBCI',
    'tagline_en', 'Bridging Oceania and China, Empowering Business Growth',
    'tagline_zh', '搭建中澳桥梁，赋能商业成长'
  )),
  ('membership', jsonb_build_object(
    'review_days', 5,
    'fees_published', false
  ));

insert into public.navigation_items (menu, label_zh, label_en, href, display_order) values
  ('header', '首页', 'Home', '/', 1),
  ('header', '关于协会', 'About', '/about', 2),
  ('header', '行业分会', 'Chapters', '/chapters', 3),
  ('header', '资讯中心', 'News', '/news', 4),
  ('header', '活动展会', 'Events', '/events', 5),
  ('header', '会员服务', 'Membership', '/membership', 6),
  ('header', '联系我们', 'Contact', '/contact', 7),
  ('footer', '在线入会', 'Apply for Membership', '/membership/apply', 1),
  ('footer', '资讯中心', 'News & Insights', '/news', 2),
  ('footer', '活动展会', 'Events', '/events', 3),
  ('footer', '联系我们', 'Contact', '/contact', 4);

-- The two real events recovered from the audit (both past).
insert into public.events
  (slug, title_zh, title_en, summary_zh, summary_en, location_zh, location_en,
   starts_at, ends_at, status, is_featured) values
  ('world-traditional-medicine-forum-2025',
   '第七届世界传统医药论坛暨世界中医药服务贸易联合会大会',
   'The 7th World Traditional Medicine Forum cum World Federation of TCM Trade Services Conference',
   '汇聚全球传统医药与中医药服务贸易领域代表的国际论坛，2025 年 10 月在墨尔本举行。',
   'An international forum bringing together delegates from traditional medicine and TCM trade services worldwide, held in Melbourne in October 2025.',
   '墨尔本', 'Melbourne VIC',
   '2025-10-25T10:00:00+11:00', '2025-10-26T17:00:00+11:00',
   'published', true),
  ('agm-2026',
   '2026 年度会员大会',
   '2026 Annual General Meeting',
   '协会 2026 年度会员大会在墨尔本世贸中心举行，宣布成立六个专业委员会。',
   'The association''s 2026 Annual General Meeting at the World Trade Centre Melbourne, launching six new professional committees.',
   '墨尔本世贸中心', 'World Trade Centre Melbourne',
   '2026-05-01T10:00:00+10:00', '2026-05-01T17:00:00+10:00',
   'published', false);
