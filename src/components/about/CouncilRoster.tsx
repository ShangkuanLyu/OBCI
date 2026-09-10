import { loc } from "@/lib/utils/l10n";
import type { CouncilMember } from "@/lib/content/types";
import type { Locale } from "@/i18n/routing";

/**
 * Compact name grid of the council roster (执委会议员): names only, no
 * portraits, in roster order. Renders just the list — the page supplies
 * the heading (h2) and the provenance note so heading levels stay valid.
 * Bilingual: the other-language name is shown small when it differs, and
 * a member's note (e.g. 创会会长 / Founding President) sits beneath.
 */
export function CouncilRoster({
  members,
  locale,
  className,
}: {
  members: CouncilMember[];
  locale: Locale;
  className?: string;
}) {
  if (members.length === 0) return null;
  const other: Locale = locale === "zh" ? "en" : "zh";
  return (
    <ul
      className={
        className ??
        "grid gap-x-8 gap-y-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
      }
    >
      {members.map((member, i) => {
        const name = loc(member, "name", locale);
        const alt = loc(member, "name", other);
        const note = loc(member, "note", locale);
        return (
          <li
            key={`${member.name_en}-${i}`}
            className="border-t border-grey-100 pt-4"
          >
            <p className="text-body font-medium text-ink">{name}</p>
            {alt && alt !== name && (
              <p className="mt-0.5 text-small text-grey-500">{alt}</p>
            )}
            {note && <p className="mt-1 text-caption text-sea-800">{note}</p>}
          </li>
        );
      })}
    </ul>
  );
}
