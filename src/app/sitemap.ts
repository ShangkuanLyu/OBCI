import type { MetadataRoute } from "next";
import { getAllNewsSlugs } from "@/services/news";
import { getAllEventSlugs } from "@/services/events";
import { getChapters } from "@/services/organisation";
import { routing } from "@/i18n/routing";

const STATIC_ROUTES = [
  "",
  "/about",
  "/about/leadership",
  "/about/structure",
  "/chapters",
  "/news",
  "/events",
  "/membership",
  "/membership/apply",
  "/projects",
  "/contact",
  "/terms",
  "/privacy",
  "/accessibility",
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.obci.org.au";
  const [newsSlugs, eventSlugs, chapters] = await Promise.all([
    getAllNewsSlugs().catch(() => []),
    getAllEventSlugs().catch(() => []),
    getChapters().catch(() => []),
  ]);

  const paths = [
    ...STATIC_ROUTES,
    ...newsSlugs.map((slug) => `/news/${slug}`),
    ...eventSlugs.map((slug) => `/events/${slug}`),
    ...chapters.map((chapter) => `/chapters/${chapter.slug}`),
  ];

  return paths.flatMap((path) =>
    routing.locales.map((locale) => ({
      url: `${base}/${locale}${path}`,
      lastModified: new Date(),
      alternates: {
        languages: Object.fromEntries(
          routing.locales.map((l) => [l, `${base}/${l}${path}`]),
        ),
      },
    })),
  );
}
