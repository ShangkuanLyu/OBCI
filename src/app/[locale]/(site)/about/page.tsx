import { setRequestLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Container } from "@/components/ui/Container";
import { PageHero } from "@/components/ui/PageHero";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";
import { ReviewNote } from "@/components/ui/ReviewNote";
import { OrgChart } from "@/components/about/OrgChart";
import { Gallery, resolveGalleryItems } from "@/components/about/Gallery";
import { getChapters, getLeadership } from "@/services/organisation";
import { getContentBlocks } from "@/services/content";
import { isPreviewDeployment } from "@/lib/preview";
import { loc } from "@/lib/utils/l10n";
import { countWord } from "@/lib/utils/count-word";
import { pageMetadata } from "@/lib/seo";
import type { Locale } from "@/i18n/routing";
import type { Metadata } from "next";

export const revalidate = 300;

/** Office-holders shown in the leadership teaser (advisers are on the
 *  leadership page and the homepage honours band). */
const OFFICE_GROUPS = new Set(["president", "honorary_chairman", "vice_chair"]);

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

function paragraphs(text: string): string[] {
  return text
    .split(/\n+/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
}

/** Preview-only placeholder band for a CMS module without chamber copy. */
function PendingModule({ children }: { children: React.ReactNode }) {
  return (
    <section className="bg-white py-6">
      <Container>
        <ReviewNote>{children}</ReviewNote>
      </Container>
    </section>
  );
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
  const preview = isPreviewDeployment();

  const [leadership, content, chapters] = await Promise.all([
    getLeadership().catch(() => []),
    getContentBlocks().catch(() => null),
    getChapters().catch(() => []),
  ]);
  const gallery = await resolveGalleryItems(content?.gallery ?? [], locale);

  const leaders = leadership
    .filter((person) => OFFICE_GROUPS.has(person.group_key))
    .slice(0, 4);
  const pick = (row: { text_zh: string; text_en: string }) =>
    zh ? row.text_zh || row.text_en : row.text_en || row.text_zh;
  const units = content?.orgStructure ?? [];
  const coreValues = content?.coreValues ?? [];
  const pillars = content?.pillars ?? [];

  return (
    <>
      <PageHero title={t("title")} standfirst={t("standfirst")} />

      {/* 1 · Introduction — editorial 5/7 split */}
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

      {/* 2 · Vision — quote treatment */}
      {content?.vision && (
        <section className="bg-grey-50 py-16 md:py-24">
          <Container>
            <SectionHeading
              label={content.mission ? t("visionLabel") : t("visionOnlyLabel")}
              title={t("visionTitle")}
            />
            <blockquote className="mt-8 max-w-[46rem] border-l-2 border-gold-600 pl-6 text-[1.35rem] font-medium leading-[1.65] tracking-[-0.01em] text-ink md:text-[1.5rem]">
              {pick(content.vision)}
            </blockquote>
          </Container>
        </section>
      )}

      {/* 3 · Mission — chamber copy only, never a fallback */}
      {content?.mission ? (
        <section className="bg-white py-16 md:py-24">
          <Container>
            <SectionHeading title={t("missionTitle")} />
            <div className="mt-8 max-w-[46rem] space-y-5">
              {paragraphs(pick(content.mission)).map((paragraph, i) => (
                <p key={i} className="text-body leading-relaxed text-grey-600">
                  {paragraph}
                </p>
              ))}
            </div>
          </Container>
        </section>
      ) : (
        preview && (
          <PendingModule>
            {t("reviewCmsPending", { module: t("missionTitle") })}
          </PendingModule>
        )
      )}

      {/* 4 · Core values */}
      {coreValues.length > 0 ? (
        <section className="bg-grey-50 py-16 md:py-24">
          <Container>
            <SectionHeading label={t("valuesLabel")} title={t("valuesTitle")} />
            <ul className="mt-10 grid gap-6 sm:grid-cols-2 md:grid-cols-4">
              {coreValues.map((value, i) => (
                <Reveal
                  key={value.title_zh || value.title_en || i}
                  as="li"
                  delay={(i % 4) * 80}
                  className="card-surface p-6"
                >
                  <h3 className="text-h4 font-semibold text-ink">
                    {loc(value, "title", locale)}
                  </h3>
                  {pick(value) && (
                    <p className="mt-3 text-small leading-relaxed text-grey-600">
                      {pick(value)}
                    </p>
                  )}
                </Reveal>
              ))}
            </ul>
          </Container>
        </section>
      ) : (
        preview && (
          <PendingModule>
            {t("reviewCmsPending", { module: t("valuesTitle") })}
          </PendingModule>
        )
      )}

      {/* 5 · Four practice pillars — full editorial version */}
      {pillars.length > 0 && (
        <section className="bg-white py-16 md:py-24">
          <Container>
            <SectionHeading
              label={t("pillarsLabel")}
              title={t("pillarsTitle")}
              standfirst={t("pillarsStandfirst")}
            />
            <ol className="mt-10 grid gap-x-14 md:grid-cols-2">
              {pillars.map((pillar, i) => (
                <li
                  key={pillar.title_zh || i}
                  className="grid grid-cols-[3.5rem_1fr] gap-5 border-t border-grey-100 py-7"
                >
                  <span className="text-h2 font-semibold tabular-nums text-grey-300">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <h3 className="text-h4 font-semibold text-ink">
                      {loc(pillar, "title", locale)}
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

      {/* 6 · Leadership and honorary advisers — office-holder teaser */}
      {leaders.length > 0 && (
        <section className="bg-grey-50 py-16 md:py-24">
          <Container>
            <SectionHeading
              label={t("leadershipLabel")}
              title={t("leadershipTitle")}
            />
            <ul className="mt-10 grid grid-cols-2 gap-6 md:grid-cols-4">
              {leaders.map((person, i) => (
                <Reveal
                  key={person.id}
                  as="li"
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
            </ul>
            <Link
              href="/about/leadership"
              className="mt-10 inline-block text-small font-medium text-sea-800 transition-colors hover:text-sea-600"
            >
              {t("viewLeadership")} →
            </Link>
          </Container>
        </section>
      )}

      {/* 7 · Organisational structure chart */}
      {units.length > 0 && (
        <section className="bg-white py-16 md:py-24">
          <Container>
            <SectionHeading
              label={t("structureLabel")}
              title={t("structureTitle")}
              standfirst={t("structureText")}
            />
            <div className="mt-10">
              <OrgChart
                label={t("orgChartTitle")}
                root={t("orgChartRoot")}
                units={units}
                chapters={chapters}
                locale={locale}
              />
            </div>
            <Link
              href="/about/structure"
              className="mt-10 inline-block text-small font-medium text-sea-800 transition-colors hover:text-sea-600"
            >
              {t("viewStructure")} →
            </Link>
          </Container>
        </section>
      )}

      {/* 8 · China Enterprise Going-Global Strategy Committee */}
      {content?.strategyCommittee ? (
        <section className="bg-sea-50 py-16 md:py-24">
          <Container>
            <SectionHeading
              label={t("strategyCommitteeLabel")}
              title={t("strategyCommitteeTitle")}
            />
            <div className="mt-8 max-w-[46rem] space-y-5">
              {paragraphs(pick(content.strategyCommittee)).map(
                (paragraph, i) => (
                  <p key={i} className="text-body leading-relaxed text-grey-600">
                    {paragraph}
                  </p>
                ),
              )}
            </div>
          </Container>
        </section>
      ) : (
        preview && (
          <PendingModule>
            {t("reviewCmsPending", { module: t("strategyCommitteeTitle") })}
          </PendingModule>
        )
      )}

      {/* 9 · Industry chapters — compact strip (count from published rows) */}
      {chapters.length > 0 && (
        <section className="bg-grey-50 py-16 md:py-24">
          <Container>
            <SectionHeading
              label={t("chaptersLabel")}
              title={t("chaptersTitle", {
                count: countWord(chapters.length, locale),
              })}
            />
            <ul className="mt-8 flex flex-wrap gap-3">
              {chapters.map((chapter) => (
                <li key={chapter.id}>
                  <Link
                    href={`/chapters/${chapter.slug}`}
                    className="card-surface inline-flex items-center px-5 py-3 text-small font-medium text-ink transition-colors duration-200 hover:text-sea-800"
                  >
                    {loc(chapter, "name", locale)}
                  </Link>
                </li>
              ))}
            </ul>
            <Link
              href="/chapters"
              className="mt-10 inline-block text-small font-medium text-sea-800 transition-colors hover:text-sea-600"
            >
              {t("viewChapters")} →
            </Link>
          </Container>
        </section>
      )}

      {/* 10 · Professional secretariat */}
      {content?.secretariat ? (
        <section className="bg-white py-16 md:py-24">
          <Container>
            <SectionHeading
              label={t("secretariatLabel")}
              title={t("secretariatTitle")}
            />
            <div className="mt-8 max-w-[46rem] space-y-5">
              {paragraphs(pick(content.secretariat)).map((paragraph, i) => (
                <p key={i} className="text-body leading-relaxed text-grey-600">
                  {paragraph}
                </p>
              ))}
            </div>
          </Container>
        </section>
      ) : (
        preview && (
          <PendingModule>
            {t("reviewCmsPending", { module: t("secretariatTitle") })}
          </PendingModule>
        )
      )}

      {/* 11 · Credentials and government-business activity gallery */}
      {gallery.length > 0 && (
        <section className="bg-grey-50 py-16 md:py-24">
          <Container>
            <SectionHeading
              label={t("galleryLabel")}
              title={t("galleryTitle")}
              standfirst={t("galleryStandfirst")}
            />
            <div className="mt-10">
              <Gallery items={gallery} />
            </div>
          </Container>
        </section>
      )}
    </>
  );
}
