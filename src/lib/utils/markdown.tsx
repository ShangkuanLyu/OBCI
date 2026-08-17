import type { ReactNode } from "react";

/**
 * Minimal markdown renderer for CMS article bodies (paragraphs, ## / ###
 * headings, - lists, **bold**). Content comes from our own CMS; no raw HTML
 * is ever injected.
 */
export function renderMarkdown(source: string): ReactNode[] {
  const blocks = source.replaceAll("\r\n", "\n").split(/\n{2,}/);
  return blocks
    .map((block) => block.trim())
    .filter(Boolean)
    .map((block, i) => {
      if (block.startsWith("### ")) {
        return (
          <h3 key={i} className="mt-10 text-h4 font-semibold text-ink">
            {renderInline(block.slice(4))}
          </h3>
        );
      }
      if (block.startsWith("## ")) {
        return (
          <h2 key={i} className="mt-12 text-h3 font-semibold tracking-[-0.01em] text-ink">
            {renderInline(block.slice(3))}
          </h2>
        );
      }
      const lines = block.split("\n");
      if (lines.every((l) => l.trim().startsWith("- "))) {
        return (
          <ul key={i} className="mt-6 list-disc space-y-2 pl-6 text-body leading-relaxed text-grey-600">
            {lines.map((l, j) => (
              <li key={j}>{renderInline(l.trim().slice(2))}</li>
            ))}
          </ul>
        );
      }
      return (
        <p key={i} className="mt-6 text-body leading-relaxed text-grey-600 first:mt-0">
          {renderInline(block.replaceAll("\n", " "))}
        </p>
      );
    });
}

function renderInline(text: string): ReactNode[] {
  return text.split(/(\*\*[^*]+\*\*)/g).map((part, i) =>
    part.startsWith("**") && part.endsWith("**") ? (
      <strong key={i} className="font-semibold text-ink">
        {part.slice(2, -2)}
      </strong>
    ) : (
      part
    ),
  );
}
