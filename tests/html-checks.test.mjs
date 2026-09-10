// Regression tests for the static-output template-variable scan
// (scripts/lib/html-checks.mjs). A 2026-09-02 build shipped
// "{count}大行业分会" in twelve chapter meta descriptions while the old
// checker reported "no placeholders" — every surface it missed is covered.
import { test, describe } from "node:test";
import assert from "node:assert/strict";
import {
  PLACEHOLDER_RE,
  findUnresolvedPlaceholders,
  stripNonVisible,
} from "../scripts/lib/html-checks.mjs";

const page = ({ head = "", body = "" }) =>
  `<!DOCTYPE html><html lang="zh"><head><meta charSet="utf-8"/>${head}</head><body>${body}</body></html>`;

const wheres = (html) => findUnresolvedPlaceholders(html).map((h) => h.where);

describe("unresolved template variables are found in every surface", () => {
  test("<title>", () => {
    const html = page({ head: "<title>{count}大行业分会 | OBCI</title>" });
    const hits = findUnresolvedPlaceholders(html);
    assert.ok(hits.some((h) => h.where === "title" && h.match === "{count}"));
  });

  test("meta description (the chapter-page regression)", () => {
    const html = page({
      head: '<meta name="description" content="{count}大行业分会，以赛道为纽带精准对接资源。"/>',
    });
    assert.deepEqual(wheres(html), ["description"]);
  });

  test("Open Graph and Twitter metadata", () => {
    const html = page({
      head:
        '<meta property="og:description" content="{count} industry chapters matching members."/>' +
        '<meta name="twitter:description" content="{count} industry chapters"/>',
    });
    assert.deepEqual(wheres(html).sort(), ["og", "twitter"]);
  });

  test("JSON-LD string values (object braces themselves are fine)", () => {
    const html = page({
      head:
        '<script type="application/ld+json">' +
        JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Organization",
          name: "OBCI",
          description: "{count} industry chapters",
          nested: { list: ["ok", "{name} chapter"] },
        }) +
        "</script>",
    });
    const hits = findUnresolvedPlaceholders(html);
    assert.deepEqual(
      hits.map((h) => [h.where, h.match]),
      [
        ["json-ld", "{count}"],
        ["json-ld", "{name}"],
      ],
    );
    assert.ok(hits[0].context.startsWith("$.description"));
  });

  test("unparseable JSON-LD is reported", () => {
    const html = page({ head: '<script type="application/ld+json">{not json</script>' });
    assert.deepEqual(wheres(html), ["json-ld"]);
  });

  test("visible body text", () => {
    const html = page({ body: "<h1>行业分会</h1><p>{count}大行业分会</p>" });
    assert.deepEqual(wheres(html), ["markup"]);
  });

  test("attributes a reader or screen reader sees (alt, aria-label, placeholder)", () => {
    for (const attr of ['alt="{name}"', 'aria-label="{label}"', 'placeholder="{hint}"']) {
      const html = page({ body: `<h1>x</h1><input ${attr}/>` });
      assert.deepEqual(wheres(html), ["markup"], attr);
    }
  });

  test("ICU argument lists, handlebars and JS template forms", () => {
    const html = page({
      body:
        "<p>{count, plural, =1 {1 article} other {# articles}}</p>" +
        "<p>{{ title }}</p><p>${slug}</p>",
    });
    const hits = findUnresolvedPlaceholders(html);
    assert.equal(hits.length, 3);
    assert.ok(hits.every((h) => h.where === "markup"));
  });

  test("entity-encoded braces are decoded before matching", () => {
    const html = page({ body: "<p>&#123;count&#125;大行业分会</p>" });
    assert.deepEqual(wheres(html), ["markup"]);
  });
});

describe("legitimate braces are not flagged", () => {
  test("message bundles and RSC payloads inside <script>", () => {
    const html = page({
      body:
        "<h1>ok</h1>" +
        '<script>self.__next_f.push([1,"{\\"chapters\\":{\\"standfirst\\":\\"{count}大行业分会\\"}}"])</script>',
    });
    assert.deepEqual(findUnresolvedPlaceholders(html), []);
    assert.equal(stripNonVisible(html).includes("{count}"), false);
  });

  test("CSS blocks, empty braces, JSON objects and HTML comments", () => {
    const html = page({
      head: "<style>.a{color:red}@media (min-width:768px){.b{display:none}}</style>",
      body: "<h1>ok</h1><p>{}</p><!-- {todo} --><p>{&quot;k&quot;:1}</p>",
    });
    assert.deepEqual(findUnresolvedPlaceholders(html), []);
  });

  test("a clean rendered page passes", () => {
    const html = page({
      head:
        "<title>九大专业分会 | OBCI</title>" +
        '<meta name="description" content="九大专业分会，以赛道为纽带精准对接资源。"/>' +
        '<meta property="og:title" content="九大专业分会"/>' +
        '<script type="application/ld+json">{"@type":"WebPage","name":"九大专业分会"}</script>',
      body: "<h1>九大专业分会</h1><p>Nine professional committees</p>",
    });
    assert.deepEqual(findUnresolvedPlaceholders(html), []);
  });

  test("the pattern itself (ASCII and non-ASCII argument names)", () => {
    const flagged = ["{count}", "{ count }", "{count, number}", "{{x}}", "${x}", "{数量}", "{név}"];
    const clean = ["{}", "{1}", '{"a":1}', "{ }", "{-}", "{.a}"];
    for (const s of flagged) assert.ok(s.match(PLACEHOLDER_RE), s);
    for (const s of clean) assert.equal(s.match(PLACEHOLDER_RE), null, s);
  });
});

describe("scripts/check-static-output.mjs gates the build", async () => {
  const { mkdtemp, mkdir, writeFile, rm } = await import("node:fs/promises");
  const { tmpdir } = await import("node:os");
  const { join } = await import("node:path");
  const { spawnSync } = await import("node:child_process");
  const script = new URL("../scripts/check-static-output.mjs", import.meta.url).pathname;

  // A minimal page that satisfies every rule the checker enforces.
  const cleanPage = (description) =>
    `<!DOCTYPE html><html lang="zh"><head><title>行业分会 | OBCI</title>` +
    `<meta name="description" content="${description}"/>` +
    `<link rel="canonical" href="https://example.test/zh/x/"/>` +
    `<link rel="alternate" hreflang="zh" href="https://example.test/zh/x/"/>` +
    `<link rel="alternate" hreflang="en" href="https://example.test/en/x/"/>` +
    `<link rel="alternate" hreflang="x-default" href="https://example.test/zh/x/"/>` +
    `<meta property="og:image" content="https://example.test/og.png"/>` +
    `<meta name="twitter:image" content="https://example.test/og.png"/>` +
    `<script type="application/ld+json">{"@type":"WebPage","name":"x"}</script>` +
    `</head><body><h1>行业分会</h1></body></html>`;

  const run = (dir) =>
    spawnSync(process.execPath, [script, dir], { encoding: "utf8" });

  test("exit 1 with a named surface when a page leaks {count}; exit 0 when clean", async () => {
    const dir = await mkdtemp(join(tmpdir(), "obci-static-check-"));
    try {
      await mkdir(join(dir, "zh/chapters/x"), { recursive: true });
      await mkdir(join(dir, "zh/ok"), { recursive: true });
      await writeFile(join(dir, "zh/ok/index.html"), cleanPage("九大专业分会。"));
      await writeFile(join(dir, "zh/chapters/x/index.html"), cleanPage("{count}大行业分会。"));

      const failing = run(dir);
      assert.equal(failing.status, 1, failing.stdout + failing.stderr);
      assert.match(failing.stdout, /zh\/chapters\/x\/index\.html: unresolved template variable \{count\} in description/);
      assert.match(failing.stdout, /FAIL — 1 problem/);

      await rm(join(dir, "zh/chapters"), { recursive: true });
      const passing = run(dir);
      assert.equal(passing.status, 0, passing.stdout + passing.stderr);
      assert.match(passing.stdout, /OK — no problems/);
    } finally {
      await rm(dir, { recursive: true, force: true });
    }
  });
});
