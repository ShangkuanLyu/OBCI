import { setRequestLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Container } from "@/components/ui/Container";
import { PageHero } from "@/components/ui/PageHero";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";
import { ReviewNote } from "@/components/ui/ReviewNote";
import { OrgChart } from "@/components/about/OrgChart";
import { getChapters, getPartners } from "@/services/organisation";
import { getContentBlocks } from "@/services/content";
import { getSiteSettings } from "@/services/settings";
import { isModuleConfirmed } from "@/lib/review";
import { isPreviewDeployment } from "@/lib/preview";
import { loc } from "@/lib/utils/l10n";
import { pageMetadata } from "@/lib/seo";
import type { Locale } from "@/i18n/routing";
import type { Metadata } from "next";

export const revalidate = 300;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "structure" });
  return pageMetadata({
    locale,
    path: "/about/structure",
    title: t("title"),
    description: t("standfirst"),
  });
}

export default async function StructurePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: rawLocale } = await params;
  setRequestLocale(rawLocale);
  const locale = rawLocale as Locale;
  const t = await getTranslations("structure");
  const tAbout = await getTranslations("about");

  const [chapters, content, settings] = await Promise.all([
    getChapters().catch(() => []),
    getContentBlocks().catch(() => null),
    getSiteSettings().catch(() => ({})),
  ]);
  const partnersConfirmed = isModuleConfirmed(settings, "partners");
  const partners = partnersConfirmed
    ? await getPartners().catch(() => [])
    : [];
  const units = content?.orgStructure ?? [];

  return (
    <>
      <PageHero title={t("title")} standfirst={t("standfirst")} />

      {/* Structure chart — CMS units, chapters expanded from live rows */}
      {units.length > 0 && (
        <section className="bg-white py-16 md:py-24">
          <Container>
            <SectionHeading title={t("chartTitle")} />
            <div className="mt-10">
              <OrgChart
                label={t("chartTitle")}
                root={tAbout("orgChartRoot")}
                units={units}
                chapters={chapters}
                locale={locale}
              />
            </div>
          </Container>
        </section>
      )}

      {/* Industry chapters — numbered card tiles */}
      {chapters.length > 0 && (
        <section className="bg-grey-50 py-16 md:py-24">
          <Container>
            <SectionHeading
              title={t("committeesTitle")}
              standfirst={t("committeesText")}
            />
            <div className="mt-10 grid gap-6 sm:grid-cols-2 md:grid-cols-3">
              {chapters.map((chapter, i) => (
                <Reveal key={chapter.id} delay={(i % 3) * 80}>
                  <Link
                    href={`/chapters/${chapter.slug}`}
                    className="card-surface group block p-7 transition-shadow duration-300 hover:shadow-card-hover"
                  >
                    <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-sea-50 text-small font-semibold text-sea-800">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <h3 className="mt-5 text-h4 font-semibold text-ink transition-colors duration-200 group-hover:text-sea-800">
                      {loc(chapter, "name", locale)}
                    </h3>
                    {chapter.secretary_general && (
                      <p className="mt-2 text-small text-grey-500">
                        {t("secretaryGeneral")} · {chapter.secretary_general}
                      </p>
                    )}
                  </Link>
                </Reveal>
              ))}
            </div>
          </Container>
        </section>
      )}

      {/* Partnerships — published only once the chamber confirms the list */}
      {partnersConfirmed && partners.length > 0 ? (
        <section className="bg-white py-16 md:py-24">
          <Container>
            <h2 className="text-center text-caption font-semibold uppercase tracking-[0.08em] text-sea-800">
              {t("partnershipsTitle")}
            </h2>
            <p className="mx-auto mt-6 max-w-[48rem] text-center text-body leading-loose text-grey-600">
              {partners.map((partner, i) => (
                <span key={partner.id}>
                  {loc(partner, "name", locale)}
                  {i < partners.length - 1 && (
                    <span className="mx-4 text-grey-300">·</span>
                  )}
                </span>
              ))}
            </p>
          </Container>
        </section>
      ) : (
        isPreviewDeployment() && (
          <section className="bg-white py-6">
            <Container>
              <ReviewNote>
                {tAbout("reviewCmsPending", { module: t("partnershipsTitle") })}
              </ReviewNote>
            </Container>
          </section>
        )
      )}
    </>
  );
}
