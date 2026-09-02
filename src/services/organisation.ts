import { createPublicClient } from "@/lib/supabase/public";
import type { Tables } from "@/types/database.types";
import {
  designFixturesEnabled,
  FIXTURE_CHAPTERS,
  FIXTURE_PORTRAITS,
  type ChapterExtras,
} from "@/lib/fixtures/design-review";

export type LeadershipRow = Tables<"leadership">;
export type ChapterRow = Tables<"industry_chapters">;
export type PartnerRow = Tables<"partners">;

/**
 * A chapter row plus the template columns added by the pending
 * application_form_v2 migration (experts_*, certifications_*). The service
 * always fills them, so consumers can treat the lists as present even while
 * the production database still lacks the columns.
 */
export type ChapterWithExtras = ChapterRow & Required<ChapterExtras>;

function normaliseChapter(row: ChapterRow & ChapterExtras): ChapterWithExtras {
  return {
    ...row,
    experts_zh: row.experts_zh ?? [],
    experts_en: row.experts_en ?? [],
    certifications_zh: row.certifications_zh ?? [],
    certifications_en: row.certifications_en ?? [],
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
  if (!designFixturesEnabled()) return data;
  // Preview: substitute locally-extracted portraits for the dangling
  // storage paths (see FIXTURE_PORTRAITS); unmapped leaders keep their own.
  return data.map((person) => ({
    ...person,
    portrait_path: FIXTURE_PORTRAITS[person.name_en] ?? person.portrait_path,
  }));
}

export async function getChapters(): Promise<ChapterWithExtras[]> {
  // Design-review preview: the DOCX industries replace the archived
  // chapters, mirroring the state after the approved data migration.
  if (designFixturesEnabled()) {
    return FIXTURE_CHAPTERS.filter((chapter) => chapter.is_active)
      .sort((a, b) => a.display_order - b.display_order)
      .map(normaliseChapter);
  }
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
  if (designFixturesEnabled()) {
    const chapter = FIXTURE_CHAPTERS.find(
      (item) => item.slug === slug && item.is_active,
    );
    return chapter ? normaliseChapter(chapter) : null;
  }
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
