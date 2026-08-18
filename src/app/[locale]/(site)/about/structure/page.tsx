import { setRequestLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Container } from "@/components/ui/Container";
import { PageHero } from "@/components/ui/PageHero";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";
import { getChapters, getPartners } from "@/services/organisation";
import { loc } from "@/lib/utils/l10n";
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
  return { title: t("title"), description: t("standfirst") };
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

  const [chapters, partners] = await Promise.all([
    getChapters().catch(() => []),
    getPartners().catch(() => []),
  ]);

  return (
    <>
      <PageHero title={t("title")} standfirst={t("standfirst")} />

      {/* Professional committees — numbered card tiles */}
      <section className="bg-white py-16 md:py-24">
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
                  className="card-surface group block p-7 transition-shadow duration-300 hover:shadow-[0_2px_4px_rgba(5,5,62,0.06),0_16px_40px_-16px_rgba(5,5,62,0.25)]"
                >
                  <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-royal-50 text-small font-semibold text-royal-600">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <h3 className="mt-5 text-h4 font-semibold text-ink transition-colors duration-200 group-hover:text-royal-600">
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

      {/* Partnerships — quiet light band */}
      {partners.length > 0 && (
        <section className="bg-grey-50 py-16 md:py-24">
          <Container>
            <p className="text-center text-caption font-semibold uppercase tracking-[0.08em] text-royal-600">
              {t("partnershipsTitle")}
            </p>
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
      )}
    </>
  );
}
