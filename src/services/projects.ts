import { createPublicClient } from "@/lib/supabase/public";
import type { Tables } from "@/types/database.types";

export type ProjectRow = Tables<"projects">;

export async function getPublishedProjects(): Promise<ProjectRow[]> {
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .eq("status", "published")
    .order("published_at", { ascending: false });
  if (error) throw new Error(`getPublishedProjects: ${error.message}`);
  return data;
}
