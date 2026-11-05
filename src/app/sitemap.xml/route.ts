import { getAllNewsSlugs, getPublishedNews } from "@/services/news";
import { getAllEventSlugs, getPastEvents, getUpcomingEvents } from "@/services/events";
import { getChapters } from "@/services/organisation";
import { getSiteSettings } from "@/services/settings";
import { routing } from "@/i18n/routing";
import { absoluteUrl } from "@/lib/seo";
import { LEGAL_DOCUMENTS, legalDocumentVersion } from "@/lib/review";
import { renderSitemapXml, type SitemapEntry } from "@/lib/utils/sitemap-xml.mjs";

// A plain Route Handler rather than the `sitemap.ts` file convention. The
// convention's generated handler pins `Cache-Control: public, max-age=0,
// must-revalidate` on its response, and Next never replaces a Cache-Control
// a handler set itself, so its `revalidate` did not reach the host: on
// Vercel the file built at deploy time was served until the next
// deployment, and an article or event added in the CMS or the database
// stayed out of sitemap.xml. This handler sets no Cache-Control, so it is
// regenerated on the same 300-second cycle as the public pages.
//
// `force-static` keeps it prerendered: the Pages export writes
// out/sitemap.xml at build time (and ignores `revalidate`).
export const dynamic = "force-static";
export const revalidate = 300;

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

export async function GET(): Promise<Response> {
  return new Response(renderSitemapXml(await sitemapEntries()), {
    headers: { "Content-Type": "application/xml" },
  });
}
