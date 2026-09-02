// Runs with `npm test` (node --test). Category policy: the five DOCX
// first-level categories are always offered; legacy CMS categories keep
// their articles but are never a first-level category.
import { test, describe } from "node:test";
import assert from "node:assert/strict";
import {
  DOCX_NEWS_CATEGORIES,
  isDocxNewsCategory,
  isLegacyNewsCategory,
  newsCategoryName,
  resolveNewsCategories,
} from "../src/lib/news/categories.ts";
import { categoryOptions } from "../src/lib/news/filter.ts";

// Remote rows as of 2026-09-02 (six categories; trade-cooperation is not in
// the DOCX list). `is_active` does not exist until migration 20260902122000.
const REMOTE_ROWS = [
  { slug: "association-news", name_zh: "商会动态", name_en: "Association News", display_order: 1 },
  { slug: "trade-cooperation", name_zh: "中澳经贸合作", name_en: "Trade & Cooperation", display_order: 2 },
  { slug: "policy-insights", name_zh: "中澳经贸政策", name_en: "Policy & Regulation", display_order: 3 },
  { slug: "market-insights", name_zh: "行业市场资讯", name_en: "Industry & Market Insights", display_order: 4 },
  { slug: "going-global", name_zh: "出海实操指南", name_en: "Going Global", display_order: 5 },
  { slug: "events-coverage", name_zh: "活动预告回顾", name_en: "Events", display_order: 6 },
];

describe("DOCX category structure", () => {
  test("exactly the five confirmed categories, in DOCX order, bilingual", () => {
    assert.deepEqual(
      DOCX_NEWS_CATEGORIES.map((c) => [c.display_order, c.name_zh, c.name_en]),
      [
        [1, "商会动态", "Association News"],
        [2, "中澳经贸政策", "China–Australia Trade Policy"],
        [3, "行业市场资讯", "Industry & Market Insights"],
        [4, "出海实操指南", "Market Entry Guides"],
        [5, "活动预告回顾", "Event Previews & Recaps"],
      ],
    );
    assert.equal(new Set(DOCX_NEWS_CATEGORIES.map((c) => c.slug)).size, 5);
    assert.equal(isDocxNewsCategory("trade-cooperation"), false);
    assert.equal(isDocxNewsCategory("Association-News"), true);
  });
});

describe("preview build (enforceDocx)", () => {
  const resolved = resolveNewsCategories(REMOTE_ROWS, { enforceDocx: true });

  test("offers the five DOCX categories first, with DOCX names, then legacy rows", () => {
    assert.deepEqual(
      resolved.map((c) => [c.slug, c.legacy]),
      [
        ["association-news", false],
        ["policy-insights", false],
        ["market-insights", false],
        ["going-global", false],
        ["events-coverage", false],
        ["trade-cooperation", true],
      ],
    );
    assert.equal(resolved[1].name_en, "China–Australia Trade Policy");
    assert.equal(resolved[3].name_en, "Market Entry Guides");
  });

  test("the five are present even when the CMS has no rows at all", () => {
    const empty = resolveNewsCategories([], { enforceDocx: true });
    assert.equal(empty.length, 5);
    assert.ok(empty.every((c) => !c.legacy));
  });

  test("legacy detection and naming per row", () => {
    assert.equal(isLegacyNewsCategory(REMOTE_ROWS[1], true), true);
    assert.equal(isLegacyNewsCategory(REMOTE_ROWS[0], true), false);
    assert.equal(newsCategoryName(REMOTE_ROWS[2], "en", true), "China–Australia Trade Policy");
    assert.equal(newsCategoryName(REMOTE_ROWS[1], "zh", true), "中澳经贸合作");
  });
});

describe("production build", () => {
  test("before migration 20260902122000 (no is_active column) the DOCX structure applies in every build", () => {
    // The remote rows carry no is_active field yet, so the CMS cannot mark a
    // legacy category: production must still show the five DOCX tabs and
    // never promote 中澳经贸合作.
    const resolved = resolveNewsCategories(REMOTE_ROWS, { enforceDocx: false });
    assert.deepEqual(
      resolved.map((c) => [c.slug, c.legacy]),
      [
        ["association-news", false],
        ["policy-insights", false],
        ["market-insights", false],
        ["going-global", false],
        ["events-coverage", false],
        ["trade-cooperation", true],
      ],
    );
    assert.equal(resolved[1].name_en, "China–Australia Trade Policy");
    assert.equal(newsCategoryName(REMOTE_ROWS[2], "en", false), "China–Australia Trade Policy");
    assert.equal(isLegacyNewsCategory(REMOTE_ROWS[1], false), true);
    assert.equal(isLegacyNewsCategory(REMOTE_ROWS[0], false), false);
  });

  test("after the migration the CMS decides: is_active=false marks the legacy category, CMS names are used", () => {
    const rows = REMOTE_ROWS.map((r) =>
      r.slug === "trade-cooperation" ? { ...r, is_active: false, display_order: 99 } : { ...r, is_active: true },
    );
    const resolved = resolveNewsCategories(rows, { enforceDocx: false });
    assert.deepEqual(
      resolved.filter((c) => c.legacy).map((c) => c.slug),
      ["trade-cooperation"],
    );
    assert.equal(resolved.at(-1).slug, "trade-cooperation", "sorted by display_order");
    // The migration writes the DOCX names; a later CMS edit wins over code.
    assert.equal(newsCategoryName({ ...rows[2], name_en: "Edited in CMS" }, "en", false), "Edited in CMS");
    assert.equal(isLegacyNewsCategory({ slug: "x", is_active: true }, false), false);
    // A migrated CMS with an extra active category offers it as a tab.
    const extra = [...rows, { slug: "new-cat", name_zh: "新分类", name_en: "New", display_order: 7, is_active: true }];
    assert.ok(resolveNewsCategories(extra, { enforceDocx: false }).some((c) => c.slug === "new-cat" && !c.legacy));
  });

  test("name falls back across languages like loc()", () => {
    assert.equal(newsCategoryName({ slug: "x", name_zh: "", name_en: "Only EN", is_active: true }, "zh", false), "Only EN");
  });
});

describe("tabs", () => {
  const ITEMS = [
    { id: 1, slug: "a", title: "", summary: "", date: "", categorySlug: "association-news", categoryName: "", categoryLegacy: false, image: null, featured: false, tags: [] },
    { id: 2, slug: "b", title: "", summary: "", date: "", categorySlug: "trade-cooperation", categoryName: "", categoryLegacy: true, image: null, featured: false, tags: [] },
  ];

  test("every non-legacy category is a tab, with a 0 count where empty; legacy never is", () => {
    const resolved = resolveNewsCategories(REMOTE_ROWS, { enforceDocx: true }).map((c) => ({
      slug: c.slug,
      name: c.name_zh,
      legacy: c.legacy,
    }));
    const tabs = categoryOptions(resolved, ITEMS);
    assert.deepEqual(
      tabs.map((o) => [o.slug, o.count]),
      [
        ["association-news", 1],
        ["policy-insights", 0],
        ["market-insights", 0],
        ["going-global", 0],
        ["events-coverage", 0],
      ],
    );
    assert.ok(!tabs.some((o) => o.slug === "trade-cooperation"));
  });
});
