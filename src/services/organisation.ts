import { createPublicClient } from "@/lib/supabase/public";
import type { Tables } from "@/types/database.types";
import {
  designFixturesEnabled,
  FIXTURE_CHAPTERS,
  FIXTURE_PORTRAITS,
} from "@/lib/fixtures/design-review";

export type LeadershipRow = Tables<"leadership">;
export type ChapterRow = Tables<"industry_chapters">;
export type PartnerRow = Tables<"partners">;

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
  // storage paths (see FIXTURE_PORTRAITS).
  return data.map((person) => ({
    ...person,
    portrait_path: FIXTURE_PORTRAITS[person.name_en] ?? null,
  }));
}

export async function getChapters(): Promise<ChapterRow[]> {
  // Design-review preview: the six DOCX industries replace the archived
  // chapters, mirroring the state after the approved data migration.
  if (designFixturesEnabled()) return FIXTURE_CHAPTERS;
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("industry_chapters")
    .select("*")
    .eq("is_active", true)
    .order("display_order");
  if (error) throw new Error(`getChapters: ${error.message}`);
  return data;
}

export async function getChapterBySlug(slug: string): Promise<ChapterRow | null> {
  if (designFixturesEnabled()) {
    return FIXTURE_CHAPTERS.find((chapter) => chapter.slug === slug) ?? null;
  }
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("industry_chapters")
    .select("*")
    .eq("is_active", true)
    .eq("slug", slug)
    .maybeSingle();
  if (error) throw new Error(`getChapterBySlug: ${error.message}`);
  return data;
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
