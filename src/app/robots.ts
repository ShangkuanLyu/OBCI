import type { MetadataRoute } from "next";
import { isPreviewDeployment } from "@/lib/preview";

export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  // The isolated review deployment blocks all crawling.
  if (isPreviewDeployment()) {
    return { rules: [{ userAgent: "*", disallow: "/" }] };
  }
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.obci.org.au";
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/zh/admin", "/en/admin", "/api"] }],
    sitemap: `${base}/sitemap.xml`,
  };
}
