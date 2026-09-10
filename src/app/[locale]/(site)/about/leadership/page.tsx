import Image from "next/image";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { Container } from "@/components/ui/Container";
import { PageHero } from "@/components/ui/PageHero";
import { Reveal } from "@/components/ui/Reveal";
import { CouncilRoster } from "@/components/about/CouncilRoster";
import { getLeadership } from "@/services/organisation";
import { getContentBlocks } from "@/services/content";
import { imageUrl, loc } from "@/lib/utils/l10n";
import { pageMetadata } from "@/lib/seo";
import type { Locale } from "@/i18n/routing";
import type { Metadata } from "next";

export const revalidate = 300;

/** Public order: the three 2026 groups, then the legacy keys (still valid
 *  in the CMS) so a row left in an old group is never silently dropped. */
const GROUP_ORDER = [
  "executive",
  "honorary",
  "secretariat",
  "president",
  "honorary_chairman",
  "vice_chair",
  "advisor",
] as const;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "leadership" });
  return pageMetadata({
    locale,
    path: "/about/leadership",
    title: t("title"),
    description: t("standfirst"),
  });
}

export default async function LeadershipPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: rawLocale } = await params;
  setRequestLocale(rawLocale);
  const locale = rawLocale as Locale;
  const t = await getTranslations("leadership");

  const [people, content] = await Promise.all([
    getLeadership().catch(() => []),
    getContentBlocks().catch(() => null),
  ]);
  const groups = GROUP_ORDER.map((key) => ({
    key,
    people: people.filter((person) => person.group_key === key),
  })).filter((group) => group.people.length > 0);
  const council = content?.council ?? null;

  return (
    <>
      <PageHero title={t("title")} standfirst={t("standfirst")} />

      <section className="bg-white py-16 md:py-24">
        <Container>
          <div className="space-y-16 md:space-y-20">
            {groups.map((group) => (
              <div key={group.key}>
                <h2 className="flex items-center gap-3 text-caption font-semibold uppercase tracking-[0.08em] text-sea-800">
                  <span
                    className="h-0.5 w-6 rounded-full bg-sea-800"
                    aria-hidden
                  />
                  {t(`groups.${group.key}`)}
                </h2>
                <div className="mt-8 grid gap-6 sm:grid-cols-2 md:grid-cols-3">
                  {group.people.map((person, i) => {
                    const portrait = imageUrl(person.portrait_path);
                    const name = loc(person, "name", locale);
                    const bio = loc(person, "bio", locale);
                    return (
                      <Reveal
                        key={person.id}
                        delay={(i % 3) * 80}
                        className="card-surface overflow-hidden"
                      >
                        {portrait && (
                          <Image
                            src={portrait}
                            alt=""
                            width={480}
                            height={600}
                            className="aspect-[4/5] w-full bg-sea-50 object-cover"
                          />
                        )}
                        <div className="p-6">
                          <h3 className="text-h4 font-semibold text-ink">
                            {name}
                          </h3>
                          <p className="mt-2 text-small text-grey-500">
                            {loc(person, "title", locale)}
                          </p>
                          {bio && (
                            <p className="mt-4 text-small leading-relaxed text-grey-600">
                              {bio}
                            </p>
                          )}
                        </div>
                      </Reveal>
                    );
                  })}
                </div>
              </div>
            ))}

            {/* Council roster — compact name grid, no portraits */}
            {council && (
              <div id="council" className="scroll-mt-24">
                <h2 className="flex items-center gap-3 text-caption font-semibold uppercase tracking-[0.08em] text-sea-800">
                  <span
                    className="h-0.5 w-6 rounded-full bg-sea-800"
                    aria-hidden
                  />
                  {t("councilTitle")}
                </h2>
                <div className="mt-8">
                  <CouncilRoster members={council.members} locale={locale} />
                </div>
                <p className="mt-6 text-caption text-grey-500">
                  {t("councilNote")}
                </p>
              </div>
            )}
          </div>
        </Container>
      </section>
    </>
  );
}
