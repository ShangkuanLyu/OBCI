// Runs with `npm test` (node --test). Node 24 strips the TypeScript types
// of the imported module natively; no bundler or test runner is needed.
import { test, describe } from "node:test";
import assert from "node:assert/strict";
import {
  EMPTY_FILTER,
  categoryOptions,
  filterNews,
  isFiltering,
  layoutNews,
  tagOptions,
} from "../src/lib/news/filter.ts";
import {
  filterFromSearch,
  searchFromFilter,
} from "../src/components/news/url-state.ts";

// Mirror of the published corpus on the remote project (2026-09-02):
// categories, featured flags and the health-chapter tags the preview
// build applies. Titles are abbreviated but keep the searchable terms.
// The five DOCX categories are first-level; trade-cooperation is a legacy
// CMS category (kept for its two articles, never a tab).
const CATEGORIES = [
  { slug: "association-news", name: "商会动态" },
  { slug: "policy-insights", name: "中澳经贸政策" },
  { slug: "market-insights", name: "行业市场资讯" },
  { slug: "going-global", name: "出海实操指南" },
  { slug: "events-coverage", name: "活动预告回顾" },
  { slug: "trade-cooperation", name: "中澳经贸合作", legacy: true },
];

const item = (
  id,
  slug,
  title,
  categorySlug,
  featured,
  tags = [],
  summary = "",
) => ({
  id,
  slug,
  title,
  summary,
  date: "",
  categorySlug,
  categoryName: CATEGORIES.find((c) => c.slug === categorySlug)?.name ?? "",
  categoryLegacy:
    CATEGORIES.find((c) => c.slug === categorySlug)?.legacy === true,
  image: null,
  featured,
  tags,
});

const ITEMS = [
  item(7, "obc-delegation-visits-liaoning-ccpit", "加强合作，促进交流——副理事长率团访问辽宁省贸促会", "trade-cooperation", true),
  item(6, "oceania-business-council-2026-agm-melbourne", "2026年年度会员大会在墨尔本成功举行", "association-news", true),
  item(5, "taizhou-delegation-visits-melbourne-cooperation", "台州市代表团访问墨尔本", "trade-cooperation", true),
  item(4, "melbourne-australia-china-health-expo-tcm-forum-2025", "澳中健康产品博览会、世界传统医药论坛", "market-insights", false, ["health-products"]),
  item(3, "world-traditional-medicine-forum-preparatory-meeting", "世界传统医药论坛筹备会议成功举行", "association-news", false, ["health-products"]),
  item(2, "7th-world-traditional-medicine-forum-melbourne", "第七届世界传统医药论坛", "market-insights", false, ["health-products"]),
  item(1, "acbca-chinese-new-year-networking-event", "新春商务联谊会圆满落幕", "association-news", false),
];

const CHAPTERS = new Map([["health-products", "大健康／健康产品"]]);

const slugs = (list) => list.map((i) => i.slug);

describe("category filter", () => {
  test("全部: no filter returns every article, split into pinned + regular", () => {
    const filtered = filterNews(ITEMS, EMPTY_FILTER);
    assert.equal(filtered.length, 7);
    assert.equal(isFiltering(EMPTY_FILTER), false);
    const { pinned, regular } = layoutNews(filtered, EMPTY_FILTER);
    assert.deepEqual(pinned.map((i) => i.id), [7, 6, 5]);
    assert.deepEqual(regular.map((i) => i.id), [4, 3, 2, 1]);
    // Every article appears exactly once across the two lists.
    assert.equal(pinned.length + regular.length, filtered.length);
  });

  test("商会动态 lists all three association-news articles", () => {
    const filter = { ...EMPTY_FILTER, category: "association-news" };
    const filtered = filterNews(ITEMS, filter);
    assert.deepEqual(slugs(filtered), [
      "oceania-business-council-2026-agm-melbourne",
      "world-traditional-medicine-forum-preparatory-meeting",
      "acbca-chinese-new-year-networking-event",
    ]);
    const { pinned, regular } = layoutNews(filtered, filter);
    assert.equal(pinned.length, 0, "no pinned strip while a category is active");
    assert.equal(regular.length, 3);
  });

  test("中澳经贸合作 (legacy): both articles stay in 全部, marked, and are not a tab", () => {
    const all = filterNews(ITEMS, EMPTY_FILTER);
    const legacy = all.filter((i) => i.categoryLegacy);
    assert.deepEqual(slugs(legacy), [
      "obc-delegation-visits-liaoning-ccpit",
      "taizhou-delegation-visits-melbourne-cooperation",
    ]);
    // Both are featured and still appear (pinned strip) under 全部.
    const { pinned } = layoutNews(all, EMPTY_FILTER);
    assert.ok(legacy.every((i) => pinned.some((p) => p.id === i.id)));
    assert.ok(
      !categoryOptions(CATEGORIES, ITEMS).some((o) => o.slug === "trade-cooperation"),
      "legacy category is never offered as a tab",
    );
    // The pure filter still matches by slug; the UI never offers the legacy
    // slug and treats a hand-edited ?category= that is not a tab as 全部
    // (NewsIndex only accepts slugs present in its options).
    const filter = { ...EMPTY_FILTER, category: "trade-cooperation" };
    assert.equal(filterNews(ITEMS, filter).length, 2);
  });

  test("行业市场资讯 lists the two health-industry articles", () => {
    const filter = { ...EMPTY_FILTER, category: "market-insights" };
    const { regular } = layoutNews(filterNews(ITEMS, filter), filter);
    assert.deepEqual(slugs(regular), [
      "melbourne-australia-china-health-expo-tcm-forum-2025",
      "7th-world-traditional-medicine-forum-melbourne",
    ]);
  });

  test("category matching is by slug and tolerant of case/whitespace", () => {
    const filter = { ...EMPTY_FILTER, category: " Association-News " };
    assert.equal(filterNews(ITEMS, filter).length, 3);
  });

  test("category tabs offer all five DOCX categories with counts (0 = empty state), never the legacy one", () => {
    const options = categoryOptions(CATEGORIES, ITEMS);
    assert.deepEqual(
      options.map((o) => [o.slug, o.count]),
      [
        ["association-news", 3],
        ["policy-insights", 0],
        ["market-insights", 2],
        ["going-global", 0],
        ["events-coverage", 0],
      ],
    );
    // A tab's count equals what the filter yields; 0 renders the empty state.
    for (const option of options) {
      const filtered = filterNews(ITEMS, { ...EMPTY_FILTER, category: option.slug });
      assert.equal(filtered.length, option.count, option.slug);
    }
    // No article is invented to fill a category.
    assert.equal(options.reduce((n, o) => n + o.count, 0), 5);
    assert.equal(ITEMS.filter((i) => !i.categoryLegacy).length, 5);
  });

  test("duplicate slugs and blank slugs are ignored", () => {
    const options = categoryOptions(
      [
        { slug: "association-news", name: "A" },
        { slug: " Association-News ", name: "dup" },
        { slug: "", name: "blank" },
      ],
      ITEMS,
    );
    assert.deepEqual(options.map((o) => [o.slug, o.name, o.count]), [["association-news", "A", 3]]);
  });
});

describe("search", () => {
  test("搜索“辽宁” finds the Liaoning CCPIT visit only", () => {
    const filter = { ...EMPTY_FILTER, query: "辽宁" };
    const filtered = filterNews(ITEMS, filter);
    assert.deepEqual(slugs(filtered), ["obc-delegation-visits-liaoning-ccpit"]);
    const { pinned, regular } = layoutNews(filtered, filter);
    assert.equal(pinned.length, 0);
    assert.equal(regular.length, 1);
  });

  test("search composes with a category: 辽宁 within 商会动态 is empty (and reported as filtering)", () => {
    const filter = { category: "association-news", tag: null, query: "辽宁" };
    assert.equal(filterNews(ITEMS, filter).length, 0);
    assert.equal(isFiltering(filter), true);
  });
});

describe("industry tags", () => {
  test("tag chips come only from tags in use that match an active chapter", () => {
    const options = tagOptions(ITEMS, CHAPTERS);
    assert.deepEqual(options, [
      { value: "health-products", label: "大健康／健康产品", count: 3 },
    ]);
    assert.deepEqual(tagOptions(ITEMS, new Map()), []);
  });

  test("tag filter lists the three health articles", () => {
    const filter = { ...EMPTY_FILTER, tag: "health-products" };
    assert.deepEqual(slugs(filterNews(ITEMS, filter)), [
      "melbourne-australia-china-health-expo-tcm-forum-2025",
      "world-traditional-medicine-forum-preparatory-meeting",
      "7th-world-traditional-medicine-forum-melbourne",
    ]);
  });
});

describe("URL state (?category=&tag=&q=)", () => {
  test("no filter serialises to an empty query string, and blank params parse as none", () => {
    assert.equal(searchFromFilter(EMPTY_FILTER), "");
    assert.deepEqual(filterFromSearch(""), EMPTY_FILTER);
    assert.deepEqual(filterFromSearch("?category=&tag=+&q=+"), EMPTY_FILTER);
    assert.equal(isFiltering(filterFromSearch("?category=&q=")), false);
  });

  test("round-trips category, tag and a Chinese query", () => {
    const filter = {
      category: "trade-cooperation",
      tag: "health-products",
      query: "辽宁 贸促会",
    };
    const search = searchFromFilter(filter);
    assert.equal(
      search,
      "?category=trade-cooperation&tag=health-products&q=%E8%BE%BD%E5%AE%81+%E8%B4%B8%E4%BF%83%E4%BC%9A",
    );
    assert.deepEqual(filterFromSearch(search), filter);
    // With or without the leading "?", as location.search may be either.
    assert.deepEqual(filterFromSearch(search.slice(1)), filter);
  });

  test("only active criteria are written; whitespace is trimmed", () => {
    assert.equal(
      searchFromFilter({ category: null, tag: null, query: "  辽宁 " }),
      "?q=%E8%BE%BD%E5%AE%81",
    );
    assert.equal(
      searchFromFilter({ category: " association-news ", tag: null, query: "" }),
      "?category=association-news",
    );
  });

  test("a hand-edited category slug still filters (normalised by filterNews)", () => {
    const filter = filterFromSearch("?category=Trade-Cooperation");
    assert.equal(isFiltering(filter), true);
    assert.equal(filterNews(ITEMS, filter).length, 2);
  });

  test("unrelated parameters are ignored", () => {
    assert.deepEqual(filterFromSearch("?utm_source=wechat&page=2"), EMPTY_FILTER);
  });
});

describe("pinned overflow", () => {
  test("a fourth featured article is not lost", () => {
    const extra = [item(8, "extra", "Extra", "association-news", true), ...ITEMS];
    const { pinned, regular } = layoutNews(extra, EMPTY_FILTER);
    assert.equal(pinned.length, 3);
    assert.ok(regular.some((i) => i.id === 5), "overflowed pin appears in the list");
    assert.equal(pinned.length + regular.length, extra.length);
  });
});
