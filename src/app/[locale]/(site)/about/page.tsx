import { setRequestLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Container } from "@/components/ui/Container";
import { PageHero } from "@/components/ui/PageHero";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";
import { getLeadership } from "@/services/organisation";
import { getContentBlocks } from "@/services/content";
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
  const t = await getTranslations({ locale, namespace: "about" });
  return pageMetadata({
    locale,
    path: "/about",
    title: t("title"),
    description: t("standfirst"),
  });
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
  const zh = locale === "zh";

  const [leadership, content] = await Promise.all([
    getLeadership().catch(() => []),
    getContentBlocks().catch(() => null),
  ]);
  const leaders = leadership.slice(0, 4);
  const pick = (row: { text_zh: string; text_en: string }) =>
    zh ? row.text_zh || row.text_en : row.text_en || row.text_zh;

  return (
    <>
      <PageHero
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

      {/* Vision & mission — quote treatment + supporting mission text */}
      <section className="bg-grey-50 py-16 md:py-24">
        <Container>
          <SectionHeading label={t("visionLabel")} title={t("visionTitle")} />
          {content?.vision && (
            <blockquote className="mt-8 max-w-[46rem] border-l-2 border-gold-600 pl-6 text-[1.35rem] font-medium leading-[1.65] tracking-[-0.01em] text-ink md:text-[1.5rem]">
              {pick(content.vision)}
            </blockquote>
          )}
          <div className="mt-12 max-w-[46rem]">
            <h3 className="text-h4 font-semibold text-ink">
              {t("missionTitle")}
            </h3>
            <p className="mt-3 text-body leading-relaxed text-grey-600">
              {t("missionText")}
            </p>
          </div>
        </Container>
      </section>

      {/* Four practice pillars — full editorial version */}
      {content && content.pillars.length > 0 && (
        <section className="bg-white py-16 md:py-24">
          <Container>
            <SectionHeading
              label={t("pillarsLabel")}
              title={t("pillarsTitle")}
              standfirst={t("pillarsStandfirst")}
            />
            <ol className="mt-10 grid gap-x-14 md:grid-cols-2">
              {content.pillars.map((pillar, i) => (
                <li
                  key={pillar.title_zh || i}
                  className="grid grid-cols-[3.5rem_1fr] gap-5 border-t border-grey-100 py-7"
                >
                  <span className="text-h2 font-semibold tabular-nums text-grey-300">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <h3 className="text-h4 font-semibold text-ink">
                      {zh ? pillar.title_zh : pillar.title_en}
                    </h3>
                    <p className="mt-2 text-body leading-relaxed text-grey-600">
                      {pick(pillar)}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </Container>
        </section>
      )}

      {/* Leadership teaser */}
      <section className="bg-grey-50 py-16 md:py-24">
        <Container>
          <SectionHeading
            label={t("leadershipLabel")}
            title={t("leadershipTitle")}
          />
          {leaders.length > 0 && (
            <div className="mt-10 grid grid-cols-2 gap-6 md:grid-cols-4">
              {leaders.map((person, i) => (
                <Reveal
                  key={person.id}
                  delay={i * 80}
                  className="border-t-2 border-grey-100 pt-5"
                >
                  <p className="text-h4 font-semibold text-ink">
                    {loc(person, "name", locale)}
                  </p>
                  <p className="mt-2 text-small text-grey-500">
                    {loc(person, "title", locale)}
                  </p>
                </Reveal>
              ))}
            </div>
          )}
          <Link
            href="/about/leadership"
            className="mt-10 inline-block text-small font-medium text-sea-800 transition-colors hover:text-sea-600"
          >
            {t("viewLeadership")} →
          </Link>
        </Container>
      </section>

      {/* Governance teaser */}
      <section className="bg-white py-16 md:py-24">
        <Container>
          <SectionHeading
            label={t("structureLabel")}
            title={t("structureTitle")}
            standfirst={t("structureText")}
          />
          <Link
            href="/about/structure"
            className="mt-8 inline-block text-small font-medium text-sea-800 transition-colors hover:text-sea-600"
          >
            {t("viewStructure")} →
          </Link>
        </Container>
      </section>

      {/* Partnerships */}
      <section className="bg-sea-50 py-16 md:py-24">
        <Container>
          <SectionHeading
            title={t("partnershipsTitle")}
            standfirst={t("partnershipsText")}
          />
        </Container>
      </section>
    </>
  );
}
