import { createPublicClient } from "@/lib/supabase/public";
import type { Tables } from "@/types/database.types";
import {
  designFixturesEnabled,
  FIXTURE_CHAPTER_NEWS_SLUGS,
} from "@/lib/fixtures/design-review";

export type NewsRow = Tables<"news">;
export type NewsCategoryRow = Tables<"news_categories">;
export type NewsWithCategory = NewsRow & {
  category: NewsCategoryRow | null;
};

const LIST_COLUMNS =
  "id, slug, title_zh, title_en, summary_zh, summary_en, cover_image_path, published_at, updated_at, is_featured, author_name, tags, category:news_categories(*)";

export async function getNewsCategories(): Promise<NewsCategoryRow[]> {
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("news_categories")
    .select("*")
    .order("display_order");
  if (error) throw new Error(`getNewsCategories: ${error.message}`);
  return data;
}

/** Published articles, newest first. Category/tag/search filtering happens
 *  client-side over this corpus (lib/news/filter), not in the query. */
export async function getPublishedNews(options?: {
  limit?: number;
}): Promise<NewsWithCategory[]> {
  const supabase = createPublicClient();
  let query = supabase
    .from("news")
    .select(LIST_COLUMNS)
    .eq("status", "published")
    .order("published_at", { ascending: false });
  if (options?.limit) query = query.limit(options.limit);
  const { data, error } = await query;
  if (error) throw new Error(`getPublishedNews: ${error.message}`);
  return data as unknown as NewsWithCategory[];
}

/**
 * News associated with an industry chapter. Association is by tag
 * (`tags` contains the chapter slug) so one article can belong to
 * several industries. The design-review preview uses a fixed mapping
 * of real published articles until the approved data update tags them.
 */
export async function getNewsByChapter(
  chapterSlug: string,
  limit = 3,
): Promise<NewsWithCategory[]> {
  const supabase = createPublicClient();
  if (designFixturesEnabled()) {
    const slugs = FIXTURE_CHAPTER_NEWS_SLUGS[chapterSlug] ?? [];
    if (slugs.length === 0) return [];
    const { data, error } = await supabase
      .from("news")
      .select(LIST_COLUMNS)
      .eq("status", "published")
      .in("slug", slugs)
      .order("published_at", { ascending: false })
      .limit(limit);
    if (error) throw new Error(`getNewsByChapter: ${error.message}`);
    return data as unknown as NewsWithCategory[];
  }
  const { data, error } = await supabase
    .from("news")
    .select(LIST_COLUMNS)
    .eq("status", "published")
    .contains("tags", [chapterSlug])
    .order("published_at", { ascending: false })
    .limit(limit);
  if (error) throw new Error(`getNewsByChapter: ${error.message}`);
  return data as unknown as NewsWithCategory[];
}

export async function getFeaturedNews(limit = 3): Promise<NewsWithCategory[]> {
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("news")
    .select(LIST_COLUMNS)
    .eq("status", "published")
    .order("is_featured", { ascending: false })
    .order("published_at", { ascending: false })
    .limit(limit);
  if (error) throw new Error(`getFeaturedNews: ${error.message}`);
  return data as unknown as NewsWithCategory[];
}

export async function getNewsBySlug(
  slug: string,
): Promise<NewsWithCategory | null> {
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("news")
    .select("*, category:news_categories(*)")
    .eq("status", "published")
    .eq("slug", slug)
    .maybeSingle();
  if (error) throw new Error(`getNewsBySlug: ${error.message}`);
  return data as unknown as NewsWithCategory | null;
}

export async function getAllNewsSlugs(): Promise<string[]> {
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("news")
    .select("slug")
    .eq("status", "published");
  if (error) throw new Error(`getAllNewsSlugs: ${error.message}`);
  return data.map((r) => r.slug);
}
