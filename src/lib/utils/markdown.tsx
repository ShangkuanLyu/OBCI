import type { ReactNode } from "react";
import { imageUrl } from "./l10n";
import {
  parseInline,
  parseMarkdown,
  type MarkdownBlock,
} from "./markdown-parse.mjs";

/**
 * Minimal markdown renderer for CMS article bodies: paragraphs, ## / ###
 * headings, - lists, **bold** and standalone `![caption](src)` images
 * (parsing lives in markdown-parse.mjs). Content comes from our own CMS;
 * no raw HTML is ever injected — an image line whose source is not an
 * allowed storage or local path is rendered as plain text.
 */
export function renderMarkdown(source: string): ReactNode[] {
  return parseMarkdown(source).map((block: MarkdownBlock, i: number) => {
    switch (block.type) {
      case "heading":
        return block.level === 3 ? (
          <h3 key={i} className="mt-10 text-h4 font-semibold text-ink">
            {renderInline(block.text)}
          </h3>
        ) : (
          <h2 key={i} className="mt-12 text-h3 font-semibold tracking-[-0.01em] text-ink">
            {renderInline(block.text)}
          </h2>
        );
      case "list":
        return (
          <ul key={i} className="mt-6 list-disc space-y-2 pl-6 text-body leading-relaxed text-grey-600">
            {block.items.map((item, j) => (
              <li key={j}>{renderInline(item)}</li>
            ))}
          </ul>
        );
      case "image": {
        // A leading "/" is a local public asset (basePath applied); anything
        // else is an object in the public media bucket.
        const src = imageUrl(block.src) ?? block.src;
        return (
          <figure key={i} className="mt-6 first:mt-0">
            {/* eslint-disable-next-line @next/next/no-img-element -- body images have arbitrary aspect ratios and the static export is unoptimized anyway */}
            <img
              src={src}
              alt={block.caption}
              loading="lazy"
              decoding="async"
              className="block h-auto w-full rounded-[4px] bg-sea-50"
            />
            {block.caption !== "" && (
              <figcaption className="mt-2 text-small leading-normal text-grey-500">
                {block.caption}
              </figcaption>
            )}
          </figure>
        );
      }
      default:
        return (
          <p key={i} className="mt-6 text-body leading-relaxed text-grey-600 first:mt-0">
            {renderInline(block.text)}
          </p>
        );
    }
  });
}

function renderInline(text: string): ReactNode[] {
  return parseInline(text).map((node, i) =>
    node.type === "strong" ? (
      <strong key={i} className="font-semibold text-ink">
        {node.text}
      </strong>
    ) : (
      node.text
    ),
  );
}
