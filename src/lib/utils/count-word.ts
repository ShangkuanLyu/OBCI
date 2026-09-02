import type { Locale } from "@/i18n/routing";

const ZH_NUMERALS = ["零", "一", "二", "三", "四", "五", "六", "七", "八", "九", "十"];
const EN_NUMERALS = [
  "Zero", "One", "Two", "Three", "Four", "Five",
  "Six", "Seven", "Eight", "Nine", "Ten",
];

/**
 * Count word for headings that state how many items a data-driven list
 * holds ("六大行业分会" / "Six industry chapters"): numerals up to ten,
 * digits beyond, so copy can never contradict the published rows.
 * Dependency-free so it runs under `node --test`.
 */
export function countWord(count: number, locale: Locale): string {
  const n = Math.max(0, Math.floor(count));
  if (n <= 10) return locale === "zh" ? ZH_NUMERALS[n] : EN_NUMERALS[n];
  return String(n);
}
