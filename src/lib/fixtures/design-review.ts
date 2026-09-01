import type { Tables } from "@/types/database.types";

/**
 * Design-review fixtures for content whose remote rows have not been
 * seeded/updated yet (pending the approved data migration).
 *
 * Isolation contract:
 * - Only active when NEXT_PUBLIC_DESIGN_FIXTURES=1 is set at build time.
 *   Production/CI builds never set the flag, so these values can never
 *   reach the public data path of a normal build.
 * - Every string here is either taken verbatim from the approved redesign
 *   DOCX or is provisional neutral copy flagged for confirmation in the
 *   pre-push report. English strings are draft translations pending review.
 * - After the approved data migration seeds the same content into Supabase,
 *   the remote rows become the single source of truth and this file is
 *   inert (flag off).
 */
export function designFixturesEnabled(): boolean {
  return process.env.NEXT_PUBLIC_DESIGN_FIXTURES === "1";
}

/* ------------------------------------------------------------------ */
/* Content blocks (site_settings keys pending seed)                    */
/* ------------------------------------------------------------------ */

export const FIXTURE_VISION = {
  text_zh:
    "搭建中澳及大洋洲多边商业互通枢纽，赋能中国企业轻资产出海、澳洲企业拓展亚太市场，打造政商资源一体化、全链路合规落地的跨境商贸服务平台。",
  text_en:
    "To build a multilateral business hub linking China, Australia and Oceania — enabling Chinese enterprises to go global asset-light and Australian businesses to expand into the Asia-Pacific, on a cross-border trade platform that unites government and business resources with end-to-end compliant delivery.",
};

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

/** Banner 1 (vision) only — Banners 2/3 stay hidden until the chamber
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
/* Six industry chapters (rows pending seed; old chapters pending      */
/* archive). Taglines/descriptions are provisional neutral copy.       */
/* ------------------------------------------------------------------ */

type ChapterRow = Tables<"industry_chapters">;

const CHAPTER_DEFAULTS = {
  contact_email: null,
  cover_image_path: null,
  created_at: "2026-09-02T00:00:00Z",
  updated_at: "2026-09-02T00:00:00Z",
  description_en: null,
  description_zh: null,
  is_active: true,
  resources_en: [] as string[],
  resources_zh: [] as string[],
  secretary_general: null,
  /* ABS industry services — generic template items from the DOCX. */
  services_zh: ["行业合规代办", "定向采购匹配", "行业专属展会"],
  services_en: [
    "Industry compliance handling",
    "Targeted procurement matching",
    "Industry-specific trade events",
  ],
};

export const FIXTURE_CHAPTERS: ChapterRow[] = [
  {
    ...CHAPTER_DEFAULTS,
    id: -1,
    slug: "health-products",
    name_zh: "大健康／健康产品",
    name_en: "Health & Wellness Products",
    tagline_zh: "保健品、健康食品与健康产业的中澳双向贸易赛道。",
    tagline_en:
      "Two-way trade in supplements, health foods and the wellness industry.",
    display_order: 1,
    description_zh:
      "大健康／健康产品行业分会是协会六大行业分会之一，面向保健品、健康食品与健康产业链上下游企业。分会依托协会的政商资源与 ABS 一站式出海服务体系，围绕产品合规、渠道对接与行业交流开展工作。\n\n健康产品进入澳洲市场通常涉及澳大利亚药品管理局（TGA）等监管体系的合规要求；进入中国市场则需应对跨境注册与渠道准入。分会关注行业合规与市场动态，并通过协会服务体系为会员对接相应支持。",
    description_en:
      "The Health & Wellness Products chapter is one of the association's six industry chapters, serving businesses across supplements, health foods and the wider wellness supply chain. Drawing on the association's government and business network and the ABS one-stop market-entry services, the chapter focuses on product compliance, channel matching and industry exchange.\n\nHealth products entering the Australian market typically face regulatory requirements under the Therapeutic Goods Administration (TGA); entering China involves cross-border registration and channel access. The chapter follows compliance and market developments and connects members to support through the association's services.",
  },
  {
    ...CHAPTER_DEFAULTS,
    id: -2,
    slug: "new-energy",
    name_zh: "新能源产业",
    name_en: "New Energy",
    tagline_zh: "新能源技术、装备与项目在澳洲市场的落地与合作。",
    tagline_en:
      "New-energy technology, equipment and projects entering the Australian market.",
    display_order: 2,
  },
  {
    ...CHAPTER_DEFAULTS,
    id: -3,
    slug: "building-materials",
    name_zh: "建材基建",
    name_en: "Building Materials & Infrastructure",
    tagline_zh: "建筑材料与基建工程领域的供需与项目对接。",
    tagline_en:
      "Supply, demand and project matching in building materials and infrastructure.",
    display_order: 3,
  },
  {
    ...CHAPTER_DEFAULTS,
    id: -4,
    slug: "cross-border-ecommerce",
    name_zh: "跨境电商",
    name_en: "Cross-Border E-commerce",
    tagline_zh: "跨境电商渠道、物流与品牌出海的行业交流。",
    tagline_en:
      "Channels, logistics and brand-building for cross-border e-commerce.",
    display_order: 4,
  },
  {
    ...CHAPTER_DEFAULTS,
    id: -5,
    slug: "education-tourism",
    name_zh: "教育文旅",
    name_en: "Education, Culture & Tourism",
    tagline_zh: "教育、文化与旅游产业的中澳合作与交流。",
    tagline_en:
      "Australia–China cooperation across education, culture and tourism.",
    display_order: 5,
  },
  {
    ...CHAPTER_DEFAULTS,
    id: -6,
    slug: "mining-investment",
    name_zh: "矿产投资",
    name_en: "Mining & Resources Investment",
    tagline_zh: "矿产资源领域的投资对接与行业交流。",
    tagline_en: "Investment matching and exchange in mining and resources.",
    display_order: 6,
  },
];

/** Real published content associated with a chapter for the preview build.
 *  The approved data migration replaces this with `tags` on the rows. */
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

/* ------------------------------------------------------------------ */
/* ABS service offerings — remote rows exist but their item lists      */
/* include handbook-only extras that are not yet confirmed. Until the  */
/* approved data update trims them, the preview shows the DOCX lists.  */
/* ------------------------------------------------------------------ */

export const FIXTURE_ABS_ITEMS: Record<
  string,
  { items_zh: string[]; items_en: string[] }
> = {
  "market-entry": {
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
 * same files to storage and fixes the paths.
 */
export const FIXTURE_PORTRAITS: Record<string, string> = {
  "Hon. Bruce Atkinson AM": "/portraits/bruce-atkinson.jpg",
  "The Hon Ken Smith AM": "/portraits/ken-smith.jpg",
  "The Hon Andrew Robb AO": "/portraits/andrew-robb.jpg",
  "John Chun Sai So AO": "/portraits/john-so.jpg",
  "George Tambassis": "/portraits/george-tambassis.jpg",
  "Sunny Sun": "/portraits/sunny-sun.jpg",
};

/** DOCX renames the top tier; the English name awaits confirmation. */
export const FIXTURE_MEMBERSHIP_NAME_OVERRIDES: Record<
  string,
  { name_zh?: string; name_en?: string }
> = {
  "corporate-group": { name_zh: "企业顶级会员" },
};
