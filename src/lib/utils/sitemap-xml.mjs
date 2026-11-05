// Pure serializer for sitemap.xml: the sitemaps.org 0.9 format with
// `xhtml:link` hreflang alternates. No Next and no DOM, so it runs under
// `node --test` (tests/sitemap-xml.test.mjs). The entries are collected by
// the Route Handler in src/app/sitemap.xml/route.ts.

/**
 * @typedef {{
 *   url: string;
 *   lastModified?: Date | string;
 *   alternates?: Record<string, string>;
 * }} SitemapEntry
 */

/**
 * Escape the five XML special characters (URLs with a query string carry
 * `&`, which is not valid inside an element or attribute as-is).
 * @param {string} value
 * @returns {string}
 */
function escapeXml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

/**
 * Render sitemap entries as an XML document. `alternates` maps a hreflang
 * value to the absolute URL of that language version; `lastModified` is
 * written as an ISO 8601 timestamp (a string is passed through).
 * @param {SitemapEntry[]} entries
 * @returns {string}
 */
export function renderSitemapXml(entries) {
  const hasAlternates = entries.some(
    (entry) => Object.keys(entry.alternates ?? {}).length > 0,
  );
  const lines = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"${
      hasAlternates ? ' xmlns:xhtml="http://www.w3.org/1999/xhtml"' : ""
    }>`,
  ];
  for (const entry of entries) {
    lines.push("<url>", `<loc>${escapeXml(entry.url)}</loc>`);
    for (const [language, href] of Object.entries(entry.alternates ?? {})) {
      lines.push(
        `<xhtml:link rel="alternate" hreflang="${escapeXml(language)}" href="${escapeXml(href)}" />`,
      );
    }
    if (entry.lastModified) {
      const date =
        entry.lastModified instanceof Date
          ? entry.lastModified.toISOString()
          : entry.lastModified;
      lines.push(`<lastmod>${escapeXml(date)}</lastmod>`);
    }
    lines.push("</url>");
  }
  lines.push("</urlset>", "");
  return lines.join("\n");
}
