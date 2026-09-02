import type { MetadataRoute } from "next";
import { isPreviewDeployment } from "@/lib/preview";
import { siteUrl } from "@/lib/seo";

export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  // The isolated review deployment blocks all crawling.
  if (isPreviewDeployment()) {
    return { rules: [{ userAgent: "*", disallow: "/" }] };
  }
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/zh/admin", "/en/admin", "/zh/login", "/en/login", "/api"],
      },
    ],
    sitemap: `${siteUrl()}/sitemap.xml`,
  };
}
