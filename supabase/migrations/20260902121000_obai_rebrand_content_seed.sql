-- 008 · OBCI rebrand + 2026 organisation / content seed (data-only, additive)
-- STATUS: applied to the remote project on 2026-09-10 (launch), as migration
-- obci_rebrand_content_seed, after
-- 20260902120000_application_form_v2.sql (schema first, then this data:
-- industry_chapters.deputy_secretary_general, the widened
-- leadership.group_key CHECK and events.tags are all used below).
-- PRECONDITION: as for 007 — the six 20260827* remote migrations must be
-- mirrored locally (`supabase db pull`) before this chain is replayed
-- anywhere other than the current remote project.
--
-- Sources: the WeChat "ABOUT US" text and the 2026 committee / council
-- roster, the English brochure (2026-09) and the 2026 AGM article. Values
-- the chamber has not supplied are left EMPTY (never invented). Every
-- statement is idempotent (update … where slug / name_en; insert … on
-- conflict / where not exists) and nothing is deleted:
--  * identity and contact settings are MERGED (other keys keep their
--    values; the remote tagline is untouched);
--  * content blocks are upserted by key, except `review`, which is only
--    initialised when absent so an existing confirmation is never reset;
--  * the nine professional committees are UPDATEs of existing rows;
--    study-migration is archived via is_active=false (recoverable);
--  * leadership rows are regrouped / retitled by name_en; new officers are
--    inserted only when no row of that name_en exists;
--  * ABS service item lists are trimmed to the DOCX-confirmed entries (§5);
--  * news / events: chapter tags, one category re-assignment and one past
--    event (§9), all by slug.

-- 1 · Brand identity → OBCI: 大洋洲工商业委员会 / Oceania Business Council
--     (public-facing copy). legal_name_zh/en, registration_no, abn, acn,
--     website, subtitle_* and the remote tagline (连接世界 · 赋能商业 /
--     "Connecting the world, empowering business") are untouched — the
--     merge below writes only the three keys it names.
update public.site_settings
set value = value || jsonb_build_object(
  'acronym', 'OBCI',
  'name_zh', '大洋洲工商业委员会',
  'name_en', 'Oceania Business Council'
)
where key = 'identity';

-- 2 · Contact: the membership-enquiries contact is Meggie Liu (spelling per
--     the 2026 roster; phone 0430 598 528 unchanged, owner-confirmed
--     2026-08-27 for the same person). Every other value is kept.
--     Every detail published here is one the council prints in its own 2026
--     English brochure (head office, telephone, email, membership
--     enquiries), so the whole set is marked confirmed for launch; the admin
--     settings page can un-tick any field to withdraw it again.
update public.site_settings
set value = value || jsonb_build_object('membership_contact_name', 'Meggie Liu')
where key = 'contact';

update public.site_settings
set value = value || jsonb_build_object(
  'confirmed_fields',
  jsonb_build_array('address', 'address2', 'phone', 'fax', 'email', 'wechat', 'membership_contact')
)
where key = 'contact';

-- 3 · Content blocks (fixed-shape site_settings keys; editable in the admin
--     settings module). vision / mission / core_values from the WeChat
--     "ABOUT US" text; objectives / member_benefits / outlook from the
--     English brochure (English verbatim, Chinese translated);
--     org_structure / council / secretariat from the 2026 roster. English
--     translations of Chinese sources are marked as such in the docs.
--     strategy_committee is NOT seeded (no source in the 2026 material;
--     the key stays optional and its module hidden).
insert into public.site_settings (key, value) values
(
  'vision',
  jsonb_build_object(
    'text_zh', '打造连接澳大利亚、大洋洲、中国及亚太地区最具影响力的国际商务合作平台。通过政府合作、产业联动、资源整合及国际商务，帮助企业跨越国界，实现全球化发展，共同推动区域经济繁荣。',
    'text_en', 'To build the most influential platform for international business cooperation connecting Australia, Oceania, China and the Asia-Pacific — helping businesses cross borders and grow globally through government cooperation, industry linkages, resource integration and international commerce, and driving shared regional prosperity.'
  )
),
(
  'mission',
  jsonb_build_object(
    'text_zh', '帮助企业更加高效地走向国际市场。提供国际政商资源链接、国际贸易与投资促进、市场准入及商业拓展、政策解读与市场资讯、行业合作平台、专业咨询服务，帮助企业降低出海门槛，减少市场风险，加快国际化发展步伐。',
    'text_en', 'To help businesses reach international markets more efficiently — connecting them with government and business resources, promoting trade and investment, supporting market entry and business development, interpreting policy and market intelligence, providing industry cooperation platforms and professional advisory services, so that companies face lower barriers, less market risk and a faster path to internationalisation.'
  )
),
(
  'core_values',
  jsonb_build_object('items', jsonb_build_array(
    jsonb_build_object(
      'title_zh', '合作', 'title_en', 'COLLABORATION',
      'text_zh', '资源共享，合作共赢，共同创造更大的商业价值。',
      'text_en', 'Share resources, cooperate for mutual benefit and create greater business value together.'
    ),
    jsonb_build_object(
      'title_zh', '诚信', 'title_en', 'INTEGRITY',
      'text_zh', '坚持诚信、专业、透明，建立长期互信的合作关系。',
      'text_en', 'Uphold integrity, professionalism and transparency to build long-term relationships of trust.'
    ),
    jsonb_build_object(
      'title_zh', '创新', 'title_en', 'INNOVATION',
      'text_zh', '以创新思维推动国际商业合作模式不断升级。',
      'text_en', 'Use innovative thinking to keep upgrading models of international business cooperation.'
    ),
    jsonb_build_object(
      'title_zh', '可持续发展', 'title_en', 'SUSTAINABILITY',
      'text_zh', '促进经济、社会与产业共同繁荣，实现长期可持续发展。',
      'text_en', 'Promote shared prosperity across the economy, society and industry for long-term sustainable development.'
    )
  ))
),
(
  -- Brochure "Main objectives" (English verbatim).
  'objectives',
  jsonb_build_object('items', jsonb_build_array(
    jsonb_build_object('text_zh', '定期在澳大利亚、中国及大洋洲各国举办商务活动，促进会员间的多边商业往来', 'text_en', 'Organize business events and activities regularly in Australia, China and Oceania countries to promote multilateral business for Association''s members'),
    jsonb_build_object('text_zh', '为会员提供信息服务，包括行业政策动态与趋势更新', 'text_en', 'Provide information program services including updating industrial policy news and trends to members'),
    jsonb_build_object('text_zh', '通过专项服务支持并协助会员实现商业目标', 'text_en', 'Support and help members to reach business interests by providing special services'),
    jsonb_build_object('text_zh', '为会员提供人脉拓展与商务社交机会', 'text_en', 'Provide networking opportunities to members'),
    jsonb_build_object('text_zh', '支持澳大利亚商业利益在其他国家的推广；举办活动联结企业决策者', 'text_en', 'Support the promotion of Australia''s commercial interests in other countries; host events to connect decision makers of businesses')
  ))
),
(
  -- Brochure page 3 (English verbatim; "OBC" → "the council").
  'outlook',
  jsonb_build_object(
    'title_zh', '2025 年回顾与 2026 年展望',
    'title_en', '2025 in review and the outlook for 2026',
    'paragraphs', jsonb_build_array(
      jsonb_build_object(
        'text_zh', '2025 年，我们的代表团访华取得了丰硕成果。代表团先后走访北京、上海、浙江、安徽、江苏等重点经济区域，与地方政府及重要机构签署了多项战略合作协议。此行不仅成功推介了我们在墨尔本的旗舰活动——澳中大健康产业博览会，还达成了超过人民币 1 亿元的合作意向，充分展现了我们整合高层资源、推动实质成果的能力。',
        'text_en', 'In 2025, our delegation''s visit to China delivered remarkable results. We engaged with key economic regions including Beijing, Shanghai, Zhejiang, Anhui, and Jiangsu, signing multiple strategic cooperation agreements with local governments and major institutions. The visit not only successfully promoted our flagship event in Melbourne — the Australia–China Health Industry Expo — but also generated cooperation intentions exceeding RMB 100 million, demonstrating our strong capability to integrate high-level resources and drive tangible outcomes.'
      ),
      jsonb_build_object(
        'text_zh', '展望 2026 年，我们的方向十分清晰：致力于将澳中大健康产业博览会打造为亚太地区一流的行业平台；继续举办高层闭门论坛与高管交流活动，培育值得信赖的商业圈层；稳步推进苏州「大洋洲产业园」建设，为会员进入中国市场提供战略门户与实体平台。依托结构化的四级会员体系，我们为各类规模的企业提供精准对接与量身定制的合作方案。',
        'text_en', 'Looking ahead to 2026, our direction is clear. We will dedicate ourselves to elevating the Australia–China Health Industry Expo into a premier Asia-Pacific industry platform; continue hosting high-level closed-door forums and executive networking events to cultivate trusted business circles; and steadily advance the development of the "Oceania Industrial Park" in Suzhou, providing members with a strategic gateway and physical platform for entering the Chinese market. Through our structured four-tier membership system, we deliver targeted connections and tailored partnership solutions for enterprises of all sizes.'
      ),
      jsonb_build_object(
        'text_zh', '无论是拓展大洋洲市场，还是布局亚太地区，委员会都已准备就绪——凭借成熟的网络与高效的执行力，成为您开拓增长新领域的长期可信赖伙伴。',
        'text_en', 'Whether expanding into Oceania or positioning across the Asia-Pacific, the council stands ready — with a proven network and efficient execution — to be your trusted long-term partner in unlocking new frontiers of growth.'
      )
    )
  )
),
(
  -- DOCX four pillars; pillar 2 no longer counts the committees.
  'pillars',
  jsonb_build_object('items', jsonb_build_array(
    jsonb_build_object(
      'title_zh', '政商资源支撑', 'title_en', 'Government & business resources',
      'text_zh', '澳洲前议员、前贸易部长、墨尔本前市长等荣誉顾问团，州政府合作渠道与高层供需闭门会。',
      'text_en', 'An honorary advisory council of former Australian parliamentarians, a former federal trade minister and a former Lord Mayor of Melbourne, with state-government channels and executive closed-door sessions.'
    ),
    jsonb_build_object(
      'title_zh', '行业垂直赋能', 'title_en', 'Industry verticals',
      'text_zh', '各专业分会与专家顾问团，细分赛道精准对接。',
      'text_en', 'Professional committees and expert advisers, matching businesses precisely within their sectors.'
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
  -- Brochure "Member Benefits" (English verbatim; "OBC" → "the council").
  'member_benefits',
  jsonb_build_object('items', jsonb_build_array(
    jsonb_build_object('text_zh', '为澳大利亚会员在大洋洲各国的多个城市提供多项服务，满足其海外业务需求', 'text_en', 'Various services are provided to Australia based members in many cities in Oceania countries to meet their overseas business needs'),
    jsonb_build_object('text_zh', '协助其他国家的企业与澳大利亚本地商业资源建立有效合作', 'text_en', 'To help other countries'' businesses have effective partnerships with Australian local business resources'),
    jsonb_build_object('text_zh', '会员参加委员会的全部活动享受优惠', 'text_en', 'Discounts for members to attend all the council''s events'),
    jsonb_build_object('text_zh', '会员将在委员会官网列示，供其他会员及商业客户查阅', 'text_en', 'Members will be listed on the council''s website for other members and business clients to review'),
    jsonb_build_object('text_zh', '会员可享受其他会员企业提供的优惠价格', 'text_en', 'Members can get discounted prices from other members'' businesses'),
    jsonb_build_object('text_zh', '通过协会平台获取最新的行业商业信息', 'text_en', 'Access to updated industry-focused business information through the association''s platform')
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
  -- Banner 1 = the vision (first sentence as title). Banners 2/3 stay
  -- absent until the chamber provides artwork, copy and destinations.
  'banners',
  jsonb_build_object('items', jsonb_build_array(
    jsonb_build_object(
      'key', 'vision', 'is_active', true, 'image_path', null,
      'title_zh', '打造连接澳大利亚、大洋洲、中国及亚太地区最具影响力的国际商务合作平台',
      'title_en', 'Building the most influential platform for international business cooperation connecting Australia, Oceania, China and the Asia-Pacific',
      'text_zh', '通过政府合作、产业联动、资源整合及国际商务，帮助企业跨越国界，实现全球化发展，共同推动区域经济繁荣。',
      'text_en', 'Helping businesses cross borders and grow globally through government cooperation, industry linkages, resource integration and international commerce — and driving shared regional prosperity.',
      'cta_label_zh', '加入我们', 'cta_label_en', 'Join OBCI',
      'cta_href', '/membership/apply'
    ),
    jsonb_build_object(
      'key', 'committees', 'is_active', true,
      'image_path', '/news-media/oceania-business-council-2026-agm-melbourne/02.jpg',
      'title_zh', '九大专业分会，以赛道为纽带对接资源',
      'title_en', 'Nine professional committees, connecting resources sector by sector',
      'text_zh', '教育、建筑、地产、高端人才与博士创新、商业服务、堪培拉、文化交流与艺术发展、科技创新创业、大健康产业。',
      'text_en', 'Education, construction, real estate, high-level talent and doctoral innovation, business services, Canberra, cultural exchange and the arts, innovation and entrepreneurship, and the health industry.',
      'cta_label_zh', '浏览专业分会', 'cta_label_en', 'Browse the committees',
      'cta_href', '/chapters'
    ),
    jsonb_build_object(
      'key', 'membership', 'is_active', true, 'image_path', null,
      'title_zh', '五级会员体系，为不同规模的企业提供对接与服务',
      'title_en', 'Five membership tiers, matched to companies of every size',
      'text_zh', '会员享有大洋洲各城市服务窗口、官网名录展示、活动参会优惠、政策与市场资讯推送，以及政商资源对接。',
      'text_en', 'Members gain service points across Oceania cities, a listing in the online member directory, discounted access to events, policy and market briefings, and introductions across government and business.',
      'cta_label_zh', '查看会员权益', 'cta_label_en', 'Membership benefits',
      'cta_href', '/membership'
    )
  ))
),
(
  -- 2026 roster: five units, no personnel (the chapters unit expands to the
  -- active industry_chapters rows at render time).
  'org_structure',
  jsonb_build_object('items', jsonb_build_array(
    jsonb_build_object('key', 'executive', 'kind', 'leadership', 'name_zh', '执委会', 'name_en', 'Executive Committee', 'note_zh', '', 'note_en', ''),
    jsonb_build_object('key', 'honorary', 'kind', 'leadership', 'name_zh', '荣誉主席与荣誉顾问', 'name_en', 'Honorary Patrons', 'note_zh', '', 'note_en', ''),
    jsonb_build_object('key', 'council', 'kind', 'other', 'name_zh', '执委会议员', 'name_en', 'Councillors', 'note_zh', '', 'note_en', ''),
    jsonb_build_object('key', 'secretariat', 'kind', 'secretariat', 'name_zh', '秘书处', 'name_en', 'Secretariat', 'note_zh', '', 'note_en', ''),
    jsonb_build_object('key', 'chapters', 'kind', 'chapters', 'name_zh', '各专业分会', 'name_en', 'Professional Committees', 'note_zh', '', 'note_en', '')
  ))
),
(
  -- 2026 council roster (执委会议员), in roster order. name_zh = name_en
  -- where the roster gives no Chinese name.
  'council',
  jsonb_build_object(
    'title_zh', '执委会议员',
    'title_en', 'Councillors',
    'members', jsonb_build_array(
      jsonb_build_object('name_en', 'Hon. Bruce Atkinson AM', 'name_zh', '布鲁斯·阿特金森', 'note_en', '', 'note_zh', ''),
      jsonb_build_object('name_en', 'Hon. Ken Smith AM', 'name_zh', '肯·史密斯', 'note_en', '', 'note_zh', ''),
      jsonb_build_object('name_en', 'Sunny Sun', 'name_zh', '孙国照'),
      jsonb_build_object('name_en', 'Frank Perre', 'name_zh', 'Frank Perre'),
      jsonb_build_object('name_en', 'Angela Liu', 'name_zh', '刘芷均'),
      jsonb_build_object('name_en', 'Diana Lin', 'name_zh', '林丹'),
      jsonb_build_object('name_en', 'Sheryl Leigh', 'name_zh', 'Sheryl Leigh'),
      jsonb_build_object('name_en', 'James Li', 'name_zh', '李俊'),
      jsonb_build_object('name_en', 'Joanne Chen', 'name_zh', 'Joanne Chen'),
      jsonb_build_object('name_en', 'Georgia Qiao', 'name_zh', '乔亚楠'),
      jsonb_build_object('name_en', 'Bryan Guan', 'name_zh', '关星明'),
      jsonb_build_object('name_en', 'Steven Kakoliris', 'name_zh', 'Steven Kakoliris'),
      jsonb_build_object('name_en', 'Lisa Li', 'name_zh', '李霁'),
      jsonb_build_object('name_en', 'Diana Chen', 'name_zh', 'Diana Chen'),
      jsonb_build_object('name_en', 'Jing Liu', 'name_zh', '刘京'),
      jsonb_build_object('name_en', 'Yang Li', 'name_zh', '李杨'),
      jsonb_build_object('name_en', 'Jessica Xu', 'name_zh', '徐冰心'),
      jsonb_build_object('name_en', 'Albert Zhao', 'name_zh', '赵松亮'),
      jsonb_build_object('name_en', 'Meggie Liu', 'name_zh', 'Meggie Liu')
    )
  )
),
(
  'secretariat',
  jsonb_build_object(
    'text_zh', '秘书处设秘书长 Frank Perre、Sheryl Leigh，副秘书长 Jing Liu 刘京、Maggie Zhang 张金淼、Jessica Xu 徐冰心、Daisy Song 宋雨檀。',
    'text_en', 'The Secretariat comprises Secretaries-General Frank Perre and Sheryl Leigh, and Deputy Secretaries-General Jing Liu, Maggie Zhang, Jessica Xu and Daisy Song.'
  )
),
(
  -- Gallery: only media the association has already published on its own
  -- site (cover images of published news/event rows). Captions and links
  -- resolve from those rows at render time. Six items, no duplicates (the
  -- AGM is represented by its event cover, item 1).
  'gallery',
  jsonb_build_object('items', jsonb_build_array(
    jsonb_build_object('image_path', 'events/agm-2026.jpg', 'event_slug', 'agm-2026'),
    jsonb_build_object('image_path', 'events/world-traditional-medicine-forum-2025.jpg', 'event_slug', 'world-traditional-medicine-forum-2025'),
    jsonb_build_object('image_path', 'news/taizhou-delegation-visits-melbourne-cooperation.jpg', 'news_slug', 'taizhou-delegation-visits-melbourne-cooperation'),
    jsonb_build_object('image_path', 'news/obc-delegation-visits-liaoning-ccpit.jpg', 'news_slug', 'obc-delegation-visits-liaoning-ccpit'),
    jsonb_build_object('image_path', 'news/7th-world-traditional-medicine-forum-melbourne.jpg', 'news_slug', '7th-world-traditional-medicine-forum-melbourne'),
    jsonb_build_object('image_path', 'news/acbca-chinese-new-year-networking-event.jpg', 'news_slug', 'acbca-chinese-new-year-networking-event')
  ))
)
on conflict (key) do update set value = excluded.value;

-- Publication gates. Both keys are merged onto whatever the CMS already
-- holds, so unrelated fields survive. The partner wall is published: every
-- row is a body the council has publicly signed an agreement with, and the
-- 2026 news reports name them.
insert into public.site_settings (key, value) values
  ('review', jsonb_build_object('confirmed_modules', jsonb_build_array('partners'))),
  -- Published website policies. The terms of service, privacy policy and
  -- accessibility statement ship with the site. The constitution is the
  -- association's own governing document, issued by the secretariat on
  -- request (see /constitution) exactly as on the paper application form, so
  -- it carries no published version stamp.
  ('legal', jsonb_build_object(
    'terms_version', '2026-09',
    'privacy_version', '2026-09',
    'accessibility_version', '2026-09'
  ))
on conflict (key) do update set value = public.site_settings.value || excluded.value;

-- 4 · Membership tier names per the 2026 English brochure (owner decision
--     D8, 2026-09-10): Corporate Member / Large Company Member / Medium
--     Company Member / Small Company Member / Individual Member. Chinese
--     names: top tier 企业顶级会员 (DOCX), fourth tier 小型企业会员
--     (owner-confirmed 2026-09-02/03; the DOCX table uses a different
--     Chinese wording — see docs/preview-to-production-matrix.md row 12),
--     individual threshold 自然人创业者 (DOCX). The small tier's first
--     benefit loses its brand reference (that array element is replaced in
--     place; every other benefit is untouched). Fees and turnover bands
--     already match. Mirrored by FIXTURE_MEMBERSHIP_NAME_OVERRIDES.
update public.membership_types
set name_zh = '企业顶级会员',
    name_en = 'Corporate Member'
where code = 'corporate-group';

update public.membership_types
set name_en = 'Large Company Member'
where code = 'large';

update public.membership_types
set name_en = 'Medium Company Member'
where code = 'medium';

update public.membership_types
set name_zh = '小型企业会员',
    name_en = 'Small Company Member'
where code = 'small';

update public.membership_types
set name_en = 'Individual Member',
    turnover_zh = '自然人创业者'
where code = 'individual';

update public.membership_types
set benefits_zh = array_replace(benefits_zh, 'OBC 官网名录展示', '官网会员名录展示'),
    benefits_en = array_replace(
      benefits_en,
      'Listing in the OBC online member directory',
      'Listing in the online member directory'
    )
where 'OBC 官网名录展示' = any (benefits_zh)
   or 'Listing in the OBC online member directory' = any (benefits_en);

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

-- 6 · Nine professional committees (2026 WeChat roster, owner decision D2):
--     names, secretaries-general and order are set on the nine EXISTING
--     rows (secretary_general stored "Latin 中文" exactly as the roster).
--     Taglines, introductions, resources and services are live content and
--     are NOT touched; the fixture mirror (src/lib/fixtures/design-review.ts)
--     carries the same text. study-migration (留学移民分会) is not in the
--     roster and is archived (is_active=false, recoverable).
update public.industry_chapters set name_zh = '教育分会', name_en = 'Education Committee', secretary_general = 'Yang Li 李扬', deputy_secretary_general = null, display_order = 1, is_active = true where slug = 'education';
update public.industry_chapters set name_zh = '建筑分会', name_en = 'Construction Committee', secretary_general = 'Bryan Guan 关星明', deputy_secretary_general = 'Steven Yeung', display_order = 2, is_active = true where slug = 'construction';
update public.industry_chapters set name_zh = '地产分会', name_en = 'Real Estate Committee', secretary_general = 'Diana Chen', deputy_secretary_general = null, display_order = 3, is_active = true where slug = 'real-estate';
update public.industry_chapters set name_zh = '高端人才与博士创新分会', name_en = 'High-Level Talent & Doctoral Innovation Committee', secretary_general = 'Arina Tang 唐彩焱', deputy_secretary_general = null, display_order = 4, is_active = true where slug = 'talent-innovation';
update public.industry_chapters set name_zh = '商业服务分会', name_en = 'Business Services Committee', secretary_general = 'Albert Zhao 赵松亮', deputy_secretary_general = null, display_order = 5, is_active = true where slug = 'business-services';
update public.industry_chapters set name_zh = '堪培拉分会', name_en = 'Canberra Branch', secretary_general = 'Ding Ding 丁玎', deputy_secretary_general = null, display_order = 6, is_active = true where slug = 'canberra-branch';
update public.industry_chapters set name_zh = '文化交流与艺术发展分会', name_en = 'Cultural Exchange and Arts Development Committee', secretary_general = 'Emily Xiao Wang 王𣇈', deputy_secretary_general = null, display_order = 7, is_active = true where slug = 'culture-arts';
update public.industry_chapters set name_zh = '科技创新创业分会', name_en = 'Innovation and Entrepreneurship Committee', secretary_general = 'Henry Yang 杨衡', deputy_secretary_general = null, display_order = 8, is_active = true where slug = 'tech-innovation';
update public.industry_chapters set name_zh = '大健康产业分会', name_en = 'Health Industry Committee', secretary_general = 'Chelsea Che 车蕎溪', deputy_secretary_general = null, display_order = 9, is_active = true where slug = 'health';

-- English introductions call each unit a "Chapter"; the 2026 roster names
-- them committees, so the word is corrected in place (targeted replace, not
-- a rewrite, so any later CMS edit of the copy survives). The fixture mirror
-- carries exactly the same result. Canberra Branch keeps its own wording.
update public.industry_chapters
set description_en = replace(replace(description_en, 'Chapter', 'Committee'), ' chapter ', ' committee ')
where slug in (
  'education', 'construction', 'real-estate', 'talent-innovation',
  'business-services', 'culture-arts', 'tech-innovation', 'health'
)
  and description_en is not null;

update public.industry_chapters
set is_active = false
where slug = 'study-migration';

-- 7 · Leadership (2026-09 brochure + roster). The seven existing rows are
--     regrouped / retitled by name_en (bios and portraits kept; Sunny Sun's
--     bio drops the "OBC" brand token). Eight new officers are inserted
--     with no bio and no portrait (the chamber has supplied none), and only
--     when no row of that name_en exists. Public groups: executive →
--     honorary → secretariat (display_order restarts within each group).
--     Bruce Atkinson: remote 理事会主席 / Chairman of the Board (vice_chair)
--     → 会长 / President per the brochure and the AGM article. The roster
--     also writes "Hon. chairman 主席" and the AGM article records a
--     "理事会荣誉主席" certificate — pending chamber confirmation (see
--     docs/preview-to-production-matrix.md).
update public.leadership set name_zh = '布鲁斯·阿特金森', title_zh = '会长', title_en = 'President', group_key = 'executive', display_order = 1, is_active = true where name_en = 'Hon. Bruce Atkinson AM';
update public.leadership set name_zh = '孙国照', title_zh = '执行会长', title_en = 'Executive President', group_key = 'executive', display_order = 2, is_active = true,
  bio_zh = '主管委员会整体战略运营与市场拓展，深耕中澳商贸领域多年，推动多项重大合作落地。',
  bio_en = 'Leads the council''s strategy, operations and market development. Long experience in Australia–China trade, with a track record of landing major cooperation agreements.'
  where name_en = 'Sunny Sun';
update public.leadership set name_zh = '林丹', title_zh = '董事副会长', title_en = 'Vice Chair of the Board', group_key = 'executive', display_order = 4, is_active = true where name_en = 'Diana Lin';
update public.leadership set name_zh = '肯·史密斯', title_zh = '创会会长 · 荣誉主席', title_en = 'Founding President · Honorary Patron', group_key = 'honorary', display_order = 1, is_active = true where name_en = 'The Hon Ken Smith AM';
update public.leadership set name_zh = '安德鲁·罗布', title_zh = '荣誉主席', title_en = 'Honorary Patron', group_key = 'honorary', display_order = 2, is_active = true where name_en = 'The Hon Andrew Robb AO';
update public.leadership set name_zh = '苏震西', title_zh = '名誉主席', title_en = 'Honorary Patron', group_key = 'honorary', display_order = 3, is_active = true where name_en = 'John Chun Sai So AO';
update public.leadership set name_zh = '乔治·谭姆巴西斯', title_zh = '名誉主席', title_en = 'Honorary Patron', group_key = 'honorary', display_order = 4, is_active = true where name_en = 'George Tambassis';

insert into public.leadership (name_zh, name_en, title_zh, title_en, group_key, display_order, is_active)
select v.name_zh, v.name_en, v.title_zh, v.title_en, v.group_key, v.display_order, true
from (values
  ('刘芷均',     'Angela Liu',   '常务副会长', 'Executive Vice President',  'executive',   3),
  ('李俊',       'James Li',     '董事副会长', 'Vice Chair of the Board',   'executive',   5),
  ('Frank Perre', 'Frank Perre', '秘书长',     'Secretary-General',         'secretariat', 1),
  ('Sheryl Leigh', 'Sheryl Leigh', '秘书长',   'Secretary-General',         'secretariat', 2),
  ('刘京',       'Jing Liu',     '副秘书长',   'Deputy Secretary-General',  'secretariat', 3),
  ('张金淼',     'Maggie Zhang', '副秘书长',   'Deputy Secretary-General',  'secretariat', 4),
  ('徐冰心',     'Jessica Xu',   '副秘书长',   'Deputy Secretary-General',  'secretariat', 5),
  ('宋雨檀',     'Daisy Song',   '副秘书长',   'Deputy Secretary-General',  'secretariat', 6)
) as v (name_zh, name_en, title_zh, title_en, group_key, display_order)
where not exists (
  select 1 from public.leadership l where l.name_en = v.name_en
);

-- 8 · Leadership portraits: the existing portrait_path values referenced
--     storage objects that were never uploaded (broken images on the live
--     site today). The six official portraits from the handbook ship with
--     the repository under public/portraits/, so the rows point at those
--     paths: a leading slash makes imageUrl() resolve them as site assets
--     (deployment base path applied) instead of media-bucket objects.
--     Portraits uploaded later through the CMS keep using storage paths.
update public.leadership set portrait_path = '/portraits/bruce-atkinson.jpg' where name_en = 'Hon. Bruce Atkinson AM';
update public.leadership set portrait_path = '/portraits/ken-smith.jpg' where name_en = 'The Hon Ken Smith AM';
update public.leadership set portrait_path = '/portraits/andrew-robb.jpg' where name_en = 'The Hon Andrew Robb AO';
update public.leadership set portrait_path = '/portraits/john-so.jpg' where name_en = 'John Chun Sai So AO';
update public.leadership set portrait_path = '/portraits/george-tambassis.jpg' where name_en = 'George Tambassis';
update public.leadership set portrait_path = '/portraits/sunny-sun.jpg' where name_en = 'Sunny Sun';

-- 9 · News / events data for launch (all by slug; events.tags exists once
--     007 has run):
--     * the three existing health-industry articles are tagged with the
--       Health Industry Committee slug;
--     * two council activity reports move from the legacy trade-cooperation
--       category to association-news (editorial decision pending chamber
--       objection; 009 flags trade-cooperation as legacy). No-op when the
--       target category does not exist;
--     * the 2025 World Traditional Medicine Forum event gets the same tag;
--     * one past event from the 2025 WeChat report is added (no cover
--       image, no body; skipped when the slug already exists).
update public.news
set tags = array['health']
where slug in (
  '7th-world-traditional-medicine-forum-melbourne',
  'world-traditional-medicine-forum-preparatory-meeting',
  'melbourne-australia-china-health-expo-tcm-forum-2025'
);

update public.news n
set category_id = c.id
from public.news_categories c
where c.slug = 'association-news'
  and n.slug in (
    'taizhou-delegation-visits-melbourne-cooperation',
    'obc-delegation-visits-liaoning-ccpit'
  );

update public.events
set tags = array['health']
where slug = 'world-traditional-medicine-forum-2025';

insert into public.events (
  slug, title_zh, title_en, summary_zh, summary_en, location_zh, location_en,
  starts_at, ends_at, status, is_featured, registration_open, tags
) values (
  'tcm-health-industry-reception-2025',
  '中医药大健康产业推荐会暨工商会年中酒会',
  'TCM & Health Industry Promotion Meeting and Mid-Year Reception',
  '2025 年 8 月 8 日于墨尔本世贸中心举行，澳中各界嘉宾 200 余人出席。',
  'Held at World Trade Centre Melbourne on 8 August 2025 with more than 200 guests from the Australian and Chinese communities.',
  '墨尔本世贸中心',
  'World Trade Centre Melbourne',
  '2025-08-08T18:00:00+10:00',
  null,
  'published',
  false,
  false,
  array['health']
)
on conflict (slug) do nothing;
