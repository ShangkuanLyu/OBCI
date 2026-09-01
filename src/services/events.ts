import { createPublicClient } from "@/lib/supabase/public";
import type { Tables } from "@/types/database.types";
import {
  designFixturesEnabled,
  FIXTURE_CHAPTER_EVENT_SLUGS,
} from "@/lib/fixtures/design-review";

export type EventRow = Tables<"events">;

/** Whether an event is still in the future. Evaluated at build time on the
 *  static export (the daily rebuild refreshes it). */
export function eventIsUpcoming(event: EventRow): boolean {
  return new Date(event.starts_at).getTime() > Date.now();
}

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

/**
 * Events associated with an industry chapter. In production the link is a
 * chapter-slug entry in `events.tags` (added by the pending migration);
 * until that column exists the query fails soft and the section hides.
 * The design-review preview uses a fixed mapping of real events.
 */
export async function getEventsByChapter(
  chapterSlug: string,
  limit = 3,
): Promise<EventRow[]> {
  const supabase = createPublicClient();
  if (designFixturesEnabled()) {
    const slugs = FIXTURE_CHAPTER_EVENT_SLUGS[chapterSlug] ?? [];
    if (slugs.length === 0) return [];
    const { data, error } = await supabase
      .from("events")
      .select("*")
      .eq("status", "published")
      .in("slug", slugs)
      .order("starts_at", { ascending: false })
      .limit(limit);
    if (error) throw new Error(`getEventsByChapter: ${error.message}`);
    return data;
  }
  const { data, error } = await supabase
    .from("events")
    .select("*")
    .eq("status", "published")
    .contains("tags", [chapterSlug])
    .order("starts_at", { ascending: false })
    .limit(limit);
  // Fails soft while the tags column migration is still pending.
  if (error) return [];
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
