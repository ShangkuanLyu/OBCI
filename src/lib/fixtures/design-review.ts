import type { Tables } from "@/types/database.types";

/**
 * Design-review fixtures for content whose remote rows have not been
 * seeded/updated yet (pending the approved data migration).
 *
 * Isolation contract:
 * - Only active when NEXT_PUBLIC_DESIGN_FIXTURES=1 is set at build time.
 *   Production/CI builds never set the flag, so these values can never
 *   reach the public data path of a normal build.
 * - Every string here is taken verbatim (or as a close paraphrase) from
 *   the approved redesign DOCX, or names a real, already-published
 *   content row. Nothing here is invented chamber copy: industry taglines,
 *   industry introductions, mission, core values and contact details are
 *   deliberately ABSENT until the chamber supplies them.
 * - English strings are draft translations pending review.
 * - After the approved data migration seeds the same content into Supabase,
 *   the remote rows become the single source of truth and this file is
 *   inert (flag off).
 *
 * Provenance of each export is recorded in
 * docs/preview-to-production-matrix.md.
 */
export function designFixturesEnabled(): boolean {
  return process.env.NEXT_PUBLIC_DESIGN_FIXTURES === "1";
}

/* ------------------------------------------------------------------ */
/* Content blocks (site_settings keys pending seed)                    */
/* ------------------------------------------------------------------ */

/** DOCX §模块一 · 官方愿景 (verbatim). */
export const FIXTURE_VISION = {
  text_zh:
    "搭建中澳及大洋洲多边商业互通枢纽，赋能中国企业轻资产出海、澳洲企业拓展亚太市场，打造政商资源一体化、全链路合规落地的跨境商贸服务平台。",
  text_en:
    "To build a multilateral business hub linking China, Australia and Oceania — enabling Chinese enterprises to go global asset-light and Australian businesses to expand into the Asia-Pacific, on a cross-border trade platform that unites government and business resources with end-to-end compliant delivery.",
};

/** DOCX §模块一 · 四大实践支柱 (verbatim). */
export const FIXTURE_PILLARS = [
  {
    title_zh: "政商资源支撑",
    title_en: "Government & business resources",
    text_zh:
      "澳洲前议员、前贸易部长、墨尔本前市长等荣誉顾问团，州政府合作渠道与高层供需闭门会。",
    text_en:
      "An honorary advisory council of former Australian parliamentarians, a former federal trade minister and a former Lord Mayor of Melbourne, with state-government channels and executive closed-door sessions.",
  },
  {
    title_zh: "行业垂直赋能",
    title_en: "Industry verticals",
    text_zh: "六大行业分会与专家顾问团，细分赛道精准对接。",
    text_en:
      "Six industry chapters and expert advisers, matching businesses precisely within their sectors.",
  },
  {
    title_zh: "一站式出海服务（ABS）",
    title_en: "One-stop market entry (ABS)",
    text_zh: "合规准入、市场渠道、全澳售后、资本扶持，全链路落地执行。",
    text_en:
      "Compliance and market entry, channels, nationwide aftersales and capital support — executed end to end.",
  },
  {
    title_zh: "会员生态网络",
    title_en: "Member ecosystem",
    text_zh: "全球会员名录、资源匹配、活动对接与政策资讯推送。",
    text_en:
      "A global member directory with resource matching, event access and policy intelligence.",
  },
];

/** DOCX §模块三 · 基础会员通用权益 (verbatim). */
export const FIXTURE_MEMBER_BENEFITS = [
  {
    text_zh: "全大洋洲城市线下服务窗口",
    text_en: "In-person service desks across Oceania's major cities",
  },
  {
    text_zh: "会员名录线上曝光",
    text_en: "Online exposure in the member directory",
  },
  {
    text_zh: "会员间交易折扣",
    text_en: "Member-to-member trading discounts",
  },
  {
    text_zh: "全部活动参会优惠",
    text_en: "Preferential rates for all association events",
  },
  {
    text_zh: "行业政策与市场资讯专属推送",
    text_en: "Dedicated policy and market intelligence briefings",
  },
  {
    text_zh: "中澳企业资源对接与政企决策人对接沙龙",
    text_en:
      "Business resource matching across China and Australia, and salons with government and business decision-makers",
  },
];

/** DOCX §模块三 · 盈利服务模式说明 (verbatim). */
export const FIXTURE_REVENUE_NOTE = {
  text_zh:
    "服务模式说明：固定年费、交易佣金、售后服务利差、认证 / 补贴等专项增值服务费。",
  text_en:
    "Service model: fixed annual membership fees, transaction commissions, aftersales service margins, and fees for specialist value-added services such as certification and grant support.",
};

export type BannerData = {
  key: string;
  title_zh: string;
  title_en: string;
  text_zh: string;
  text_en: string;
  cta_label_zh: string;
  cta_label_en: string;
  cta_href: string;
  image_path: string | null;
  is_active: boolean;
};

/** Banner 1 (DOCX vision) only — Banners 2/3 stay hidden until the chamber
 *  provides real artwork, copy and destinations. */
export const FIXTURE_BANNERS: BannerData[] = [
  {
    key: "vision",
    title_zh: "搭建中澳及大洋洲多边商业互通枢纽",
    title_en: "A multilateral business hub for China, Australia and Oceania",
    text_zh:
      "赋能中国企业轻资产出海、澳洲企业拓展亚太市场——政商资源一体化、全链路合规落地的跨境商贸服务平台。",
    text_en:
      "Empowering Chinese enterprises to go global asset-light and Australian businesses to expand into the Asia-Pacific — uniting government and business resources with end-to-end compliant delivery.",
    cta_label_zh: "加入我们",
    cta_label_en: "Join OBAI",
    cta_href: "/membership/apply",
    image_path: null,
    is_active: true,
  },
];

/* ------------------------------------------------------------------ */
/* Organisational structure — DOCX §模块一 · 组织架构 names only.         */
/* No personnel are attached; the chapters unit expands to live rows.  */
/* ------------------------------------------------------------------ */

export type OrgUnit = {
  key: string;
  name_zh: string;
  name_en: string;
  note_zh: string;
  note_en: string;
  kind: "leadership" | "committee" | "chapters" | "secretariat" | "other";
};

export const FIXTURE_ORG_STRUCTURE: OrgUnit[] = [
  {
    key: "leadership",
    name_zh: "会长、执行会长与荣誉顾问",
    name_en: "Presidents, Executive President and honorary advisers",
    note_zh: "",
    note_en: "",
    kind: "leadership",
  },
  {
    key: "strategy-committee",
    name_zh: "中国企业出海战略委员会",
    name_en: "China Enterprise Going-Global Strategy Committee",
    note_zh: "",
    note_en: "",
    kind: "committee",
  },
  {
    /* DOCX §组织架构 wording "各行业分会": count-free, the node expands to
       whatever chapters are published. */
    key: "chapters",
    name_zh: "各行业分会",
    name_en: "Industry chapters",
    note_zh: "",
    note_en: "",
    kind: "chapters",
  },
  {
    key: "secretariat",
    name_zh: "专业秘书处",
    name_en: "Professional secretariat",
    note_zh: "",
    note_en: "",
    kind: "secretariat",
  },
];

/* ------------------------------------------------------------------ */
/* Gallery — ONLY media already published by the association on its    */
/* own site (storage objects of published news/event rows). Captions   */
/* and links are resolved at render time from those rows, so nothing   */
/* here is invented.                                                    */
/* ------------------------------------------------------------------ */

export type GalleryItem = {
  image_path: string;
  caption_zh: string;
  caption_en: string;
  news_slug: string | null;
  event_slug: string | null;
};

export const FIXTURE_GALLERY: GalleryItem[] = [
  {
    image_path: "events/agm-2026.jpg",
    caption_zh: "",
    caption_en: "",
    news_slug: null,
    event_slug: "agm-2026",
  },
  {
    image_path: "events/world-traditional-medicine-forum-2025.jpg",
    caption_zh: "",
    caption_en: "",
    news_slug: null,
    event_slug: "world-traditional-medicine-forum-2025",
  },
  {
    image_path: "news/taizhou-delegation-visits-melbourne-cooperation.jpg",
    caption_zh: "",
    caption_en: "",
    news_slug: "taizhou-delegation-visits-melbourne-cooperation",
    event_slug: null,
  },
  {
    image_path: "news/obc-delegation-visits-liaoning-ccpit.jpg",
    caption_zh: "",
    caption_en: "",
    news_slug: "obc-delegation-visits-liaoning-ccpit",
    event_slug: null,
  },
  {
    image_path: "news/7th-world-traditional-medicine-forum-melbourne.jpg",
    caption_zh: "",
    caption_en: "",
    news_slug: "7th-world-traditional-medicine-forum-melbourne",
    event_slug: null,
  },
  {
    image_path: "news/acbca-chinese-new-year-networking-event.jpg",
    caption_zh: "",
    caption_en: "",
    news_slug: "acbca-chinese-new-year-networking-event",
    event_slug: null,
  },
];

/* ------------------------------------------------------------------ */
/* DOCX industry chapters (rows pending seed; old chapters pending     */
/* archive). ONLY the DOCX-named industries: taglines, descriptions,   */
/* resources, experts, certifications and per-industry ABS services    */
/* are empty until the chamber supplies them (DOCX: 客户后续提供文字素材). */
/* ------------------------------------------------------------------ */

type ChapterRow = Tables<"industry_chapters">;

/** Chapter columns added by the pending application_form_v2 migration.
 *  Optional on the row type until the generated types are refreshed. */
export type ChapterExtras = {
  experts_zh?: string[];
  experts_en?: string[];
  certifications_zh?: string[];
  certifications_en?: string[];
};

const CHAPTER_DEFAULTS = {
  contact_email: null,
  cover_image_path: null,
  created_at: "2026-09-02T00:00:00Z",
  updated_at: "2026-09-02T00:00:00Z",
  tagline_zh: null,
  tagline_en: null,
  description_en: null,
  description_zh: null,
  is_active: true,
  resources_en: [] as string[],
  resources_zh: [] as string[],
  secretary_general: null,
  services_zh: [] as string[],
  services_en: [] as string[],
  experts_zh: [] as string[],
  experts_en: [] as string[],
  certifications_zh: [] as string[],
  certifications_en: [] as string[],
};

/** English industry names are draft translations pending the chamber's
 *  confirmation (the DOCX names the six industries in Chinese only). */
export const FIXTURE_CHAPTERS: (ChapterRow & ChapterExtras)[] = [
  {
    ...CHAPTER_DEFAULTS,
    id: -1,
    slug: "health-products",
    name_zh: "大健康／健康产品",
    name_en: "Health & Wellness Products",
    display_order: 1,
  },
  {
    ...CHAPTER_DEFAULTS,
    id: -2,
    slug: "new-energy",
    name_zh: "新能源产业",
    name_en: "New Energy",
    display_order: 2,
  },
  {
    ...CHAPTER_DEFAULTS,
    id: -3,
    slug: "building-materials",
    name_zh: "建材基建",
    name_en: "Building Materials & Infrastructure",
    display_order: 3,
  },
  {
    ...CHAPTER_DEFAULTS,
    id: -4,
    slug: "cross-border-ecommerce",
    name_zh: "跨境电商",
    name_en: "Cross-Border E-commerce",
    display_order: 4,
  },
  {
    ...CHAPTER_DEFAULTS,
    id: -5,
    slug: "education-tourism",
    name_zh: "教育文旅",
    name_en: "Education, Culture & Tourism",
    display_order: 5,
  },
  {
    ...CHAPTER_DEFAULTS,
    id: -6,
    slug: "mining-investment",
    name_zh: "矿产投资",
    name_en: "Mining & Resources Investment",
    display_order: 6,
  },
];

/** DEMONSTRATION association only: real published rows shown under the
 *  health chapter in fixture builds so reviewers can see the template with
 *  content. It is an editorial guess the chamber has not confirmed, so it
 *  is NOT written to any migration; the real association is set in the CMS
 *  (news/event tags) once the chamber decides. Production never uses it. */
export const FIXTURE_CHAPTER_NEWS_SLUGS: Record<string, string[]> = {
  "health-products": [
    "melbourne-australia-china-health-expo-tcm-forum-2025",
    "7th-world-traditional-medicine-forum-melbourne",
    "world-traditional-medicine-forum-preparatory-meeting",
  ],
};

export const FIXTURE_CHAPTER_EVENT_SLUGS: Record<string, string[]> = {
  "health-products": ["world-traditional-medicine-forum-2025"],
};

/** Inverse of FIXTURE_CHAPTER_NEWS_SLUGS: article slug → chapter tags. */
export function fixtureNewsTags(slug: string): string[] {
  return Object.entries(FIXTURE_CHAPTER_NEWS_SLUGS)
    .filter(([, slugs]) => slugs.includes(slug))
    .map(([chapter]) => chapter);
}

/* ------------------------------------------------------------------ */
/* ABS service offerings — remote rows exist but their item lists      */
/* include handbook-only extras that are not yet confirmed. Until the  */
/* approved data update trims them, the preview shows the DOCX lists.  */
/* ------------------------------------------------------------------ */

export const FIXTURE_ABS_ITEMS: Record<
  string,
  {
    items_zh: string[];
    items_en: string[];
    /* One-line summaries are the DOCX item lists joined; the remote
       summaries were build-authored paraphrases and are not shown. */
    summary_zh: string;
    summary_en: string;
  }
> = {
  "market-entry": {
    summary_zh:
      "TGA / RCM / 有机认证代办、FIRB 外资投资审批、税务架构规划、本地授权代表 / 进口商代持。",
    summary_en:
      "TGA, RCM and organic certification support; FIRB foreign-investment approvals; tax structure planning; local authorised representative and importer-of-record services.",
    items_zh: [
      "TGA / RCM / 有机认证代办",
      "FIRB 外资投资审批",
      "税务架构规划",
      "本地授权代表 / 进口商代持",
    ],
    items_en: [
      "TGA, RCM and organic certification support",
      "FIRB foreign-investment approvals",
      "Tax structure planning",
      "Local authorised representative and importer-of-record services",
    ],
  },
  "market-channels": {
    summary_zh:
      "会员金牌代理商筛选、政商闭门供需对接、订单前置匹配——先有采购意向再落地。",
    summary_en:
      "Vetted top-tier agents drawn from the membership, closed-door government-and-business supply-demand sessions, and pre-matched orders — demand secured before you land.",
    items_zh: [
      "会员金牌代理商筛选",
      "政商闭门供需对接",
      "订单前置匹配——先有采购意向再落地",
    ],
    items_en: [
      "Vetted top-tier agents drawn from the membership",
      "Closed-door government-and-business supply-demand sessions",
      "Pre-matched orders — demand secured before you land",
    ],
  },
  "local-operations": {
    summary_zh:
      "悉尼 / 墨尔本共享备件仓、全澳持证维保网络、统一派单托管——企业无需自建澳洲团队。",
    summary_en:
      "Shared spare-parts warehouses in Sydney and Melbourne, a nationwide licensed maintenance network, and centralised dispatch — no local team required.",
    items_zh: [
      "悉尼 / 墨尔本共享备件仓",
      "全澳持证维保网络",
      "统一派单托管——企业无需自建澳洲团队",
    ],
    items_en: [
      "Shared spare-parts warehouses in Sydney and Melbourne",
      "A nationwide licensed maintenance network",
      "Centralised dispatch and managed service — no local team required",
    ],
  },
  "capital-government": {
    summary_zh:
      "州政府补贴 / 土地政策对接、品牌危机公关、澳洲上市辅导、中澳产业基金对接。",
    summary_en:
      "State-government grant and land-policy introductions, brand and crisis communications, Australian listing advisory, and Australia–China industry fund introductions.",
    items_zh: [
      "州政府补贴 / 土地政策对接",
      "品牌危机公关",
      "澳洲上市辅导",
      "中澳产业基金对接",
    ],
    items_en: [
      "State-government grant and land-policy introductions",
      "Brand and crisis communications",
      "Australian listing advisory",
      "Australia–China industry fund introductions",
    ],
  },
};

/**
 * Leadership portraits. The database rows reference storage paths that were
 * never uploaded (a pre-existing live-site defect); the handbook PDF carries
 * the six official portraits. The preview build serves local extractions
 * (leading "/" = local public asset); the approved remote step uploads the
 * same files to storage and fixes the paths. Keys match the remote name_en
 * values exactly.
 */
export const FIXTURE_PORTRAITS: Record<string, string> = {
  "Hon. Bruce Atkinson AM": "/portraits/bruce-atkinson.jpg",
  "The Hon Ken Smith AM": "/portraits/ken-smith.jpg",
  "The Hon Andrew Robb AO": "/portraits/andrew-robb.jpg",
  "John Chun Sai So AO": "/portraits/john-so.jpg",
  "George Tambassis": "/portraits/george-tambassis.jpg",
  "Sunny Sun": "/portraits/sunny-sun.jpg",
};

/** DOCX §模块五 fee table wording where it differs from the remote rows
 *  (brochure wording): top tier 企业顶级会员, fourth tier 小微企业会员,
 *  individual threshold 自然人创业者. English names await confirmation. */
export const FIXTURE_MEMBERSHIP_NAME_OVERRIDES: Record<
  string,
  { name_zh?: string; name_en?: string; turnover_zh?: string }
> = {
  "corporate-group": { name_zh: "企业顶级会员" },
  small: { name_zh: "小微企业会员" },
  individual: { turnover_zh: "自然人创业者" },
};
