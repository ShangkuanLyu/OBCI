/**
 * News category policy. Dependency-free so it runs under `node --test`
 * (tests/news-categories.test.mjs).
 *
 * Categories are CMS data (`news_categories`). The DOCX (§资讯中心) fixes
 * five first-level categories; this module records them once so that the
 * preview build, the tests and the migration mirror
 * (supabase/migrations/20260902122000_news_categories_docx.sql) agree, and
 * decides which rows are offered as tabs and which are *legacy*: kept for
 * the articles that still reference them, never offered as a first-level
 * category, and marked "历史分类待整理" wherever the article is listed.
 *
 * Until that migration adds `news_categories.is_active`, the CMS cannot
 * express "legacy", so every build applies the DOCX structure (five tabs,
 * DOCX names, everything else legacy). After it, the CMS flag decides and
 * the preview build alone keeps enforcing the DOCX structure.
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

/** Shape of a `news_categories` row as far as this module cares. `is_active`
 *  is added by migration 20260902122000 and may be absent before it runs. */
export type NewsCategorySource = {
  slug: string;
  name_zh: string;
  name_en: string;
  display_order?: number | null;
  is_active?: boolean | null;
};

export type ResolvedNewsCategory = NewsCategoryDef & {
  /** Not offered as a first-level category; articles keep it, marked. */
  legacy: boolean;
};

const docxBySlug = new Map(DOCX_NEWS_CATEGORIES.map((c) => [c.slug, c]));

export function isDocxNewsCategory(slug: string | null | undefined): boolean {
  return typeof slug === "string" && docxBySlug.has(slug.trim().toLowerCase());
}

/**
 * Whether the confirmed DOCX structure applies to a row rather than the
 * CMS flags: in the preview build (`enforceDocx`), and in every build while
 * the CMS cannot express the structure yet — i.e. until migration
 * 20260902122000 adds `is_active` (the row then has no such field). Once
 * the column exists the CMS is the single source of truth.
 */
function docxApplies(
  row: Pick<NewsCategorySource, "is_active"> | null | undefined,
  enforceDocx: boolean,
): boolean {
  return enforceDocx || row?.is_active == null;
}

/**
 * Whether a category row is legacy.
 * - DOCX mode (preview, or pre-migration): anything outside the DOCX five.
 * - otherwise (migrated CMS): `is_active === false`.
 */
export function isLegacyNewsCategory(
  row: Pick<NewsCategorySource, "slug" | "is_active"> | null | undefined,
  enforceDocx: boolean,
): boolean {
  if (!row) return false;
  if (docxApplies(row, enforceDocx)) return !isDocxNewsCategory(row.slug);
  return row.is_active === false;
}

/** Display name for a row: the DOCX wording for the five confirmed slugs in
 *  DOCX mode (the migration writes the same names), the CMS value
 *  otherwise. Falls back across languages like `loc()`. */
export function newsCategoryName(
  row: Pick<NewsCategorySource, "slug" | "name_zh" | "name_en" | "is_active">,
  locale: "zh" | "en",
  enforceDocx: boolean,
): string {
  const docx = docxApplies(row, enforceDocx)
    ? docxBySlug.get(row.slug.trim().toLowerCase())
    : undefined;
  const source = docx ?? row;
  const primary = locale === "zh" ? source.name_zh : source.name_en;
  const fallback = locale === "zh" ? source.name_en : source.name_zh;
  return (primary && primary.trim()) || (fallback && fallback.trim()) || "";
}

/**
 * The category list the news index works from.
 * - DOCX mode (`enforceDocx`, or CMS rows without `is_active` = migration
 *   not yet applied): exactly the DOCX five (DOCX names and order, always
 *   present even when the CMS has no row or no article yet), followed by
 *   any other CMS row as legacy.
 * - otherwise: the CMS rows in `display_order`, legacy per `is_active`.
 */
export function resolveNewsCategories(
  rows: readonly NewsCategorySource[],
  options: { enforceDocx: boolean },
): ResolvedNewsCategory[] {
  const byOrder = (a: NewsCategorySource, b: NewsCategorySource) =>
    (a.display_order ?? 0) - (b.display_order ?? 0);
  const clean = rows
    .filter((row) => typeof row.slug === "string" && row.slug.trim() !== "")
    .map((row) => ({ ...row, slug: row.slug.trim().toLowerCase() }));
  const docxMode =
    options.enforceDocx || clean.some((row) => row.is_active == null);
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
      legacy: isLegacyNewsCategory(row, docxMode),
    });
  }
  return out;
}
