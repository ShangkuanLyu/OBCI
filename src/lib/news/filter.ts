/**
 * Pure filtering logic for the news index. Kept dependency-free so it can
 * run under `node --test` without a bundler (tests/news-filter.test.mjs).
 */

export type NewsFilterItem = {
  id: number;
  slug: string;
  title: string;
  summary: string;
  date: string;
  categorySlug: string | null;
  categoryName: string;
  /** Category is legacy (see lib/news/categories): still listed under
   *  "全部", never offered as a tab. */
  categoryLegacy: boolean;
  image: string | null;
  featured: boolean;
  tags: string[];
};

export type NewsFilter = {
  /** Category slug (matches `news_categories.slug`), or null for all. */
  category: string | null;
  /** Industry tag (chapter slug), or null for all. */
  tag: string | null;
  /** Free-text query matched against title and summary (case-insensitive). */
  query: string;
};

export const EMPTY_FILTER: NewsFilter = { category: null, tag: null, query: "" };

export function normaliseSlug(value: string | null | undefined): string | null {
  if (typeof value !== "string") return null;
  const slug = value.trim().toLowerCase();
  return slug === "" ? null : slug;
}

export function isFiltering(filter: NewsFilter): boolean {
  return (
    normaliseSlug(filter.category) !== null ||
    normaliseSlug(filter.tag) !== null ||
    filter.query.trim() !== ""
  );
}

/** Items matching every active criterion (category AND tag AND query). */
export function filterNews<T extends NewsFilterItem>(
  items: T[],
  filter: NewsFilter,
): T[] {
  const category = normaliseSlug(filter.category);
  const tag = normaliseSlug(filter.tag);
  const q = filter.query.trim().toLowerCase();
  return items.filter((item) => {
    if (category && normaliseSlug(item.categorySlug) !== category) return false;
    if (tag && !item.tags.map(normaliseSlug).includes(tag)) return false;
    if (
      q &&
      !item.title.toLowerCase().includes(q) &&
      !item.summary.toLowerCase().includes(q)
    )
      return false;
    return true;
  });
}

export type NewsLayout<T> = {
  /** Pinned strip (only when nothing is filtered), at most `pinnedMax`. */
  pinned: T[];
  /** Everything else, in original order. Every filtered item appears in
   *  exactly one of `pinned` / `regular`. */
  regular: T[];
};

/**
 * Split filtered items into the pinned strip and the main list. With any
 * filter active the strip is dropped and every match is listed, so a
 * category whose articles are all pinned never renders as empty.
 */
export function layoutNews<T extends NewsFilterItem>(
  filtered: T[],
  filter: NewsFilter,
  pinnedMax = 3,
): NewsLayout<T> {
  if (isFiltering(filter)) return { pinned: [], regular: filtered };
  const featured = filtered.filter((item) => item.featured);
  const pinned = featured.slice(0, pinnedMax);
  const pinnedIds = new Set(pinned.map((item) => item.id));
  return {
    pinned,
    regular: filtered.filter((item) => !pinnedIds.has(item.id)),
  };
}

export type CategoryOption = { slug: string; name: string; count: number };

/** Categories offered as tabs: every non-legacy category in the order
 *  supplied, de-duplicated by slug, each with its article count — a
 *  category with no article yet is still offered (count 0, empty state).
 *  Legacy categories are never tabs; their articles stay in "全部". */
export function categoryOptions(
  categories: { slug: string; name: string; legacy?: boolean }[],
  items: NewsFilterItem[],
): CategoryOption[] {
  const counts = new Map<string, number>();
  for (const item of items) {
    const slug = normaliseSlug(item.categorySlug);
    if (slug) counts.set(slug, (counts.get(slug) ?? 0) + 1);
  }
  const seen = new Set<string>();
  const options: CategoryOption[] = [];
  for (const category of categories) {
    const slug = normaliseSlug(category.slug);
    if (!slug || seen.has(slug)) continue;
    seen.add(slug);
    if (category.legacy) continue;
    options.push({ slug, name: category.name, count: counts.get(slug) ?? 0 });
  }
  return options;
}

export type TagOption = { value: string; label: string; count: number };

/** Industry-tag chips: only tags actually used by items AND known as an
 *  active chapter (so no raw slug can surface), labelled by chapter name. */
export function tagOptions(
  items: NewsFilterItem[],
  chapterNames: Map<string, string>,
): TagOption[] {
  const counts = new Map<string, number>();
  for (const item of items) {
    for (const raw of item.tags) {
      const tag = normaliseSlug(raw);
      if (tag && chapterNames.has(tag))
        counts.set(tag, (counts.get(tag) ?? 0) + 1);
    }
  }
  return Array.from(chapterNames.entries())
    .filter(([slug]) => counts.has(slug))
    .map(([slug, label]) => ({ value: slug, label, count: counts.get(slug)! }));
}
