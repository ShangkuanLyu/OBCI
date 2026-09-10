import { createPublicClient } from "@/lib/supabase/public";
import type { Tables } from "@/types/database.types";

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

function byDateDesc(
  a: { published_at: string | null },
  b: { published_at: string | null },
) {
  if (a.published_at === b.published_at) return 0;
  if (a.published_at === null) return 1;
  if (b.published_at === null) return -1;
  return a.published_at < b.published_at ? 1 : -1;
}

/** Published articles, newest first. Category/tag/search filtering happens
 *  client-side over this corpus (lib/news/filter), not in the query. */
export async function getPublishedNews(options?: {
  limit?: number;
}): Promise<NewsWithCategory[]> {
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("news")
    .select(LIST_COLUMNS)
    .eq("status", "published")
    .order("published_at", { ascending: false });
  if (error) throw new Error(`getPublishedNews: ${error.message}`);
  const rows = data as unknown as NewsWithCategory[];
  return options?.limit ? rows.slice(0, options.limit) : rows;
}

/**
 * News associated with an industry committee. Association is by tag
 * (`tags` contains the committee slug) so one article can belong to
 * several committees.
 */
export async function getNewsByChapter(
  chapterSlug: string,
  limit = 3,
): Promise<NewsWithCategory[]> {
  const supabase = createPublicClient();
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
  const all = await getPublishedNews();
  return all
    .slice()
    .sort(
      (a, b) => Number(b.is_featured) - Number(a.is_featured) || byDateDesc(a, b),
    )
    .slice(0, limit);
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
  return data ? (data as unknown as NewsWithCategory) : null;
}

export async function getAllNewsSlugs(): Promise<string[]> {
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("news")
    .select("slug")
    .eq("status", "published");
  if (error) throw new Error(`getAllNewsSlugs: ${error.message}`);
  return [...new Set(data.map((r) => r.slug))];
}
