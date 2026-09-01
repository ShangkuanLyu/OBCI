import type { Metadata } from "next";
import { routing } from "@/i18n/routing";

/**
 * NEXT_PUBLIC_SITE_URL already contains the deployment base path
 * (e.g. https://shangkuanlyu.github.io/OBCI), so URLs built here are
 * correct on GitHub Pages without further prefixing.
 */
const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"
).replace(/\/+$/, "");

/** Absolute, trailing-slashed URL for a locale-prefixed path. */
export function absoluteUrl(locale: string, path = ""): string {
  const clean = path === "/" ? "" : path.replace(/\/+$/, "");
  return `${SITE_URL}/${locale}${clean}/`;
}

export function siteUrl(): string {
  return SITE_URL;
}

/**
 * Standard per-page metadata: localized title/description, canonical URL
 * and hreflang alternates (zh / en / x-default → zh, the default locale).
 */
export function pageMetadata({
  locale,
  path,
  title,
  description,
  ogImage,
}: {
  locale: string;
  path: string;
  title: string;
  description?: string;
  ogImage?: string;
}): Metadata {
  const canonical = absoluteUrl(locale, path);
  const languages: Record<string, string> = {};
  for (const l of routing.locales) languages[l] = absoluteUrl(l, path);
  languages["x-default"] = absoluteUrl(routing.defaultLocale, path);
  return {
    title,
    description,
    alternates: { canonical, languages },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName:
        locale === "zh"
          ? "大洋洲工商协会 OBAI"
          : "Oceania Business Association (OBAI)",
      locale: locale === "zh" ? "zh_CN" : "en_AU",
      type: "website",
      ...(ogImage ? { images: [{ url: ogImage }] } : {}),
    },
    twitter: {
      card: ogImage ? "summary_large_image" : "summary",
      title,
      description,
    },
  };
}
