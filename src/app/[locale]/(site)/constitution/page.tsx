import { setRequestLocale, getTranslations } from "next-intl/server";
import { Container } from "@/components/ui/Container";
import { PageHero } from "@/components/ui/PageHero";
import { ReviewNote } from "@/components/ui/ReviewNote";
import { getSiteSettings } from "@/services/settings";
import { legalDocumentVersion } from "@/lib/review";
import { pageMetadata } from "@/lib/seo";
import type { Metadata } from "next";

export const revalidate = 300;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const [t, settings] = await Promise.all([
    getTranslations({ locale, namespace: "legal" }),
    getSiteSettings().catch(() => ({})),
  ]);
  const approved = legalDocumentVersion(settings, "constitution") !== null;
  return {
    ...pageMetadata({
      locale,
      path: "/constitution",
      title: t("constitutionTitle"),
    }),
    // An unpublished placeholder must never be indexed.
    ...(approved ? {} : { robots: { index: false, follow: false } }),
  };
}

/**
 * Destination of the application form's constitution consent link
 * (lib/review.ts legalStatus().constitutionHref). No draft of the
 * constitution exists in this codebase, so every environment shows the
 * unpublished notice until the chamber supplies the approved text.
 */
export default async function ConstitutionPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("legal");

  return (
    <>
      <PageHero label={t("label")} title={t("constitutionTitle")} />

      <section className="bg-white py-16 md:py-24">
        <Container>
          <div className="max-w-[42rem]">
            <p className="text-body leading-relaxed text-grey-600">
              {t("unpublishedNotice")}
            </p>
            <ReviewNote className="mt-6" />
          </div>
        </Container>
      </section>
    </>
  );
}
