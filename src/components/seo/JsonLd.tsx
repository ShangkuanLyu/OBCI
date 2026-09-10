import type { Json } from "@/types/database.types";

/** Renders a JSON-LD structured-data script tag. */
export function JsonLd({ data }: { data: Record<string, Json | undefined> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

/** Brand name used wherever structured data names the council as an
 *  author, publisher or organiser. */
export const ORGANIZATION_NAME = "Oceania Business Council";

/**
 * Site-wide Organization schema: brand name, the incorporated legal name,
 * and the logo lockup. Registration identifiers (ABN/ACN or incorporation
 * number) are intentionally omitted until the chamber confirms which set
 * to publish. `siteUrl` already carries the deployment base path.
 */
export function organizationJsonLd(siteUrl: string) {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Oceania Business Council Inc.",
    legalName: "Oceania Business Association Incorporated",
    alternateName: ["OBCI", "大洋洲工商业委员会"],
    url: siteUrl,
    logo: `${siteUrl}/brand/logo-lockup.png`,
  } as Record<string, Json>;
}
