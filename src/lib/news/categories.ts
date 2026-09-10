/**
 * News category policy. Dependency-free so it runs under `node --test`
 * (tests/news-categories.test.mjs).
 *
 * Categories are CMS data (`news_categories`), and the CMS is the single
 * source of truth: `is_active` decides which rows are offered as
 * first-level tabs and which are *legacy* — kept for the articles that
 * still reference them, but never offered as a tab.
 *
 * The five first-level categories fixed by the DOCX (§资讯中心) are
 * recorded here as a structural fallback, used only if a row arrives
 * without `is_active` (i.e. before migration 20260902122000 added the
 * column). Their names and order mirror that migration.
 */

export type NewsCategoryDef = {
  slug: string;
  name_zh: string;
  name_en: string;
  display_order: number;
};

/** The five DOCX first-level categories, in DOCX order. Slugs are the
 *  existing `news_categories.slug` values so article links never change. */
export const DOCX_NEWS_CATEGORIES: readonly NewsCategoryDef[] = [
  {
    slug: "association-news",
    name_zh: "商会动态",
    name_en: "Association News",
    display_order: 1,
  },
  {
    slug: "policy-insights",
    name_zh: "中澳经贸政策",
    name_en: "China–Australia Trade Policy",
    display_order: 2,
  },
  {
    slug: "market-insights",
    name_zh: "行业市场资讯",
    name_en: "Industry & Market Insights",
    display_order: 3,
  },
  {
    slug: "going-global",
    name_zh: "出海实操指南",
    name_en: "Market Entry Guides",
    display_order: 4,
  },
  {
    slug: "events-coverage",
    name_zh: "活动预告回顾",
    name_en: "Event Previews & Recaps",
    display_order: 5,
  },
];

/** Shape of a `news_categories` row as far as this module cares. */
export type NewsCategorySource = {
  slug: string;
  name_zh: string;
  name_en: string;
  display_order?: number | null;
  is_active?: boolean | null;
};

export type ResolvedNewsCategory = NewsCategoryDef & {
  /** Not offered as a first-level category; its articles stay listed. */
  legacy: boolean;
};

const docxBySlug = new Map(DOCX_NEWS_CATEGORIES.map((c) => [c.slug, c]));

export function isDocxNewsCategory(slug: string | null | undefined): boolean {
  return typeof slug === "string" && docxBySlug.has(slug.trim().toLowerCase());
}

/**
 * Whether the DOCX structure stands in for the CMS flags, i.e. the row
 * arrived without `is_active` (pre-migration 20260902122000). Once the
 * column exists the CMS is the single source of truth.
 */
function docxApplies(
  row: Pick<NewsCategorySource, "is_active"> | null | undefined,
): boolean {
  return row?.is_active == null;
}

/**
 * Whether a category row is legacy.
 * - CMS row (`is_active` present): `is_active === false`.
 * - fallback (no `is_active`): anything outside the DOCX five.
 */
export function isLegacyNewsCategory(
  row: Pick<NewsCategorySource, "slug" | "is_active"> | null | undefined,
): boolean {
  if (!row) return false;
  if (docxApplies(row)) return !isDocxNewsCategory(row.slug);
  return row.is_active === false;
}

/** Display name for a row: the CMS value, or the DOCX wording for the five
 *  confirmed slugs when the row carries no `is_active` (the migration
 *  writes the same names). Falls back across languages like `loc()`. */
export function newsCategoryName(
  row: Pick<NewsCategorySource, "slug" | "name_zh" | "name_en" | "is_active">,
  locale: "zh" | "en",
): string {
  const docx = docxApplies(row)
    ? docxBySlug.get(row.slug.trim().toLowerCase())
    : undefined;
  const source = docx ?? row;
  const primary = locale === "zh" ? source.name_zh : source.name_en;
  const fallback = locale === "zh" ? source.name_en : source.name_zh;
  return (primary && primary.trim()) || (fallback && fallback.trim()) || "";
}

/**
 * The category list the news index works from: the CMS rows in
 * `display_order`, legacy per `is_active`. If any row arrives without
 * `is_active` the DOCX five are prepended as the structural fallback
 * (DOCX names and order, present even when a category has no article yet).
 */
export function resolveNewsCategories(
  rows: readonly NewsCategorySource[],
): ResolvedNewsCategory[] {
  const byOrder = (a: NewsCategorySource, b: NewsCategorySource) =>
    (a.display_order ?? 0) - (b.display_order ?? 0);
  const clean = rows
    .filter((row) => typeof row.slug === "string" && row.slug.trim() !== "")
    .map((row) => ({ ...row, slug: row.slug.trim().toLowerCase() }));
  const docxMode = clean.some((row) => row.is_active == null);
  const seen = new Set<string>();
  const out: ResolvedNewsCategory[] = [];

  if (docxMode) {
    for (const def of DOCX_NEWS_CATEGORIES) {
      seen.add(def.slug);
      out.push({ ...def, legacy: false });
    }
  }
  for (const row of [...clean].sort(byOrder)) {
    if (seen.has(row.slug)) continue;
    seen.add(row.slug);
    out.push({
      slug: row.slug,
      name_zh: row.name_zh,
      name_en: row.name_en,
      display_order: row.display_order ?? 0,
      legacy: isLegacyNewsCategory(row),
    });
  }
  return out;
}
