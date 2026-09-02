import type { NewsFilter } from "@/lib/news/filter";

/**
 * Query-string form of the news filter (?category=&tag=&q=) so a filtered
 * view can be linked to or bookmarked on the static export. Dependency-free
 * so it runs under `node --test` (tests/news-filter.test.mjs); values pass
 * through as written — slug normalisation belongs to lib/news/filter.
 */
export const CATEGORY_PARAM = "category";
export const TAG_PARAM = "tag";
export const QUERY_PARAM = "q";

function blankToNull(value: string | null): string | null {
  const trimmed = value?.trim() ?? "";
  return trimmed === "" ? null : trimmed;
}

/** Filter encoded in `location.search` (with or without the leading "?"). */
export function filterFromSearch(search: string): NewsFilter {
  const params = new URLSearchParams(search);
  return {
    category: blankToNull(params.get(CATEGORY_PARAM)),
    tag: blankToNull(params.get(TAG_PARAM)),
    query: params.get(QUERY_PARAM)?.trim() ?? "",
  };
}

/** "?category=…&tag=…&q=…" for the active criteria, "" when none. */
export function searchFromFilter(filter: NewsFilter): string {
  const params = new URLSearchParams();
  const category = blankToNull(filter.category);
  if (category) params.set(CATEGORY_PARAM, category);
  const tag = blankToNull(filter.tag);
  if (tag) params.set(TAG_PARAM, tag);
  const query = filter.query.trim();
  if (query) params.set(QUERY_PARAM, query);
  const encoded = params.toString();
  return encoded ? `?${encoded}` : "";
}
