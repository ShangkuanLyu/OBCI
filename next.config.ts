import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

// Old Wix post slug → new slug (see docs/information-architecture.md §6).
const OLD_POST_REDIRECTS: Record<string, string> = {
  "australia-new-zealand-health-products-pty-ltd":
    "acbca-chinese-new-year-networking-event",
  "the-7th-world-traditional-medicine-forum-cum-world-federation-of-tcm-trade-services-conference":
    "7th-world-traditional-medicine-forum-melbourne",
  "the-preparatory-meeting-for-the-world-traditional-medicine-forum-cum-world-federation-of-tcm-trade-s":
    "world-traditional-medicine-forum-preparatory-meeting",
  "melbourne-hosts-major-international-gathering-australia-china-health-products-expo-world-tradition":
    "melbourne-australia-china-health-expo-tcm-forum-2025",
  "taizhou-delegation-visits-melbourne-to-strengthen-bilateral-cooperation-with-oceania-business-counci":
    "taizhou-delegation-visits-melbourne-cooperation",
  "oceania-business-council-holds-2026-annual-general-meeting-in-melbourne":
    "oceania-business-council-2026-agm-melbourne",
  "strengthening-cooperation-and-promoting-exchange-oceania-business-council-obc-vice-chair-of-the":
    "obc-delegation-visits-liaoning-ccpit",
};

const OLD_PAGE_REDIRECTS: Array<[string, string]> = [
  ["/about", "/zh/about"],
  ["/team-4", "/zh/about"],
  ["/services-7", "/zh/about/structure"],
  ["/news", "/zh/news"],
  ["/news-1", "/zh/news"],
  ["/events", "/zh/events"],
  ["/events-1/sydney-event", "/zh/events"],
  ["/events-1/brisbane-event", "/zh/events"],
  [
    "/events-1/the-7th-world-traditional-medicine-forum-cum-world-federation-of-tcm-trade-services-conference",
    "/zh/events/world-traditional-medicine-forum-2025",
  ],
  ["/general-7", "/zh/membership"],
  ["/projects-6", "/zh/membership"],
  ["/copy-of-member-industry-directory", "/zh/membership"],
  ["/current-projects", "/zh/projects"],
  ["/s-projects-basic", "/zh/projects"],
  ["/s-projects-side-by-side", "/zh/projects"],
  ["/s-projects-side-by-side-1", "/zh/projects"],
  ["/contact", "/zh/contact"],
  ["/contact-2", "/zh/contact"],
  ["/forum", "/zh/membership"],
  ["/members", "/zh/membership"],
  ["/donation-thank-you-page", "/zh"],
  ["/terms-and-conditions", "/zh/terms"],
  ["/copy-of-terms-conditions", "/zh/privacy"],
  ["/accessibility-statement", "/zh/accessibility"],
];

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "gmglssmdrsackqgkqdbu.supabase.co",
        pathname: "/storage/v1/**",
      },
    ],
  },
  async redirects() {
    return [
      ...OLD_PAGE_REDIRECTS.map(([source, destination]) => ({
        source,
        destination,
        permanent: true,
      })),
      ...Object.entries(OLD_POST_REDIRECTS).map(([oldSlug, newSlug]) => ({
        source: `/post/${oldSlug}`,
        destination: `/zh/news/${newSlug}`,
        permanent: true,
      })),
    ];
  },
};

export default withNextIntl(nextConfig);
