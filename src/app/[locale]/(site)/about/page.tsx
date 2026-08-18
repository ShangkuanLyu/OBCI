import { setRequestLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Container } from "@/components/ui/Container";
import { PageHero } from "@/components/ui/PageHero";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";
import { getLeadership } from "@/services/organisation";
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
  const t = await getTranslations({ locale, namespace: "about" });
  return { title: t("title"), description: t("standfirst") };
}

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: rawLocale } = await params;
  setRequestLocale(rawLocale);
  const locale = rawLocale as Locale;
  const t = await getTranslations("about");

  const leadership = (await getLeadership().catch(() => [])).slice(0, 4);

  return (
    <>
      <PageHero
        label="About OBCI"
        title={t("title")}
        standfirst={t("standfirst")}
      />

      {/* Intro — editorial 5/7 split */}
      <section className="bg-white py-16 md:py-24">
        <Container>
          <div className="grid gap-10 md:grid-cols-12 md:gap-16">
            <div className="md:col-span-5">
              <SectionHeading label={t("introLabel")} title={t("introTitle")} />
            </div>
            <div className="md:col-span-7 md:pt-10">
              <p className="max-w-[42rem] text-body leading-relaxed text-grey-600">
                {t("introBody1")}
              </p>
              <p className="mt-6 max-w-[42rem] text-body leading-relaxed text-grey-600">
                {t("introBody2")}
              </p>
            </div>
          </div>
        </Container>
      </section>

      {/* Vision & mission — grey band, two hairline columns */}
      <section className="bg-grey-50 py-16 md:py-24">
        <Container>
          <SectionHeading label={t("missionLabel")} title={t("missionTitle")} />
          <div className="mt-14 grid gap-x-10 gap-y-10 md:grid-cols-2">
            <Reveal className="border-t border-grey-300 pt-6">
              <p className="text-caption font-medium uppercase tracking-[0.08em] text-rose-600">
                {t("visionTitle")}
              </p>
              <p className="mt-4 max-w-[42rem] text-body leading-relaxed text-grey-600">
                {t("visionText")}
              </p>
            </Reveal>
            <Reveal delay={80} className="border-t border-grey-300 pt-6">
              <p className="text-caption font-medium uppercase tracking-[0.08em] text-rose-600">
                {t("missionTitle2")}
              </p>
              <p className="mt-4 max-w-[42rem] text-body leading-relaxed text-grey-600">
                {t("missionText")}
              </p>
            </Reveal>
          </div>
        </Container>
      </section>

      {/* Leadership teaser — typographic grid */}
      <section className="bg-white py-16 md:py-24">
        <Container>
          <SectionHeading
            label={t("leadershipLabel")}
            title={t("leadershipTitle")}
          />
          {leadership.length > 0 && (
            <div className="mt-14 grid grid-cols-2 gap-x-10 gap-y-10 md:grid-cols-4">
              {leadership.map((person, i) => (
                <Reveal key={person.id} delay={i * 80}>
                  <div className="border-t border-grey-300 pt-6">
                    <p className="text-h4 font-semibold text-ink">
                      {loc(person, "name", locale)}
                    </p>
                    <p className="mt-2 text-small text-grey-500">
                      {loc(person, "title", locale)}
                    </p>
                  </div>
                </Reveal>
              ))}
            </div>
          )}
          <Link
            href="/about/leadership"
            className="mt-10 inline-block text-small font-medium text-navy-800 transition-colors hover:text-rose-600"
          >
            {t("viewLeadership")} →
          </Link>
        </Container>
      </section>

      {/* Governance teaser + partnerships */}
      <section className="bg-grey-50 py-16 md:py-24">
        <Container>
          <SectionHeading
            label={t("structureLabel")}
            title={t("structureTitle")}
            standfirst={t("structureText")}
          />
          <Link
            href="/about/structure"
            className="mt-8 inline-block text-small font-medium text-navy-800 transition-colors hover:text-rose-600"
          >
            {t("viewStructure")} →
          </Link>

          <div className="mt-16 border-t border-grey-300 pt-10">
            <p className="text-caption font-medium uppercase tracking-[0.08em] text-rose-600">
              {t("partnershipsTitle")}
            </p>
            <p className="mt-4 max-w-[42rem] text-body leading-relaxed text-grey-600">
              {t("partnershipsText")}
            </p>
          </div>
        </Container>
      </section>
    </>
  );
}
