import { createPublicClient } from "@/lib/supabase/public";
import type { Json } from "@/types/database.types";

export type SiteSettings = Record<string, Json>;

export async function getSiteSettings(): Promise<SiteSettings> {
  const supabase = createPublicClient();
  const { data, error } = await supabase.from("site_settings").select("key, value");
  if (error) throw new Error(`getSiteSettings: ${error.message}`);
  return Object.fromEntries(data.map((row) => [row.key, row.value]));
}

export function settingString(
  settings: SiteSettings,
  key: string,
  field: string,
  fallback = "",
): string {
  const group = settings[key];
  if (group && typeof group === "object" && !Array.isArray(group)) {
    const value = (group as Record<string, Json | undefined>)[field];
    if (typeof value === "string") return value;
  }
  return fallback;
}
