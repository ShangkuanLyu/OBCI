// Pure block parser for CMS article bodies. No React and no DOM, so it can
// be unit-tested with `node --test` (tests/markdown.test.mjs); rendering
// lives in markdown.tsx. Content comes from our own CMS, and nothing here
// ever produces raw HTML — every block is structured data the renderer
// turns into elements.

/**
 * @typedef {{ type: "heading"; level: 2 | 3; text: string }} HeadingBlock
 * @typedef {{ type: "list"; items: string[] }} ListBlock
 * @typedef {{ type: "image"; src: string; caption: string }} ImageBlock
 * @typedef {{ type: "paragraph"; text: string }} ParagraphBlock
 * @typedef {HeadingBlock | ListBlock | ImageBlock | ParagraphBlock} MarkdownBlock
 * @typedef {{ type: "text" | "strong"; text: string }} InlineNode
 */

/**
 * A whole block that is exactly one line of the form `![caption](src)`.
 * The caption may be empty; the source may not contain whitespace or
 * parentheses.
 */
const IMAGE_LINE_RE = /^!\[([^\]\n]*)\]\(([^()\s]+)\)$/;

/**
 * Allowed image sources: an optional leading slash, then slash-separated
 * segments of letters, digits, dot, underscore and hyphen, ending in a
 * raster extension (case-insensitive). Covers storage-relative paths such
 * as `news/slug/01.jpg` and site assets shipped in public/ such as
 * `/news-media/slug/01.jpg`. Protocol URLs, query strings, data URIs and
 * SVG are all rejected.
 */
const IMAGE_SRC_RE =
  /^\/?[A-Za-z0-9._-]+(?:\/[A-Za-z0-9._-]+)*\.(?:jpe?g|png|webp|avif)$/i;

/**
 * Whether `src` is an acceptable image source for a body image (see
 * IMAGE_SRC_RE); `.` and `..` path segments are refused as well.
 * @param {string} src
 * @returns {boolean}
 */
export function isAllowedImageSrc(src) {
  if (!IMAGE_SRC_RE.test(src)) return false;
  return !src.split("/").some((segment) => segment === "." || segment === "..");
}

/**
 * Parse a single line as a block-level image. Returns null unless the whole
 * line is `![caption](src)` with an allowed `src`.
 * @param {string} line
 * @returns {ImageBlock | null}
 */
export function parseImageLine(line) {
  const match = IMAGE_LINE_RE.exec(line);
  if (!match) return null;
  const [, caption, src] = match;
  if (!isAllowedImageSrc(src)) return null;
  return { type: "image", src, caption: caption.trim() };
}

/**
 * Split inline text into plain and `**bold**` runs.
 * @param {string} text
 * @returns {InlineNode[]}
 */
export function parseInline(text) {
  return text
    .split(/(\*\*[^*]+\*\*)/g)
    .filter((part) => part !== "")
    .map((part) =>
      part.startsWith("**") && part.endsWith("**") && part.length > 4
        ? { type: "strong", text: part.slice(2, -2) }
        : { type: "text", text: part },
    );
}

/**
 * Parse one trimmed, non-empty block (blocks are separated by blank lines).
 * @param {string} block
 * @returns {MarkdownBlock}
 */
function parseBlock(block) {
  if (block.startsWith("### ")) {
    return { type: "heading", level: 3, text: block.slice(4) };
  }
  if (block.startsWith("## ")) {
    return { type: "heading", level: 2, text: block.slice(3) };
  }
  // Images are standalone blocks only: one line, nothing else in the block.
  if (!block.includes("\n")) {
    const image = parseImageLine(block);
    if (image) return image;
  }
  const lines = block.split("\n");
  if (lines.every((line) => line.trim().startsWith("- "))) {
    return { type: "list", items: lines.map((line) => line.trim().slice(2)) };
  }
  return { type: "paragraph", text: block.replaceAll("\n", " ") };
}

/**
 * Parse a markdown source into blocks: `## ` / `### ` headings, `- ` lists,
 * standalone `![caption](src)` images and paragraphs. Anything that is not
 * recognised — including an image line that shares its block with other
 * text, or an image whose source is not allowed — is kept as plain text.
 * @param {string} source
 * @returns {MarkdownBlock[]}
 */
export function parseMarkdown(source) {
  return source
    .replaceAll("\r\n", "\n")
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .filter(Boolean)
    .map(parseBlock);
}
