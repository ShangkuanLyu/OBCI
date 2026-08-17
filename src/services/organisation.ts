import { createPublicClient } from "@/lib/supabase/public";
import type { Tables } from "@/types/database.types";

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
  return data;
}

export async function getChapters(): Promise<ChapterRow[]> {
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
