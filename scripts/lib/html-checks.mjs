// Pure HTML checks shared by scripts/check-static-output.mjs and
// tests/html-checks.test.mjs. No dependencies.

/**
 * Unresolved template variables: ICU/next-intl `{name}` or `{name, …}`
 * (an identifier directly after the brace, closed by `}` or followed by an
 * ICU argument list — nested plural/select braces are therefore caught at
 * the opening `{count,`), handlebars `{{name}}` and JS template `${name}`.
 * JSON objects (`{"@type"…`), empty braces and CSS blocks do not match
 * because an identifier must open the brace.
 */
export const PLACEHOLDER_RE =
  /\{\{[^{}]*\}\}|\$\{[^{}]*\}|\{\s*[\p{L}_][\p{L}\p{N}_]*\s*[,}]/gu;

const NON_VISIBLE_RE =
  /<script\b[^>]*>[\s\S]*?<\/script>|<style\b[^>]*>[\s\S]*?<\/style>|<template\b[^>]*>[\s\S]*?<\/template>|<!--[\s\S]*?-->/gi;

function decodeBraces(text) {
  return text
    .replace(/&#(?:123|x7b);/gi, "{")
    .replace(/&#(?:125|x7d);/gi, "}")
    .replace(/&lbrace;/g, "{")
    .replace(/&rbrace;/g, "}");
}

function matches(text) {
  return [...decodeBraces(text).matchAll(PLACEHOLDER_RE)].map((m) => m[0]);
}

/** Everything a reader can see, plus attributes (alt, aria-label,
 *  placeholder…): the document minus scripts, styles, templates and
 *  comments. Message bundles and RSC payloads live in scripts, so their
 *  legitimate ICU sources are excluded. */
export function stripNonVisible(html) {
  return html.replace(NON_VISIBLE_RE, "");
}

function* jsonStrings(value, path = "$") {
  if (typeof value === "string") yield { path, value };
  else if (Array.isArray(value))
    for (let i = 0; i < value.length; i++) yield* jsonStrings(value[i], `${path}[${i}]`);
  else if (value && typeof value === "object")
    for (const [k, v] of Object.entries(value)) yield* jsonStrings(v, `${path}.${k}`);
}

/**
 * Scan one HTML document. Returns [] when clean; otherwise one entry per
 * hit: { where: "title" | "description" | "og" | "twitter" | "json-ld" |
 * "markup", match, context }.
 */
export function findUnresolvedPlaceholders(html) {
  const hits = [];
  const push = (where, match, context) =>
    hits.push({ where, match, context: context.trim().slice(0, 160) });

  const title = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  if (title) for (const m of matches(title[1])) push("title", m, title[1]);

  for (const meta of html.matchAll(/<meta\b[^>]*>/gi)) {
    const tag = meta[0];
    const name = tag.match(/\b(?:name|property)="([^"]*)"/i)?.[1] ?? "";
    const content = tag.match(/\bcontent="([^"]*)"/i)?.[1] ?? "";
    if (!content) continue;
    const where =
      name === "description"
        ? "description"
        : name.startsWith("og:")
          ? "og"
          : name.startsWith("twitter:")
            ? "twitter"
            : null;
    if (!where) continue;
    for (const m of matches(content)) push(where, m, `${name}: ${content}`);
  }

  for (const block of html.matchAll(
    /<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi,
  )) {
    let data;
    try {
      data = JSON.parse(block[1]);
    } catch {
      push("json-ld", "(unparseable JSON-LD)", block[1]);
      continue;
    }
    for (const { path, value } of jsonStrings(data))
      for (const m of matches(value)) push("json-ld", m, `${path}: ${value}`);
  }

  // Visible markup = the <body> (text and attributes) minus scripts/styles;
  // the head's title and metadata are reported by the surfaces above.
  const body = html.match(/<body\b[^>]*>([\s\S]*?)<\/body>/i)?.[1] ?? html;
  const markup = decodeBraces(stripNonVisible(body));
  for (const m of markup.matchAll(PLACEHOLDER_RE)) {
    const start = Math.max(0, m.index - 60);
    push("markup", m[0], markup.slice(start, m.index + m[0].length + 60));
  }
  return hits;
}
