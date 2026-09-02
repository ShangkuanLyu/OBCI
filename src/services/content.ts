import { createPublicClient } from "@/lib/supabase/public";
import type { Json } from "@/types/database.types";
import {
  designFixturesEnabled,
  FIXTURE_BANNERS,
  FIXTURE_GALLERY,
  FIXTURE_MEMBER_BENEFITS,
  FIXTURE_ORG_STRUCTURE,
  FIXTURE_PILLARS,
  FIXTURE_REVENUE_NOTE,
  FIXTURE_VISION,
  type BannerData,
  type GalleryItem,
  type OrgUnit,
} from "@/lib/fixtures/design-review";

export type BilingualText = { text_zh: string; text_en: string };
export type Pillar = BilingualText & { title_zh: string; title_en: string };
export type ValueItem = Pillar;

export type ContentBlocks = {
  vision: BilingualText | null;
  /** Chamber-supplied mission; null until confirmed (never invented). */
  mission: BilingualText | null;
  /** Chamber-supplied core values; empty until confirmed. */
  coreValues: ValueItem[];
  pillars: Pillar[];
  memberBenefits: BilingualText[];
  revenueNote: BilingualText | null;
  banners: BannerData[];
  /** Organisational units for the structure chart (DOCX-named units only). */
  orgStructure: OrgUnit[];
  /** 中国企业出海战略委员会 description; null until supplied. */
  strategyCommittee: BilingualText | null;
  /** 专业秘书处 description; null until supplied. */
  secretariat: BilingualText | null;
  /** Credentials / activity gallery — only already-published media. */
  gallery: GalleryItem[];
};

const CONTENT_KEYS = [
  "vision",
  "mission",
  "core_values",
  "pillars",
  "member_benefits",
  "revenue_note",
  "banners",
  "org_structure",
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

function asItems(value: Json | undefined): Record<string, Json>[] {
  if (!isRecord(value) || !Array.isArray(value.items)) return [];
  return value.items.filter(isRecord);
}

function str(value: Json | undefined): string {
  return typeof value === "string" ? value : "";
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
 * never a free-form JSON textarea.
 *
 * Until the approved data migration seeds these keys remotely, the
 * design-review fixtures (flag-gated) provide the DOCX-traceable copy.
 * Blocks whose copy the chamber has not supplied (mission, core values,
 * committee / secretariat descriptions) have NO fixture: they stay
 * hidden until real data exists.
 */
export async function getContentBlocks(): Promise<ContentBlocks> {
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("site_settings")
    .select("key, value")
    .in("key", CONTENT_KEYS);
  if (error) throw new Error(`getContentBlocks: ${error.message}`);
  const map = new Map((data ?? []).map((row) => [row.key, row.value]));

  const fixtures = designFixturesEnabled();

  const vision = asText(map.get("vision")) ?? (fixtures ? FIXTURE_VISION : null);
  const mission = asText(map.get("mission"));
  const coreValues = asTitledItems(map.get("core_values"));

  let pillars = asTitledItems(map.get("pillars"));
  if (pillars.length === 0 && fixtures) pillars = FIXTURE_PILLARS;

  let memberBenefits: BilingualText[] = asItems(map.get("member_benefits")).map(
    (item) => ({ text_zh: str(item.text_zh), text_en: str(item.text_en) }),
  );
  if (memberBenefits.length === 0 && fixtures)
    memberBenefits = FIXTURE_MEMBER_BENEFITS;

  const revenueNote =
    asText(map.get("revenue_note")) ?? (fixtures ? FIXTURE_REVENUE_NOTE : null);

  let banners: BannerData[] = asItems(map.get("banners"))
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
  if (banners.length === 0 && fixtures) banners = FIXTURE_BANNERS;

  let orgStructure = asOrgUnits(map.get("org_structure"));
  if (orgStructure.length === 0 && fixtures) orgStructure = FIXTURE_ORG_STRUCTURE;

  const strategyCommittee = asText(map.get("strategy_committee"));
  const secretariat = asText(map.get("secretariat"));

  let gallery = asGallery(map.get("gallery"));
  if (gallery.length === 0 && fixtures) gallery = FIXTURE_GALLERY;

  return {
    vision,
    mission,
    coreValues,
    pillars,
    memberBenefits,
    revenueNote,
    banners,
    orgStructure,
    strategyCommittee,
    secretariat,
    gallery,
  };
}
