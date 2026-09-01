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

/**
 * Site-wide Organization schema. Registration identifiers (ABN/ACN or
 * incorporation number) are intentionally omitted until the chamber
 * confirms which set to publish.
 */
export function organizationJsonLd(siteUrl: string) {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Oceania Business Association Incorporated",
    alternateName: ["OBAI", "大洋洲工商协会"],
    url: siteUrl,
  } as Record<string, Json>;
}
