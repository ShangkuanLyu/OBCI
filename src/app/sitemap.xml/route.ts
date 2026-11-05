import { sitemapXml } from "@/lib/sitemap";

// Prerendered copy of the sitemap: the file the Pages export writes to
// out/sitemap.xml. Next treats every app route at a path ending in
// /sitemap.xml as a static metadata file and prerenders it whatever its
// segment config says, so on the Node host this route cannot follow the
// content — next.config.ts rewrites /sitemap.xml to the request-time
// handler in src/app/api/site-map/route.ts instead, and this copy is only
// reached if that rewrite is removed.
export const dynamic = "force-static";

export async function GET(): Promise<Response> {
  return new Response(await sitemapXml(), {
    headers: { "Content-Type": "application/xml" },
  });
}
