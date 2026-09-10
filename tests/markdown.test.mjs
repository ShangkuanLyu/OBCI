// Runs with `npm test` (node --test). Block parser behind the article body
// renderer (src/lib/utils/markdown.tsx): the standalone image syntax and
// regression cases for headings, lists and bold. The renderer never injects
// raw HTML, so anything the parser refuses must come back as plain text.
import { test, describe } from "node:test";
import assert from "node:assert/strict";
import {
  isAllowedImageSrc,
  parseImageLine,
  parseInline,
  parseMarkdown,
} from "../src/lib/utils/markdown-parse.mjs";

describe("block-level images", () => {
  test("a standalone ![caption](src) line is an image block with its caption", () => {
    assert.deepEqual(parseMarkdown("![年会合影](news/agm-2026/01.jpg)"), [
      { type: "image", src: "news/agm-2026/01.jpg", caption: "年会合影" },
    ]);
  });

  test("an empty caption is kept empty (no figcaption)", () => {
    assert.deepEqual(parseMarkdown("![](news/agm-2026/02.jpg)"), [
      { type: "image", src: "news/agm-2026/02.jpg", caption: "" },
    ]);
  });

  test("site assets in public/ and every allowed extension", () => {
    const local = parseMarkdown(
      "![Cover](/news-media/oceania-business-council-2026-agm-melbourne/01.jpg)",
    );
    assert.equal(local[0].type, "image");
    assert.equal(
      local[0].src,
      "/news-media/oceania-business-council-2026-agm-melbourne/01.jpg",
    );
    for (const ext of ["jpg", "jpeg", "png", "webp", "avif", "JPG"]) {
      assert.equal(isAllowedImageSrc(`news/slug/photo.${ext}`), true, ext);
    }
  });

  test("a rejected src renders the line as plain text", () => {
    const rejected = [
      "https://example.com/photo.jpg",
      "//cdn.example.com/photo.jpg",
      "news/slug/vector.svg",
      "news/slug/photo.jpg?x=1",
      "data:image/png;base64,AAAA",
      "../news/slug/photo.jpg",
      "news/./slug/photo.jpg",
      "news slug/photo.jpg",
      "javascript:alert(1)",
    ];
    for (const src of rejected) {
      assert.equal(isAllowedImageSrc(src), false, src);
    }
    const line = "![x](https://example.com/photo.jpg)";
    assert.equal(parseImageLine(line), null);
    assert.deepEqual(parseMarkdown(line), [{ type: "paragraph", text: line }]);
  });

  test("an image line inside a list block is list text, not an image", () => {
    assert.deepEqual(parseMarkdown("- one\n- ![c](news/slug/01.jpg)"), [
      { type: "list", items: ["one", "![c](news/slug/01.jpg)"] },
    ]);
  });

  test("an image line sharing a block with other text is paragraph text", () => {
    assert.deepEqual(parseMarkdown("Intro line\n![c](news/slug/01.jpg)"), [
      { type: "paragraph", text: "Intro line ![c](news/slug/01.jpg)" },
    ]);
  });

  test("images sit between paragraphs as their own blocks", () => {
    const blocks = parseMarkdown(
      "First paragraph.\n\n![Caption](news/slug/01.jpg)\n\nSecond paragraph.",
    );
    assert.deepEqual(
      blocks.map((b) => b.type),
      ["paragraph", "image", "paragraph"],
    );
  });
});

describe("headings, lists and bold (regression)", () => {
  test("## and ### headings", () => {
    assert.deepEqual(parseMarkdown("## 会议纪要\n\n### 细节"), [
      { type: "heading", level: 2, text: "会议纪要" },
      { type: "heading", level: 3, text: "细节" },
    ]);
  });

  test("a heading line starting with an image marker stays a heading", () => {
    assert.deepEqual(parseMarkdown("## ![c](news/slug/01.jpg)"), [
      { type: "heading", level: 2, text: "![c](news/slug/01.jpg)" },
    ]);
  });

  test("- lists, with indented items trimmed", () => {
    assert.deepEqual(parseMarkdown("- one\n  - two\n- three"), [
      { type: "list", items: ["one", "two", "three"] },
    ]);
  });

  test("paragraphs join soft line breaks; CRLF and blank-line runs are normalised", () => {
    assert.deepEqual(parseMarkdown("a\r\nb\r\n\r\n\r\nc"), [
      { type: "paragraph", text: "a b" },
      { type: "paragraph", text: "c" },
    ]);
  });

  test("**bold** runs", () => {
    assert.deepEqual(parseInline("plain **bold** tail"), [
      { type: "text", text: "plain " },
      { type: "strong", text: "bold" },
      { type: "text", text: " tail" },
    ]);
    assert.deepEqual(parseInline("**only**"), [{ type: "strong", text: "only" }]);
    assert.deepEqual(parseInline("no markup"), [{ type: "text", text: "no markup" }]);
    assert.deepEqual(parseInline("unclosed **bold"), [
      { type: "text", text: "unclosed **bold" },
    ]);
  });
});
