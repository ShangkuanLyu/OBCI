import type { MetadataRoute } from "next";

export const dynamic = "force-static";

import { getAllNewsSlugs, getPublishedNews } from "@/services/news";
import { getAllEventSlugs, getPastEvents, getUpcomingEvents } from "@/services/events";
import { getChapters } from "@/services/organisation";
import { getSiteSettings } from "@/services/settings";
import { routing } from "@/i18n/routing";
import { absoluteUrl } from "@/lib/seo";
import { isPreviewDeployment } from "@/lib/preview";
import { LEGAL_DOCUMENTS, legalDocumentVersion } from "@/lib/review";

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
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // The isolated review deployment advertises nothing to crawlers.
  if (isPreviewDeployment()) return [];

  const [newsSlugs, eventSlugs, chapters, news, upcoming, past, settings] =
    await Promise.all([
      getAllNewsSlugs().catch(() => []),
      getAllEventSlugs().catch(() => []),
      getChapters().catch(() => []),
      getPublishedNews().catch(() => []),
      getUpcomingEvents().catch(() => []),
      getPastEvents(500).catch(() => []),
      getSiteSettings().catch(() => ({})),
    ]);

  // Legal pages are advertised only once the chamber has approved the
  // text (legal.<doc>_version); unapproved pages are noindex placeholders.
  // Each document's route path is its document key.
  const legalPaths = LEGAL_DOCUMENTS.filter(
    (doc) => legalDocumentVersion(settings, doc) !== null,
  ).map((doc) => `/${doc}`);

  // Real modification dates where the content rows carry them.
  const modified = new Map<string, string>();
  for (const article of news)
    modified.set(`/news/${article.slug}`, article.updated_at ?? "");
  for (const event of [...upcoming, ...past])
    modified.set(`/events/${event.slug}`, event.updated_at);
  for (const chapter of chapters)
    modified.set(`/chapters/${chapter.slug}`, chapter.updated_at);

  const paths = [
    ...STATIC_ROUTES,
    ...legalPaths,
    ...newsSlugs.map((slug) => `/news/${slug}`),
    ...eventSlugs.map((slug) => `/events/${slug}`),
    ...chapters.map((chapter) => `/chapters/${chapter.slug}`),
  ];

  // URLs use the same trailing-slash form the static export serves.
  return paths.flatMap((path) =>
    routing.locales.map((locale) => ({
      url: absoluteUrl(locale, path || "/"),
      lastModified: modified.get(path)
        ? new Date(modified.get(path)!)
        : new Date(),
      alternates: {
        languages: Object.fromEntries(
          routing.locales.map((l) => [l, absoluteUrl(l, path || "/")]),
        ),
      },
    })),
  );
}
