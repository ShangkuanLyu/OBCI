import { getAllNewsSlugs, getPublishedNews } from "@/services/news";
import { getAllEventSlugs, getPastEvents, getUpcomingEvents } from "@/services/events";
import { getChapters } from "@/services/organisation";
import { getSiteSettings } from "@/services/settings";
import { routing } from "@/i18n/routing";
import { absoluteUrl } from "@/lib/seo";
import { LEGAL_DOCUMENTS, legalDocumentVersion } from "@/lib/review";
import { renderSitemapXml, type SitemapEntry } from "@/lib/utils/sitemap-xml.mjs";

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

async function sitemapEntries(): Promise<SitemapEntry[]> {
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

  // Only legal pages that publish a text are advertised (they carry a
  // legal.<doc>_version). The constitution page has no published version —
  // the document is issued by the secretariat on request — so it stays out
  // of the sitemap. Each document's route path is its document key.
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
      alternates: Object.fromEntries(
        routing.locales.map((l) => [l, absoluteUrl(l, path || "/")]),
      ),
    })),
  );
}

/**
 * The site's sitemap.xml document: every static route, published legal
 * page, article, event and committee page, in both locales with hreflang
 * alternates. Two Route Handlers serve it — the request-time one at
 * /api/site-map (what /sitemap.xml resolves to on the Node host) and the
 * prerendered one at /sitemap.xml (what the static export writes).
 */
export async function sitemapXml(): Promise<string> {
  return renderSitemapXml(await sitemapEntries());
}
