import { createPublicClient } from "@/lib/supabase/public";
import type { Tables } from "@/types/database.types";

export type EventRow = Tables<"events">;

export async function getUpcomingEvents(): Promise<EventRow[]> {
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("events")
    .select("*")
    .eq("status", "published")
    .gte("starts_at", new Date().toISOString())
    .order("starts_at", { ascending: true });
  if (error) throw new Error(`getUpcomingEvents: ${error.message}`);
  return data;
}

export async function getPastEvents(limit = 24): Promise<EventRow[]> {
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("events")
    .select("*")
    .eq("status", "published")
    .lt("starts_at", new Date().toISOString())
    .order("starts_at", { ascending: false })
    .limit(limit);
  if (error) throw new Error(`getPastEvents: ${error.message}`);
  return data;
}

export async function getEventBySlug(slug: string): Promise<EventRow | null> {
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("events")
    .select("*")
    .eq("status", "published")
    .eq("slug", slug)
    .maybeSingle();
  if (error) throw new Error(`getEventBySlug: ${error.message}`);
  return data;
}

export async function getAllEventSlugs(): Promise<string[]> {
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("events")
    .select("slug")
    .eq("status", "published");
  if (error) throw new Error(`getAllEventSlugs: ${error.message}`);
  return data.map((r) => r.slug);
}
