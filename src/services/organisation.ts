import { createPublicClient } from "@/lib/supabase/public";
import type { Tables } from "@/types/database.types";
import type { ChapterExtras } from "@/lib/content/types";

export type LeadershipRow = Tables<"leadership">;
export type ChapterRow = Tables<"industry_chapters">;
export type PartnerRow = Tables<"partners">;

/**
 * A committee row plus the template columns added by migration
 * 20260902120000 (experts_*, certifications_*, deputy_secretary_general).
 * The service always fills them, so consumers can treat the fields as
 * present even while the generated database types still lack them.
 */
export type ChapterWithExtras = ChapterRow & Required<ChapterExtras>;

function normaliseChapter(row: ChapterRow & ChapterExtras): ChapterWithExtras {
  return {
    ...row,
    experts_zh: row.experts_zh ?? [],
    experts_en: row.experts_en ?? [],
    certifications_zh: row.certifications_zh ?? [],
    certifications_en: row.certifications_en ?? [],
    deputy_secretary_general: row.deputy_secretary_general ?? null,
  };
}

export async function getLeadership(): Promise<LeadershipRow[]> {
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("leadership")
    .select("*")
    .eq("is_active", true)
    .order("display_order");
  if (error) throw new Error(`getLeadership: ${error.message}`);
  return data;
}

export async function getChapters(): Promise<ChapterWithExtras[]> {
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("industry_chapters")
    .select("*")
    .eq("is_active", true)
    .order("display_order");
  if (error) throw new Error(`getChapters: ${error.message}`);
  return data.map(normaliseChapter);
}

export async function getChapterBySlug(
  slug: string,
): Promise<ChapterWithExtras | null> {
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("industry_chapters")
    .select("*")
    .eq("is_active", true)
    .eq("slug", slug)
    .maybeSingle();
  if (error) throw new Error(`getChapterBySlug: ${error.message}`);
  return data ? normaliseChapter(data) : null;
}

export async function getPartners(): Promise<PartnerRow[]> {
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("partners")
    .select("*")
    .eq("is_active", true)
    .order("display_order");
  if (error) throw new Error(`getPartners: ${error.message}`);
  return data;
}
