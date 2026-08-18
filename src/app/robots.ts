import type { MetadataRoute } from "next";

export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.obci.org.au";
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/zh/admin", "/en/admin", "/api"] }],
    sitemap: `${base}/sitemap.xml`,
  };
}
