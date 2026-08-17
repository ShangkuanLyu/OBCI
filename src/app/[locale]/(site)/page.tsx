import { setRequestLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ButtonLink } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { getFeaturedNews } from "@/services/news";
import { getPastEvents, getUpcomingEvents } from "@/services/events";
import { getChapters, getPartners } from "@/services/organisation";
import { loc, formatDate } from "@/lib/utils/l10n";
import type { Locale } from "@/i18n/routing";

export const revalidate = 300;

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: rawLocale } = await params;
  setRequestLocale(rawLocale);
  const locale = rawLocale as Locale;
  const t = await getTranslations("home");
  const tCommon = await getTranslations("common");
  const tEvents = await getTranslations("events");

  const [news, upcoming, past, chapters, partners] = await Promise.all([
    getFeaturedNews(3).catch(() => []),
    getUpcomingEvents().catch(() => []),
    getPastEvents(3).catch(() => []),
    getChapters().catch(() => []),
    getPartners().catch(() => []),
  ]);
  const events = [...upcoming, ...past].slice(0, 3);

  return (
    <>
      {/* Hero — institutional navy, restrained composition */}
      <section className="bg-navy-900 text-white">
        <Container className="pb-24 pt-20 md:pb-32 md:pt-28">
          <p className="text-caption font-medium uppercase tracking-[0.08em] text-gold-400">
            {locale === "zh"
              ? "Oceania Business Association"
              : "大洋洲工商协会"}
          </p>
          <h1 className="mt-6 max-w-[17em] text-[2.25rem] leading-[1.12] font-semibold tracking-[-0.02em] md:text-[3.5rem] md:leading-[1.08]">
            {t("heroTitle")}
          </h1>
          <p className="mt-8 max-w-[36rem] text-body-lg text-navy-100/85">
            {t("heroText")}
          </p>
          <div className="mt-12 flex flex-wrap gap-4">
            <ButtonLink href="/membership/apply" variant="primary">
              {t("heroPrimary")}
            </ButtonLink>
            <ButtonLink href="/about" variant="secondaryDark">
              {t("heroSecondary")}
            </ButtonLink>
          </div>
        </Container>
      </section>

      {/* Featured news — editorial grid, no cards */}
      <section className="bg-white py-24 md:py-32">
        <Container>
          <div className="flex items-end justify-between">
            <SectionHeading
              label={t("newsLabel")}
              title={t("newsTitle")}
              standfirst={t("newsStandfirst")}
            />
            <Link
              href="/news"
              className="hidden shrink-0 text-small font-medium text-navy-800 transition-colors hover:text-gold-600 md:block"
            >
              {tCommon("viewAll")} →
            </Link>
          </div>

          <div className="mt-14 grid gap-x-10 gap-y-12 md:grid-cols-3">
            {news.map((article, i) => (
              <Reveal key={article.id} as="article" delay={i * 80}>
                <Link href={`/news/${article.slug}`} className="group block border-t border-grey-300 pt-6">
                  <p className="flex items-baseline gap-3 text-caption">
                    <span className="font-medium uppercase tracking-[0.08em] text-gold-600">
                      {article.category ? loc(article.category, "name", locale) : ""}
                    </span>
                    <span className="text-grey-500">
                      {formatDate(article.published_at, locale)}
                    </span>
                  </p>
                  <h3 className="mt-4 text-h4 font-semibold leading-snug text-ink transition-colors duration-200 group-hover:text-navy-800">
                    {loc(article, "title", locale)}
                  </h3>
                  <p className="mt-3 line-clamp-3 text-small leading-relaxed text-grey-600">
                    {loc(article, "summary", locale)}
                  </p>
                </Link>
              </Reveal>
            ))}
          </div>

          <Link
            href="/news"
            className="mt-10 inline-block text-small font-medium text-navy-800 md:hidden"
          >
            {tCommon("viewAll")} →
          </Link>
        </Container>
      </section>

      {/* About — split editorial band */}
      <section className="bg-grey-50 py-24 md:py-32">
        <Container>
          <div className="grid gap-10 md:grid-cols-12 md:gap-16">
            <div className="md:col-span-5">
              <SectionHeading label={t("aboutLabel")} title={t("aboutTitle")} />
            </div>
            <div className="md:col-span-7 md:pt-10">
              <p className="max-w-[42rem] text-body leading-relaxed text-grey-600">
                {t("aboutText")}
              </p>
              <Link
                href="/about"
                className="mt-8 inline-block text-small font-medium text-navy-800 transition-colors hover:text-gold-600"
              >
                {t("aboutCta")} →
              </Link>
            </div>
          </div>
        </Container>
      </section>

      {/* Chapters — numbered typographic grid */}
      <section className="bg-white py-24 md:py-32">
        <Container>
          <SectionHeading
            label={t("chaptersLabel")}
            title={t("chaptersTitle")}
            standfirst={t("chaptersStandfirst")}
          />
          <div className="mt-14 grid gap-x-10 gap-y-10 sm:grid-cols-2 md:grid-cols-3">
            {chapters.map((chapter, i) => (
              <Reveal key={chapter.id} delay={(i % 3) * 80}>
                <Link
                  href={`/chapters/${chapter.slug}`}
                  className="group block border-t border-grey-300 pt-6"
                >
                  <p className="text-caption font-medium tracking-[0.08em] text-gold-600">
                    {String(i + 1).padStart(2, "0")}
                  </p>
                  <h3 className="mt-3 text-h4 font-semibold text-ink transition-colors duration-200 group-hover:text-navy-800">
                    {loc(chapter, "name", locale)}
                  </h3>
                  {chapter.secretary_general && (
                    <p className="mt-2 text-small text-grey-500">
                      {locale === "zh" ? "秘书长" : "Secretary-General"} ·{" "}
                      {chapter.secretary_general}
                    </p>
                  )}
                </Link>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      {/* Events — date + typography + divider rows */}
      <section className="bg-grey-50 py-24 md:py-32">
        <Container>
          <div className="flex items-end justify-between">
            <SectionHeading label={t("eventsLabel")} title={t("eventsTitle")} />
            <Link
              href="/events"
              className="hidden shrink-0 text-small font-medium text-navy-800 transition-colors hover:text-gold-600 md:block"
            >
              {tCommon("viewAll")} →
            </Link>
          </div>
          <div className="mt-14">
            {events.length === 0 && (
              <p className="text-body text-grey-500">{tEvents("empty")}</p>
            )}
            {events.map((event) => (
              <Link
                key={event.id}
                href={`/events/${event.slug}`}
                className="group grid grid-cols-[5.5rem_1fr] items-baseline gap-6 border-t border-grey-300 py-7 last:border-b md:grid-cols-[7rem_1fr_auto]"
              >
                <p>
                  <span className="block text-h3 font-semibold leading-none text-navy-900">
                    {new Date(event.starts_at).getDate()}
                  </span>
                  <span className="mt-1 block text-caption text-grey-500">
                    {formatDate(event.starts_at, locale, {
                      year: "numeric",
                      month: "short",
                    })}
                  </span>
                </p>
                <div>
                  <h3 className="text-h4 font-semibold leading-snug text-ink transition-colors duration-200 group-hover:text-navy-800">
                    {loc(event, "title", locale)}
                  </h3>
                  {loc(event, "location", locale) && (
                    <p className="mt-2 text-small text-grey-500">
                      {loc(event, "location", locale)}
                    </p>
                  )}
                </div>
                <span className="hidden text-small font-medium text-navy-800 md:block">
                  →
                </span>
              </Link>
            ))}
          </div>
        </Container>
      </section>

      {/* Membership — navy call-to-action band */}
      <section className="bg-navy-900 py-24 text-white md:py-32">
        <Container className="text-center">
          <p className="text-caption font-medium uppercase tracking-[0.08em] text-gold-400">
            {t("membershipLabel")}
          </p>
          <h2 className="mx-auto mt-4 max-w-[20em] text-[1.75rem] font-semibold leading-[1.15] tracking-[-0.015em] md:text-h2">
            {t("membershipTitle")}
          </h2>
          <p className="mx-auto mt-6 max-w-[34rem] text-body-lg text-navy-100/85">
            {t("membershipText")}
          </p>
          <div className="mt-10 flex justify-center gap-4">
            <ButtonLink href="/membership/apply" variant="primary">
              {locale === "zh" ? "立即入会" : "Apply online"}
            </ButtonLink>
            <ButtonLink href="/membership" variant="secondaryDark">
              {t("membershipCta")}
            </ButtonLink>
          </div>
        </Container>
      </section>

      {/* Partners — quiet text band */}
      {partners.length > 0 && (
        <section className="bg-white py-20 md:py-24">
          <Container>
            <p className="text-center text-caption font-medium uppercase tracking-[0.08em] text-gold-600">
              {t("partnersTitle")}
            </p>
            <p className="mx-auto mt-8 max-w-[48rem] text-center text-body leading-loose text-grey-500">
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
