import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { notFound } from "next/navigation";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { siteUrl } from "@/lib/seo";
import { isPreviewDeployment } from "@/lib/preview";
import { JsonLd, organizationJsonLd } from "@/components/seo/JsonLd";
import "../globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const zh = locale === "zh";
  return {
    metadataBase: new URL(siteUrl()),
    // The isolated review deployment must never be indexed.
    ...(isPreviewDeployment()
      ? { robots: { index: false, follow: false } }
      : {}),
    title: {
      default: zh
        ? "大洋洲工商协会 OBAI | Oceania Business Association"
        : "Oceania Business Association (OBAI) | 大洋洲工商协会",
      template: "%s | OBAI",
    },
    description: zh
      ? "大洋洲工商协会（OBAI）——搭建中澳及大洋洲多边商业互通枢纽，赋能中国企业轻资产出海、澳洲企业拓展亚太市场。"
      : "Oceania Business Association (OBAI) — a multilateral business hub linking China, Australia and Oceania, enabling Chinese enterprises to go global asset-light and Australian businesses to expand into the Asia-Pacific.",
  };
}

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }
  setRequestLocale(locale);

  return (
    <html
      lang={locale}
      className={`${geistSans.variable} antialiased`}
      data-preview={isPreviewDeployment() ? "" : undefined}
      // data-js is added by the inline script below before hydration.
      suppressHydrationWarning
    >
      <body className="min-h-dvh flex flex-col">
        {/* Marks the document as JS-capable before first paint so the
            scroll-reveal hidden state (globals.css) never applies to a
            no-JS render. */}
        <script
          dangerouslySetInnerHTML={{
            __html: 'document.documentElement.setAttribute("data-js","");',
          }}
        />
        <JsonLd data={organizationJsonLd(siteUrl())} />
        <NextIntlClientProvider>{children}</NextIntlClientProvider>
      </body>
    </html>
  );
}
