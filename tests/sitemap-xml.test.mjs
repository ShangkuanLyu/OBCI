// Runs with `npm test` (node --test). Serializer behind /sitemap.xml
// (src/lib/utils/sitemap-xml.mjs); the route handler that collects the
// entries is src/app/sitemap.xml/route.ts.
import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { renderSitemapXml } from "../src/lib/utils/sitemap-xml.mjs";

describe("renderSitemapXml", () => {
  test("writes loc, hreflang alternates and an ISO lastmod, one element per line", () => {
    const xml = renderSitemapXml([
      {
        url: "https://example.org/zh/news/a",
        lastModified: new Date("2026-11-05T13:17:31.068Z"),
        alternates: {
          zh: "https://example.org/zh/news/a",
          en: "https://example.org/en/news/a",
        },
      },
    ]);
    assert.equal(
      xml,
      [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">',
        "<url>",
        "<loc>https://example.org/zh/news/a</loc>",
        '<xhtml:link rel="alternate" hreflang="zh" href="https://example.org/zh/news/a" />',
        '<xhtml:link rel="alternate" hreflang="en" href="https://example.org/en/news/a" />',
        "<lastmod>2026-11-05T13:17:31.068Z</lastmod>",
        "</url>",
        "</urlset>",
        "",
      ].join("\n"),
    );
  });

  test("declares the xhtml namespace only when an entry has alternates", () => {
    const xml = renderSitemapXml([{ url: "https://example.org/" }]);
    assert.ok(!xml.includes("xmlns:xhtml"));
    assert.ok(!xml.includes("<lastmod>"));
    assert.ok(xml.includes("<loc>https://example.org/</loc>"));
  });

  test("passes a string lastModified through and keeps entry order", () => {
    const xml = renderSitemapXml([
      { url: "https://example.org/b", lastModified: "2026-01-02" },
      { url: "https://example.org/a" },
    ]);
    assert.ok(xml.includes("<lastmod>2026-01-02</lastmod>"));
    assert.ok(xml.indexOf("/b</loc>") < xml.indexOf("/a</loc>"));
  });

  test("escapes XML special characters in URLs and attributes", () => {
    const xml = renderSitemapXml([
      {
        url: "https://example.org/search?q=a&b=<c>",
        alternates: { en: 'https://example.org/en?x="1"&y=\'2\'' },
      },
    ]);
    assert.ok(xml.includes("<loc>https://example.org/search?q=a&amp;b=&lt;c&gt;</loc>"));
    assert.ok(
      xml.includes('href="https://example.org/en?x=&quot;1&quot;&amp;y=&apos;2&apos;"'),
    );
  });

  test("an empty list is still a valid urlset document", () => {
    assert.equal(
      renderSitemapXml([]),
      '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n</urlset>\n',
    );
  });
});
