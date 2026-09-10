import { createPublicClient } from "@/lib/supabase/public";
import type { Json } from "@/types/database.types";
import type {
  BannerData,
  CouncilRoster,
  GalleryItem,
  OrgUnit,
  OutlookData,
} from "@/lib/content/types";

export type BilingualText = { text_zh: string; text_en: string };
export type Pillar = BilingualText & { title_zh: string; title_en: string };
export type ValueItem = Pillar;
export type { CouncilMember, CouncilRoster, OutlookData } from "@/lib/content/types";

export type ContentBlocks = {
  vision: BilingualText | null;
  /** Council mission; null when the key is unset (never invented). */
  mission: BilingualText | null;
  /** Council core values; empty when the key is unset. */
  coreValues: ValueItem[];
  /** Brochure "Main objectives"; empty when the key is unset. */
  objectives: BilingualText[];
  pillars: Pillar[];
  memberBenefits: BilingualText[];
  revenueNote: BilingualText | null;
  banners: BannerData[];
  /** Organisational units for the structure chart (names only). */
  orgStructure: OrgUnit[];
  /** Council roster (执委会议员); null when the key is unset. */
  council: CouncilRoster | null;
  /** Annual review / outlook (brochure); null when the key is unset. */
  outlook: OutlookData | null;
  /** 中国企业出海战略委员会 description; null when the key is unset. */
  strategyCommittee: BilingualText | null;
  /** 秘书处 description; null when the key is unset. */
  secretariat: BilingualText | null;
  /** Credentials / activity gallery — only already-published media. */
  gallery: GalleryItem[];
};

const CONTENT_KEYS = [
  "vision",
  "mission",
  "core_values",
  "objectives",
  "pillars",
  "member_benefits",
  "revenue_note",
  "banners",
  "org_structure",
  "council",
  "outlook",
  "strategy_committee",
  "secretariat",
  "gallery",
];

function isRecord(value: Json | undefined): value is Record<string, Json> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function asText(value: Json | undefined): BilingualText | null {
  if (!isRecord(value)) return null;
  const zh = value.text_zh;
  const en = value.text_en;
  if (typeof zh !== "string" && typeof en !== "string") return null;
  const text = {
    text_zh: typeof zh === "string" ? zh.trim() : "",
    text_en: typeof en === "string" ? en.trim() : "",
  };
  return text.text_zh || text.text_en ? text : null;
}

function asRecordList(value: Json | undefined): Record<string, Json>[] {
  return Array.isArray(value) ? value.filter(isRecord) : [];
}

function asItems(value: Json | undefined): Record<string, Json>[] {
  return isRecord(value) ? asRecordList(value.items) : [];
}

function str(value: Json | undefined): string {
  return typeof value === "string" ? value : "";
}

function asBilingualList(items: Record<string, Json>[]): BilingualText[] {
  return items
    .map((item) => ({
      text_zh: str(item.text_zh).trim(),
      text_en: str(item.text_en).trim(),
    }))
    .filter((item) => item.text_zh || item.text_en);
}

function asTitledItems(value: Json | undefined): Pillar[] {
  return asItems(value)
    .map((item) => ({
      title_zh: str(item.title_zh),
      title_en: str(item.title_en),
      text_zh: str(item.text_zh),
      text_en: str(item.text_en),
    }))
    .filter((item) => item.title_zh || item.title_en);
}

const ORG_KINDS = new Set<OrgUnit["kind"]>([
  "leadership",
  "committee",
  "chapters",
  "secretariat",
  "other",
]);

function asOrgUnits(value: Json | undefined): OrgUnit[] {
  return asItems(value)
    .map((item) => {
      const kind = str(item.kind) as OrgUnit["kind"];
      return {
        key: str(item.key),
        name_zh: str(item.name_zh),
        name_en: str(item.name_en),
        note_zh: str(item.note_zh),
        note_en: str(item.note_en),
        kind: ORG_KINDS.has(kind) ? kind : "other",
      };
    })
    .filter((unit) => unit.key && (unit.name_zh || unit.name_en));
}

/** `{ title_zh, title_en, members: [{ name_en, name_zh, note_en?, note_zh? }] }`.
 *  A member needs at least one name; a missing name in one language falls
 *  back to the other (roster rule). */
function asCouncil(value: Json | undefined): CouncilRoster | null {
  if (!isRecord(value)) return null;
  const members = asRecordList(value.members)
    .map((member) => {
      const name_en = str(member.name_en).trim();
      const name_zh = str(member.name_zh).trim();
      return {
        name_en: name_en || name_zh,
        name_zh: name_zh || name_en,
        note_en: str(member.note_en).trim(),
        note_zh: str(member.note_zh).trim(),
      };
    })
    .filter((member) => member.name_en);
  if (members.length === 0) return null;
  return {
    title_zh: str(value.title_zh).trim(),
    title_en: str(value.title_en).trim(),
    members,
  };
}

/** `{ title_zh, title_en, paragraphs: [{ text_zh, text_en }] }`. */
function asOutlook(value: Json | undefined): OutlookData | null {
  if (!isRecord(value)) return null;
  const paragraphs = asBilingualList(asRecordList(value.paragraphs));
  if (paragraphs.length === 0) return null;
  return {
    title_zh: str(value.title_zh).trim(),
    title_en: str(value.title_en).trim(),
    paragraphs,
  };
}

function asGallery(value: Json | undefined): GalleryItem[] {
  return asItems(value)
    .map((item) => ({
      image_path: str(item.image_path),
      caption_zh: str(item.caption_zh),
      caption_en: str(item.caption_en),
      news_slug: str(item.news_slug) || null,
      event_slug: str(item.event_slug) || null,
    }))
    .filter((item) => item.image_path);
}

/**
 * Structured content blocks stored under fixed site_settings keys. Each
 * key has a fixed shape edited through dedicated admin form sections —
 * never a free-form JSON textarea. The database is the single source of
 * truth: a block whose key is unset simply does not render.
 */
export async function getContentBlocks(): Promise<ContentBlocks> {
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("site_settings")
    .select("key, value")
    .in("key", CONTENT_KEYS);
  if (error) throw new Error(`getContentBlocks: ${error.message}`);
  const map = new Map((data ?? []).map((row) => [row.key, row.value]));

  const vision = asText(map.get("vision"));
  const mission = asText(map.get("mission"));
  const coreValues = asTitledItems(map.get("core_values"));
  const objectives = asBilingualList(asItems(map.get("objectives")));
  const pillars = asTitledItems(map.get("pillars"));
  const memberBenefits = asBilingualList(asItems(map.get("member_benefits")));
  const revenueNote = asText(map.get("revenue_note"));

  const banners: BannerData[] = asItems(map.get("banners"))
    .map((item) => ({
      key: str(item.key),
      title_zh: str(item.title_zh),
      title_en: str(item.title_en),
      text_zh: str(item.text_zh),
      text_en: str(item.text_en),
      cta_label_zh: str(item.cta_label_zh),
      cta_label_en: str(item.cta_label_en),
      cta_href: str(item.cta_href),
      image_path: typeof item.image_path === "string" ? item.image_path : null,
      is_active: item.is_active !== false,
    }))
    /* A banner only ships when its copy and destination are complete. */
    .filter(
      (banner) =>
        banner.is_active &&
        (banner.title_zh || banner.title_en) &&
        banner.cta_href,
    );

  const orgStructure = asOrgUnits(map.get("org_structure"));
  const council = asCouncil(map.get("council"));
  const outlook = asOutlook(map.get("outlook"));
  const strategyCommittee = asText(map.get("strategy_committee"));
  const secretariat = asText(map.get("secretariat"));
  const gallery = asGallery(map.get("gallery"));

  return {
    vision,
    mission,
    coreValues,
    objectives,
    pillars,
    memberBenefits,
    revenueNote,
    banners,
    orgStructure,
    council,
    outlook,
    strategyCommittee,
    secretariat,
    gallery,
  };
}
