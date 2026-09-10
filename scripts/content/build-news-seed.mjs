#!/usr/bin/env node
/**
 * Build the news seed migration from `content/news/*.md`.
 *
 * Output (generated — edit the Markdown sources, not the SQL):
 *   supabase/migrations/20260910120000_v2_news_content.sql
 *
 * Article photographs ship with the repository under `public/news-media/<slug>/`
 * and are referenced with a leading slash, so `imageUrl()` resolves them as site
 * assets (with the deployment base path) rather than media-bucket objects.
 * Images uploaded later through the CMS keep using storage paths.
 *
 * Source format: flat front matter (`key: value` lines between `---` fences),
 * then `<!-- body:zh -->` and `<!-- body:en -->` sections in the site's
 * restricted Markdown.
 *
 * Usage: node scripts/content/build-news-seed.mjs [--check]
 *   --check  validate only, write nothing (exit 1 on problems)
 */
import { readFileSync, readdirSync, writeFileSync, existsSync } from "node:fs";
import { join, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const CONTENT_DIR = join(ROOT, "content/news");
const MEDIA_DIR = join(ROOT, "public/news-media");
const SQL_OUT = join(ROOT, "supabase/migrations/20260910120000_v2_news_content.sql");

const KEYS = [
  "slug", "category", "tags", "status", "published_at", "is_featured", "cover", "author_name",
  "source_url", "source_doc", "title_zh", "title_en", "summary_zh", "summary_en",
];
const CATEGORIES = new Set(["association-news", "policy-insights", "market-insights", "going-global", "events-coverage", "trade-cooperation"]);
const CHAPTERS = new Set(["education", "construction", "real-estate", "talent-innovation", "business-services", "canberra-branch", "culture-arts", "tech-innovation", "health"]);
const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const IMAGE_LINE_RE = /^!\[([^\]]*)\]\(([^)]+)\)$/;
const FORBIDDEN = ["待补充", "TODO", "Lorem ipsum", "X,XXX", "$X,XXX"];
const PLACEHOLDER_RE = /\{\{[^{}]*\}\}|\$\{[^{}]*\}|\{\s*[\p{L}_][\p{L}\p{N}_]*\s*[,}]/u;

const check = process.argv.includes("--check");
const problems = [];

function parseFile(path) {
  const raw = readFileSync(path, "utf8").replace(/\r\n/g, "\n");
  const m = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!m) throw new Error(`${path}: missing front matter fences`);
  const meta = {};
  const seen = [];
  for (const line of m[1].split("\n")) {
    if (!line.trim()) continue;
    const idx = line.indexOf(":");
    if (idx < 0) throw new Error(`${path}: bad front matter line: ${line}`);
    const key = line.slice(0, idx).trim();
    meta[key] = line.slice(idx + 1).trim();
    seen.push(key);
  }
  const missing = KEYS.filter((k) => !(k in meta));
  if (missing.length) throw new Error(`${path}: missing keys ${missing.join(", ")}`);
  const extra = seen.filter((k) => !KEYS.includes(k));
  if (extra.length) throw new Error(`${path}: unknown keys ${extra.join(", ")}`);
  const body = m[2];
  const zhIdx = body.indexOf("<!-- body:zh -->");
  const enIdx = body.indexOf("<!-- body:en -->");
  if (zhIdx < 0 || enIdx < 0 || enIdx < zhIdx) throw new Error(`${path}: body markers missing or out of order`);
  const bodyZh = body.slice(zhIdx + "<!-- body:zh -->".length, enIdx).trim();
  const bodyEn = body.slice(enIdx + "<!-- body:en -->".length).trim();
  return { meta, bodyZh, bodyEn, path };
}

function validate(article) {
  const { meta, bodyZh, bodyEn, path } = article;
  const p = (msg) => problems.push(`${path}: ${msg}`);
  if (!SLUG_RE.test(meta.slug)) p(`invalid slug ${meta.slug}`);
  if (!CATEGORIES.has(meta.category)) p(`unknown category ${meta.category}`);
  for (const t of splitTags(meta.tags)) if (!CHAPTERS.has(t)) p(`unknown tag ${t}`);
  if (meta.status !== "published") p(`status must be published for launch, got ${meta.status}`);
  if (!meta.published_at) p("published article needs published_at");
  if (meta.published_at && Number.isNaN(Date.parse(meta.published_at))) p(`bad published_at ${meta.published_at}`);
  if (!["true", "false"].includes(meta.is_featured)) p(`bad is_featured ${meta.is_featured}`);
  if (!meta.title_zh && !meta.title_en) p("needs a title");
  if ([...meta.summary_zh].length > 160) p(`summary_zh too long (${[...meta.summary_zh].length})`);
  if (meta.summary_en.split(/\s+/).filter(Boolean).length > 60) p("summary_en over 60 words");
  if (meta.source_url && !/^https?:\/\/\S+$/.test(meta.source_url)) p("bad source_url");
  const mediaDir = join(MEDIA_DIR, meta.slug);
  if (meta.cover && !existsSync(join(mediaDir, meta.cover))) p(`cover ${meta.cover} not found under ${mediaDir}`);
  for (const [lang, body] of [["zh", bodyZh], ["en", bodyEn]]) {
    if (!body) p(`empty body_${lang}`);
    let firstHeadingSeen = false;
    const blocks = body.split(/\n{2,}/);
    for (const block of blocks) {
      const lines = block.split("\n");
      if (lines.length === 1) {
        const im = lines[0].match(IMAGE_LINE_RE);
        if (im) {
          if (!/^\d\d\.jpg$/.test(im[2])) p(`image ref must be NN.jpg: ${im[2]}`);
          else if (!existsSync(join(mediaDir, im[2]))) p(`image ${im[2]} not found for ${meta.slug}`);
          continue;
        }
      }
      if (/^#{1,6} /.test(lines[0])) {
        if (/^# /.test(lines[0])) p(`h1 in body_${lang}: ${lines[0]}`);
        if (!firstHeadingSeen && /^### /.test(lines[0])) p(`body_${lang} first heading must be ##: ${lines[0]}`);
        firstHeadingSeen = true;
      }
      const listLines = lines.filter((l) => l.startsWith("- ")).length;
      if (listLines && listLines !== lines.length) p(`mixed list block in body_${lang}: ${lines[0].slice(0, 40)}`);
      for (const l of lines) if (/^!\[/.test(l) && lines.length > 1) p(`image inside a multi-line block in body_${lang}: ${l.slice(0, 40)}`);
    }
  }
  const all = [meta.title_zh, meta.title_en, meta.summary_zh, meta.summary_en, bodyZh, bodyEn].join("\n");
  for (const f of FORBIDDEN) if (all.includes(f)) p(`forbidden string ${f}`);
  const ph = all.match(PLACEHOLDER_RE);
  if (ph) p(`unresolved placeholder-like text: ${ph[0]}`);
}

function splitTags(s) {
  return s.split(",").map((t) => t.trim()).filter(Boolean);
}

/** Site-asset prefix for an article's photographs (public/news-media/<slug>/). */
function mediaPrefix(slug) {
  return `/news-media/${slug}/`;
}

function rewriteImages(body, prefix) {
  return body.replace(/^!\[([^\]]*)\]\((\d\d\.jpg)\)$/gm, (_, cap, file) => `![${cap}](${prefix}${file})`);
}

function sqlText(s) {
  if (s === null || s === undefined || s === "") return "null";
  const tag = "$obci$";
  if (s.includes(tag)) throw new Error("body contains the dollar-quote tag");
  return `${tag}${s}${tag}`;
}

function sqlArray(tags) {
  return tags.length ? `array[${tags.map((t) => `'${t}'`).join(", ")}]::text[]` : "'{}'::text[]";
}

function toSql(a) {
  const { meta } = a;
  const tags = splitTags(meta.tags);
  const prefix = mediaPrefix(meta.slug);
  const cover = meta.cover ? `'${prefix}${meta.cover}'` : "null";
  const published = `'${meta.published_at}'::timestamptz`;
  return `-- ${meta.slug} (source: ${meta.source_doc || meta.source_url || "n/a"})
insert into public.news (slug, category_id, title_zh, title_en, summary_zh, summary_en, body_zh, body_en, tags, cover_image_path, status, published_at, is_featured, author_name, source_url)
values (
  '${meta.slug}',
  (select id from public.news_categories where slug = '${meta.category}'),
  ${sqlText(meta.title_zh)}, ${sqlText(meta.title_en)},
  ${sqlText(meta.summary_zh)}, ${sqlText(meta.summary_en)},
  ${sqlText(rewriteImages(a.bodyZh, prefix))},
  ${sqlText(rewriteImages(a.bodyEn, prefix))},
  ${sqlArray(tags)}, ${cover}, '${meta.status}', ${published}, ${meta.is_featured}, ${sqlText(meta.author_name)}, ${sqlText(meta.source_url)}
)
on conflict (slug) do update set
  category_id = excluded.category_id,
  title_zh = excluded.title_zh, title_en = excluded.title_en,
  summary_zh = excluded.summary_zh, summary_en = excluded.summary_en,
  body_zh = excluded.body_zh, body_en = excluded.body_en,
  tags = excluded.tags,
  cover_image_path = coalesce(excluded.cover_image_path, public.news.cover_image_path),
  status = excluded.status,
  published_at = excluded.published_at,
  is_featured = excluded.is_featured,
  author_name = excluded.author_name,
  source_url = excluded.source_url,
  updated_at = now();
`;
}

const files = readdirSync(CONTENT_DIR).filter((f) => f.endsWith(".md")).sort();
const articles = files.map((f) => parseFile(join(CONTENT_DIR, f)));
const slugs = new Set();
for (const a of articles) {
  if (slugs.has(a.meta.slug)) problems.push(`${a.path}: duplicate slug`);
  slugs.add(a.meta.slug);
  validate(a);
}
if (problems.length) {
  console.error(problems.map((p) => ` - ${p}`).join("\n"));
  process.exit(1);
}
console.log(`${articles.length} articles valid`);
if (check) process.exit(0);

const sql = `-- 010 · 2026-09 article set (generated by scripts/content/build-news-seed.mjs
-- from content/news/*.md — do not edit by hand; edit the Markdown and re-run).
--
-- Rows are upserted by slug: seven new articles plus the 2026 annual general
-- meeting report, which replaces the earlier translation with the council's
-- own full-text article and its photographs. Article photographs ship with
-- the site under public/news-media/<slug>/ and are referenced with a leading
-- slash, so no Storage upload is required.
--
-- Applied to the remote project on 2026-09-10 (launch), after
-- 20260902120000 → 121000 → 122000 (the five first-level categories must
-- exist before the category sub-selects run). Article bodies are edited in
-- the CMS from here on; re-running this seed would overwrite those edits.

${articles.map(toSql).join("\n")}`;
writeFileSync(SQL_OUT, sql);
console.log(`wrote ${SQL_OUT}`);
