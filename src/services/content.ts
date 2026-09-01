import { createPublicClient } from "@/lib/supabase/public";
import type { Json } from "@/types/database.types";
import {
  designFixturesEnabled,
  FIXTURE_BANNERS,
  FIXTURE_MEMBER_BENEFITS,
  FIXTURE_PILLARS,
  FIXTURE_REVENUE_NOTE,
  FIXTURE_VISION,
  type BannerData,
} from "@/lib/fixtures/design-review";

export type BilingualText = { text_zh: string; text_en: string };
export type Pillar = BilingualText & { title_zh: string; title_en: string };

export type ContentBlocks = {
  vision: BilingualText | null;
  pillars: Pillar[];
  memberBenefits: BilingualText[];
  revenueNote: BilingualText | null;
  banners: BannerData[];
};

function isRecord(value: Json | undefined): value is Record<string, Json> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function asText(value: Json | undefined): BilingualText | null {
  if (!isRecord(value)) return null;
  const zh = value.text_zh;
  const en = value.text_en;
  if (typeof zh !== "string" && typeof en !== "string") return null;
  return {
    text_zh: typeof zh === "string" ? zh : "",
    text_en: typeof en === "string" ? en : "",
  };
}

function asItems(value: Json | undefined): Record<string, Json>[] {
  if (!isRecord(value) || !Array.isArray(value.items)) return [];
  return value.items.filter(isRecord);
}

function str(value: Json | undefined): string {
  return typeof value === "string" ? value : "";
}

/**
 * Structured content blocks stored under fixed site_settings keys
 * (vision / pillars / member_benefits / revenue_note / banners).
 * Each key has a fixed shape edited through dedicated admin form
 * sections — never a free-form JSON textarea.
 *
 * Until the approved data migration seeds these keys remotely, the
 * design-review fixtures (flag-gated) provide the DOCX-approved copy.
 */
export async function getContentBlocks(): Promise<ContentBlocks> {
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("site_settings")
    .select("key, value")
    .in("key", ["vision", "pillars", "member_benefits", "revenue_note", "banners"]);
  if (error) throw new Error(`getContentBlocks: ${error.message}`);
  const map = new Map((data ?? []).map((row) => [row.key, row.value]));

  const fixtures = designFixturesEnabled();

  const vision = asText(map.get("vision")) ?? (fixtures ? FIXTURE_VISION : null);

  let pillars: Pillar[] = asItems(map.get("pillars")).map((item) => ({
    title_zh: str(item.title_zh),
    title_en: str(item.title_en),
    text_zh: str(item.text_zh),
    text_en: str(item.text_en),
  }));
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

  return { vision, pillars, memberBenefits, revenueNote, banners };
}
