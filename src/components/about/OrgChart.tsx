import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils/cn";
import { loc } from "@/lib/utils/l10n";
import type { ChapterRow } from "@/services/organisation";
import type { OrgUnit } from "@/lib/fixtures/design-review";
import type { Locale } from "@/i18n/routing";

/* Single-row chart: the connector bar spans from the first to the last
   column centre, so its insets depend on the column count. */
const ROW_CLASS: Record<number, string> = {
  1: "md:grid-cols-1 md:before:left-[50%] md:before:right-[50%]",
  2: "md:grid-cols-2 md:before:left-[25%] md:before:right-[25%]",
  3: "md:grid-cols-3 md:before:left-[16.667%] md:before:right-[16.667%]",
  4: "md:grid-cols-4 md:before:left-[12.5%] md:before:right-[12.5%]",
  5: "md:grid-cols-5 md:before:left-[10%] md:before:right-[10%]",
  6: "md:grid-cols-6 md:before:left-[8.333%] md:before:right-[8.333%]",
};

/**
 * Organisational structure chart: the association at the root and the
 * CMS-defined units beneath it, as a semantic nested list. The unit of
 * kind "chapters" expands to the live active chapters. No personnel are
 * attached — the chart shows units, never names.
 */
export function OrgChart({
  label,
  root,
  units,
  chapters,
  locale,
}: {
  label: string;
  root: string;
  units: OrgUnit[];
  chapters: ChapterRow[];
  locale: Locale;
}) {
  if (units.length === 0) return null;
  const columns = Math.min(units.length, 6);

  return (
    <div role="group" aria-label={label}>
      <div className="rounded-xl bg-sea-800 px-6 py-4 text-white md:mx-auto md:w-fit md:min-w-[18rem] md:text-center">
        <p className="text-body font-semibold">{root}</p>
      </div>
      <span
        aria-hidden
        className="mx-auto hidden h-8 w-px bg-grey-300 md:block"
      />
      {/* Mobile: a left rail (li::after) with a tick per unit (li::before).
          md+: a horizontal bar (ul::before) with a drop line per unit. */}
      <ul
        className={cn(
          "relative mt-4 space-y-4 pl-6",
          "md:mt-0 md:grid md:gap-4 md:space-y-0 md:pl-0 md:pt-8",
          "md:before:absolute md:before:top-0 md:before:h-px md:before:bg-grey-300",
          ROW_CLASS[columns],
        )}
      >
        {units.map((unit) => {
          const note = loc(unit, "note", locale);
          const expandsChapters = unit.kind === "chapters" && chapters.length > 0;
          return (
            <li
              key={unit.key}
              className={cn(
                "relative",
                "before:absolute before:-left-3 before:top-7 before:h-px before:w-3 before:bg-grey-300",
                "after:absolute after:-left-3 after:-top-4 after:bottom-0 after:w-px after:bg-grey-300 last:after:bottom-auto last:after:h-11",
                "md:pt-8 md:before:left-1/2 md:before:top-0 md:before:h-8 md:before:w-px md:after:hidden",
              )}
            >
              <div className="card-surface h-full p-5">
                <p className="text-body font-semibold leading-snug text-ink">
                  {loc(unit, "name", locale)}
                </p>
                {note && (
                  <p className="mt-1.5 text-small leading-relaxed text-grey-600">
                    {note}
                  </p>
                )}
                {expandsChapters && (
                  <ul className="mt-4 space-y-2 border-t border-grey-100 pt-4">
                    {chapters.map((chapter) => (
                      <li key={chapter.id}>
                        <Link
                          href={`/chapters/${chapter.slug}`}
                          className="text-small font-medium text-sea-800 transition-colors hover:text-sea-600"
                        >
                          {loc(chapter, "name", locale)}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
