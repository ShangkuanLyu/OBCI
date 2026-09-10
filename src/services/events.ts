import { createPublicClient } from "@/lib/supabase/public";
import type { Tables } from "@/types/database.types";
import type { EventExtras } from "@/lib/content/types";

export type EventRow = Tables<"events">;

/**
 * An event row plus the `tags` column added by migration 20260902120000
 * (committee association). The service pads it so consumers can read
 * `tags` while the generated database types still lack the column.
 */
export type EventWithTags = EventRow & Required<EventExtras>;

/** Whether an event is still in the future. Evaluated at build time on the
 *  static export (the daily rebuild refreshes it). */
export function eventIsUpcoming(event: EventRow): boolean {
  return new Date(event.starts_at).getTime() > Date.now();
}

function normaliseEvent(row: EventRow & EventExtras): EventWithTags {
  return { ...row, tags: row.tags ?? [] };
}

function byStartDesc(a: EventRow, b: EventRow): number {
  return new Date(b.starts_at).getTime() - new Date(a.starts_at).getTime();
}

export async function getUpcomingEvents(): Promise<EventWithTags[]> {
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("events")
    .select("*")
    .eq("status", "published")
    .gte("starts_at", new Date().toISOString())
    .order("starts_at", { ascending: true });
  if (error) throw new Error(`getUpcomingEvents: ${error.message}`);
  return data.map(normaliseEvent);
}

export async function getPastEvents(limit = 24): Promise<EventWithTags[]> {
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("events")
    .select("*")
    .eq("status", "published")
    .lt("starts_at", new Date().toISOString())
    .order("starts_at", { ascending: false })
    .limit(limit);
  if (error) throw new Error(`getPastEvents: ${error.message}`);
  return data.map(normaliseEvent).sort(byStartDesc).slice(0, limit);
}

export async function getEventBySlug(
  slug: string,
): Promise<EventWithTags | null> {
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("events")
    .select("*")
    .eq("status", "published")
    .eq("slug", slug)
    .maybeSingle();
  if (error) throw new Error(`getEventBySlug: ${error.message}`);
  return data ? normaliseEvent(data) : null;
}

/** Logged at most once per process so a missing `events.tags` column is
 *  visible in build output without flooding it (one line per chapter). */
let warnedChapterQuery = false;

/**
 * Events associated with an industry committee. The link is a
 * committee-slug entry in `events.tags`. If the column is missing the
 * query fails soft and the section hides rather than breaking the build.
 */
export async function getEventsByChapter(
  chapterSlug: string,
  limit = 3,
): Promise<EventWithTags[]> {
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("events")
    .select("*")
    .eq("status", "published")
    .contains("tags", [chapterSlug])
    .order("starts_at", { ascending: false })
    .limit(limit);
  // Fails soft if the tags column is unavailable.
  if (error) {
    if (!warnedChapterQuery) {
      warnedChapterQuery = true;
      console.warn(
        `getEventsByChapter: chapter events hidden — ${error.message}`,
      );
    }
    return [];
  }
  return data.map(normaliseEvent);
}

export async function getAllEventSlugs(): Promise<string[]> {
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("events")
    .select("slug")
    .eq("status", "published");
  if (error) throw new Error(`getAllEventSlugs: ${error.message}`);
  return [...new Set(data.map((r) => r.slug))];
}
