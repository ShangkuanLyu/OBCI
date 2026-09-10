import type { Metadata } from "next";
import { routing } from "@/i18n/routing";

/**
 * Absolute origin the deployment serves from, used for canonical URLs, the
 * sitemap, Open Graph images and JSON-LD. Every consumer is a server module
 * (pages, metadata, robots, sitemap), so a server-only variable is enough.
 *
 * NEXT_PUBLIC_SITE_URL wins and must include the deployment base path when
 * one is used (a static export under a sub-path, e.g.
 * https://example.github.io/OBCI). On Vercel, where the site is served from
 * the domain root, VERCEL_PROJECT_PRODUCTION_URL is the fallback: it is set
 * on every deployment and names the production domain, so a project deploys
 * with correct absolute URLs before any variable is configured.
 */
const VERCEL_PRODUCTION_URL = process.env.VERCEL_PROJECT_PRODUCTION_URL;
const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ??
  (VERCEL_PRODUCTION_URL ? `https://${VERCEL_PRODUCTION_URL}` : undefined) ??
  "http://localhost:3000"
).replace(/\/+$/, "");

/** The static export serves trailing-slashed directory URLs; the Node
 *  build serves the bare form and 308-redirects the slashed one. */
const TRAILING_SLASH = process.env.STATIC_EXPORT === "1" ? "/" : "";

/** Default share card (logo lockup on white with the Chinese name), 1200×630. */
const DEFAULT_OG_IMAGE = `${SITE_URL}/og/brand.png`;

/** Absolute URL for a locale-prefixed path, in the shape this build serves. */
export function absoluteUrl(locale: string, path = ""): string {
  const clean = path === "/" ? "" : path.replace(/\/+$/, "");
  return `${SITE_URL}/${locale}${clean}${TRAILING_SLASH}`;
}

export function siteUrl(): string {
  return SITE_URL;
}

/**
 * Standard per-page metadata: localized title/description, canonical URL,
 * hreflang alternates (zh / en / x-default → zh, the default locale),
 * Open Graph and Twitter cards. Pages without their own image fall back
 * to the brand card so every share carries an image.
 */
export function pageMetadata({
  locale,
  path,
  title,
  description,
  ogImage,
  ogType = "website",
  publishedTime,
  modifiedTime,
}: {
  locale: string;
  path: string;
  title: string;
  description?: string;
  ogImage?: string;
  ogType?: "website" | "article";
  publishedTime?: string;
  modifiedTime?: string;
}): Metadata {
  const canonical = absoluteUrl(locale, path);
  const languages: Record<string, string> = {};
  for (const l of routing.locales) languages[l] = absoluteUrl(l, path);
  languages["x-default"] = absoluteUrl(routing.defaultLocale, path);
  const siteName =
    locale === "zh" ? "大洋洲工商业委员会 OBCI" : "Oceania Business Council (OBCI)";
  const image = ogImage
    ? { url: ogImage, alt: title }
    : {
        url: DEFAULT_OG_IMAGE,
        width: 1200,
        height: 630,
        alt: "OBCI · 大洋洲工商业委员会 · Oceania Business Council",
      };
  return {
    title,
    description,
    alternates: { canonical, languages },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName,
      locale: locale === "zh" ? "zh_CN" : "en_AU",
      alternateLocale: locale === "zh" ? ["en_AU"] : ["zh_CN"],
      images: [image],
      ...(ogType === "article"
        ? { type: "article", publishedTime, modifiedTime }
        : { type: "website" }),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image.url],
    },
  };
}
