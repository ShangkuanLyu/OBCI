import Image from "next/image";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { Container } from "@/components/ui/Container";
import { PageHero } from "@/components/ui/PageHero";
import { Reveal } from "@/components/ui/Reveal";
import { getLeadership } from "@/services/organisation";
import { loc, mediaUrl } from "@/lib/utils/l10n";
import type { Locale } from "@/i18n/routing";
import type { Metadata } from "next";

export const revalidate = 300;

const GROUP_ORDER = [
  "president",
  "honorary_chairman",
  "vice_chair",
  "advisor",
  "secretariat",
] as const;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "leadership" });
  return { title: t("title"), description: t("standfirst") };
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

  const people = await getLeadership().catch(() => []);
  const groups = GROUP_ORDER.map((key) => ({
    key,
    people: people.filter((person) => person.group_key === key),
  })).filter((group) => group.people.length > 0);

  return (
    <>
      <PageHero title={t("title")} standfirst={t("standfirst")} />

      <section className="bg-white py-16 md:py-24">
        <Container>
          <div className="space-y-16 md:space-y-20">
            {groups.map((group) => (
              <div key={group.key}>
                <p className="flex items-center gap-3 text-caption font-semibold uppercase tracking-[0.08em] text-royal-600">
                  <span
                    className="h-0.5 w-6 rounded-full bg-rose-500"
                    aria-hidden
                  />
                  {t(`groups.${group.key}`)}
                </p>
                <div className="mt-8 grid gap-6 sm:grid-cols-2 md:grid-cols-3">
                  {group.people.map((person, i) => {
                    const portrait = mediaUrl(person.portrait_path);
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
                            alt={name}
                            width={480}
                            height={600}
                            className="aspect-[4/5] w-full bg-royal-50 object-cover"
                          />
                        )}
                        <div className="p-6">
                          <h2 className="text-h4 font-semibold text-ink">
                            {name}
                          </h2>
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
          </div>
        </Container>
      </section>
    </>
  );
}
