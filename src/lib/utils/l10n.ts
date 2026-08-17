import type { Locale } from "@/i18n/routing";

type BilingualRow = Record<string, unknown>;

/**
 * Pick a bilingual column pair (`{field}_zh` / `{field}_en`) for the given
 * locale, falling back to the other locale so content never disappears when
 * one translation is missing.
 */
export function loc(row: BilingualRow, field: string, locale: Locale): string {
  const other: Locale = locale === "zh" ? "en" : "zh";
  const primary = row[`${field}_${locale}`];
  const fallback = row[`${field}_${other}`];
  return (
    (typeof primary === "string" && primary.trim() !== "" ? primary : null) ??
    (typeof fallback === "string" && fallback.trim() !== "" ? fallback : null) ??
    ""
  );
}

/** Format a date for the given locale (Melbourne time). */
export function formatDate(
  iso: string | null,
  locale: Locale,
  opts: Intl.DateTimeFormatOptions = { year: "numeric", month: "long", day: "numeric" },
): string {
  if (!iso) return "";
  return new Intl.DateTimeFormat(locale === "zh" ? "zh-CN" : "en-AU", {
    timeZone: "Australia/Melbourne",
    ...opts,
  }).format(new Date(iso));
}

/** Public URL for an object in the public `media` bucket. */
export function mediaUrl(path: string | null): string | null {
  if (!path) return null;
  return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/media/${path}`;
}
