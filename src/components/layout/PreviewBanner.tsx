/**
 * Site-wide review-preview notice. Plain markup, no interactivity and no
 * focusable elements (the skip link must stay the first tab stop). Built
 * from existing tokens only: deep-sea ground, white text, one gold rule.
 */
export function PreviewBanner({
  badge,
  text,
}: {
  badge: string;
  text: string;
}) {
  return (
    <div
      role="region"
      aria-label={badge}
      className="border-b-2 border-gold-600 bg-sea-950 text-white"
    >
      <div className="mx-auto flex w-full max-w-[69.5rem] items-center gap-3 px-6 py-2 md:px-10">
        <span className="shrink-0 rounded-full border border-white/40 px-2 py-0.5 text-[0.6875rem] font-semibold uppercase tracking-[0.08em] text-white">
          {badge}
        </span>
        <p className="text-[0.8125rem] leading-snug text-white/90">{text}</p>
      </div>
    </div>
  );
}
