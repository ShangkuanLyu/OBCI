import type { Locale } from "@/i18n/routing";
import { basePath } from "./asset";

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

/** Day-of-month in Melbourne time — keeps date chips consistent with
 *  formatDate regardless of the build machine's timezone. */
export function melbourneDay(iso: string | null): string {
  if (!iso) return "";
  return new Intl.DateTimeFormat("en-AU", {
    timeZone: "Australia/Melbourne",
    day: "numeric",
  }).format(new Date(iso));
}

/** Public URL for an object in the public `media` bucket. */
export function mediaUrl(path: string | null): string | null {
  if (!path) return null;
  return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/media/${path}`;
}

/**
 * Image URL for content rows: a leading "/" marks a local public asset
 * (used by the design-review preview); anything else is a storage path.
 */
export function imageUrl(path: string | null): string | null {
  if (!path) return null;
  if (path.startsWith("/")) {
    return `${basePath()}${path}`;
  }
  return mediaUrl(path);
}
