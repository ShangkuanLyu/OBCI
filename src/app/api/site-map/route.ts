import { sitemapXml } from "@/lib/sitemap";

// What /sitemap.xml serves on the Node host (rewritten in next.config.ts):
// the sitemap rendered on request, so an article or event added in the CMS
// or the database is listed without a deployment. `s-maxage` lets the CDN
// answer for five minutes and refresh in the background after that.
//
// It lives here rather than at /sitemap.xml because Next prerenders any app
// route whose path ends in /sitemap.xml, and on Vercel that prerendered
// file was never regenerated: both the `sitemap.ts` convention and a Route
// Handler with `revalidate = 300` still served their build-time timestamps
// ten minutes after deploying (2026-11-06). The directory name avoids the
// word "sitemap" for the same reason. The Pages export strips src/app/api
// and serves the prerendered copy from src/app/sitemap.xml/route.ts.
export const dynamic = "force-dynamic";

export async function GET(): Promise<Response> {
  return new Response(await sitemapXml(), {
    headers: {
      "Content-Type": "application/xml",
      "Cache-Control": "public, s-maxage=300, stale-while-revalidate=86400",
    },
  });
}
