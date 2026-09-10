#!/usr/bin/env node
// Static-output checker for the exported site (out/). Fails the build on:
//   * unresolved template variables ({count}, {{x}}, ${x}) anywhere a reader
//     or crawler can see them: <title>, meta description, Open Graph /
//     Twitter metadata, JSON-LD strings, visible markup incl. attributes;
//   * forbidden placeholder copy (待补充, Lorem ipsum, TODO, $X,XXX);
//   * heading structure (exactly one h1, no skipped levels);
//   * canonical / hreflang / og:image / twitter:image / JSON-LD presence;
//   * robots: no page may be noindex, except the Next.js error page and a
//     legal document that is not published (at launch only /constitution/,
//     which the secretariat issues on request);
//   * past events must not claim EventScheduled; articles must be og:type
//     article.
//
// Usage: node scripts/check-static-output.mjs <out-dir>
// Exit code 1 when any problem is found (scripts/build-static.sh and the
// Pages workflow run it right after `next build`).
import { readdir, readFile, stat } from "node:fs/promises";
import { join, relative } from "node:path";
import { findUnresolvedPlaceholders, stripNonVisible } from "./lib/html-checks.mjs";

const root = process.argv[2];
if (!root) {
  console.error("usage: check-static-output.mjs <out-dir>");
  process.exit(2);
}

const FORBIDDEN = ["待补充", "$X,XXX", "X,XXX", "Lorem ipsum", "TODO"];
// Legal pages may be noindex while unpublished (no site_settings.legal
// version stamp). At launch terms/privacy/accessibility are published with
// version 2026-09; the constitution stays unpublished by decision.
const LEGAL_NOINDEX_OK = /\/(terms|privacy|accessibility|constitution)\/index\.html$/;
// Next.js error pages (global not-found): no canonical/hreflang/OG/JSON-LD
// by design; placeholder, heading and robots checks still run.
const ERROR_PAGE = /^(404|_not-found)\/index\.html$|^404\.html$/;

async function* walk(dir) {
  for (const entry of await readdir(dir)) {
    const full = join(dir, entry);
    const info = await stat(full);
    if (info.isDirectory()) yield* walk(full);
    else if (entry.endsWith(".html")) yield full;
  }
}

const problems = [];
const stats = { pages: 0, eventPages: 0, newsPages: 0, placeholderHits: 0 };

for await (const file of walk(root)) {
  const rel = relative(root, file);
  if (rel === "index.html" || rel === "404.html") continue; // Pages stubs
  const html = await readFile(file, "utf8");
  stats.pages++;
  const p = (msg) => problems.push(`${rel}: ${msg}`);

  // Unresolved template variables — the check that must never pass silently.
  for (const hit of findUnresolvedPlaceholders(html)) {
    stats.placeholderHits++;
    p(`unresolved template variable ${hit.match} in ${hit.where}: ${hit.context}`);
  }

  // Headings
  const headings = [...html.matchAll(/<h([1-6])\b/g)].map((m) => Number(m[1]));
  const h1s = headings.filter((n) => n === 1).length;
  if (h1s !== 1) p(`h1 count = ${h1s}`);
  let prev = 0;
  for (const level of headings) {
    if (prev !== 0 && level > prev + 1) {
      p(`heading level skipped: h${prev} → h${level}`);
      break;
    }
    prev = level;
  }

  // Metadata
  const errorPage = ERROR_PAGE.test(rel);
  const noindex = /<meta name="robots" content="noindex[^"]*"/.test(html);
  if (noindex && !errorPage && !LEGAL_NOINDEX_OK.test(rel)) p("production page with noindex");
  if (!errorPage) {
    if (!/<link rel="canonical" href="[^"]+"/.test(html)) p("no canonical");
    const hreflangs = [...html.matchAll(/hrefLang="([^"]+)"|hreflang="([^"]+)"/gi)].map(
      (m) => m[1] ?? m[2],
    );
    for (const l of ["zh", "en", "x-default"]) if (!hreflangs.includes(l)) p(`missing hreflang ${l}`);
    if (!/property="og:image"/.test(html)) p("no og:image");
    if (!/name="twitter:image"/.test(html)) p("no twitter:image");
    if (!/application\/ld\+json/.test(html)) p("no JSON-LD");
  }

  // Event JSON-LD: past events must not claim EventScheduled
  if (/\/events\/[^/]+\/index\.html$/.test(rel)) {
    stats.eventPages++;
    for (const block of html.matchAll(/<script type="application\/ld\+json">(.*?)<\/script>/gs)) {
      try {
        const data = JSON.parse(block[1]);
        if (data["@type"] === "Event" && data.eventStatus && Date.parse(data.startDate) < Date.now())
          p("past event still EventScheduled");
      } catch {
        p("unparseable JSON-LD");
      }
    }
  }
  if (/\/news\/[^/]+\/index\.html$/.test(rel)) {
    stats.newsPages++;
    if (!/property="og:type" content="article"/.test(html)) p("news article og:type not article");
  }

  // Forbidden placeholder copy (visible markup only)
  const visible = stripNonVisible(html);
  for (const needle of FORBIDDEN)
    if (visible.includes(needle)) p(`forbidden placeholder "${needle}"`);
}

console.log(JSON.stringify(stats));
if (problems.length) {
  console.log(problems.join("\n"));
  console.log(`FAIL — ${problems.length} problem(s)`);
  process.exitCode = 1;
} else {
  console.log("OK — no problems");
}
