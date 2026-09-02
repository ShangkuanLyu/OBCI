import Image from "next/image";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ButtonLink } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { HeroCarousel } from "@/components/home/HeroCarousel";
import { getPublishedNews } from "@/services/news";
import { getPastEvents, getUpcomingEvents } from "@/services/events";
import { getChapters, getLeadership, getPartners } from "@/services/organisation";
import { getContentBlocks } from "@/services/content";
import { getServiceOfferings } from "@/services/abs";
import { getSiteSettings } from "@/services/settings";
import { isModuleConfirmed } from "@/lib/review";
import { isLegacyNewsCategory, newsCategoryName } from "@/lib/news/categories";
import { designFixturesEnabled } from "@/lib/fixtures/design-review";
import { loc, formatDate, imageUrl, melbourneDay, mediaUrl } from "@/lib/utils/l10n";
import { countWord } from "@/lib/utils/count-word";
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
  const zh = locale === "zh";
  const meta = pageMetadata({
    locale,
    path: "/",
    title: zh
      ? "大洋洲工商协会 OBAI"
      : "Oceania Business Association (OBAI)",
    description: zh
      ? "搭建中澳及大洋洲多边商业互通枢纽，赋能中国企业轻资产出海、澳洲企业拓展亚太市场。"
      : "A multilateral business hub linking China, Australia and Oceania — empowering cross-border growth with end-to-end compliant delivery.",
  });
  return {
    ...meta,
    title: {
      absolute: zh
        ? "大洋洲工商协会 OBAI | Oceania Business Association"
        : "Oceania Business Association (OBAI) | 大洋洲工商协会",
    },
  };
}

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
  const tMembership = await getTranslations("membership");
  const tLeadership = await getTranslations("leadership");
  const tNews = await getTranslations("news");

  const [content, abs, news, upcoming, past, chapters, leadership, settings] =
    await Promise.all([
      getContentBlocks().catch(() => null),
      getServiceOfferings().catch(() => []),
      getPublishedNews({ limit: 3 }).catch(() => []),
      getUpcomingEvents().catch(() => []),
      getPastEvents(3).catch(() => []),
      getChapters().catch(() => []),
      getLeadership().catch(() => []),
      getSiteSettings().catch(() => ({})),
    ]);
  // The partner wall is published only once the chamber confirms the list.
  const partners = isModuleConfirmed(settings, "partners")
    ? await getPartners().catch(() => [])
    : [];
  const events = [...upcoming, ...past].slice(0, 3);
  const zh = locale === "zh";
  const pick = (row: { text_zh: string; text_en: string }) =>
    zh ? row.text_zh || row.text_en : row.text_en || row.text_zh;

  const honoraryAdvisers = leadership.filter(
    (person) => person.group_key === "honorary_chairman",
  );

  return (
    <>
      {/* 1 · Banner carousel (CMS-driven; only complete banners ship). */}
      {content && content.banners.length > 0 ? (
        <HeroCarousel banners={content.banners} />
      ) : (
        <section className="bg-sea-900 text-white">
          <Container className="pb-20 pt-16 md:pb-24 md:pt-24">
            <p className="flex items-center gap-3 text-caption font-semibold uppercase tracking-[0.06em] text-sea-200">
              <span className="h-0.5 w-6 rounded-full bg-gold-500" aria-hidden />
              <span lang={locale === "zh" ? "en" : "zh"}>{tCommon("orgNameEn")}</span>
            </p>
            <h1 className="mt-5 max-w-[16em] text-[2rem] font-semibold leading-[1.2] tracking-[-0.02em] md:text-[2.9rem] md:leading-[1.16]">
              {t("heroTitle")}
            </h1>
            <p className="mt-6 max-w-[36rem] text-body-lg leading-relaxed text-white/80">
              {t("heroText")}
            </p>
            <div className="mt-9 flex flex-wrap gap-4">
              <Link
                href="/membership/apply"
                className="inline-flex h-11 items-center justify-center rounded-full bg-white px-7 text-small font-medium text-sea-800 transition-colors duration-200 hover:bg-sea-100"
              >
                {t("heroPrimary")}
              </Link>
              <Link
                href="/about"
                className="inline-flex h-11 items-center justify-center rounded-full border border-white/40 px-7 text-small font-medium text-white transition-colors duration-200 hover:bg-white/10"
              >
                {t("heroSecondary")}
              </Link>
            </div>
          </Container>
        </section>
      )}

      {/* 2 · Vision + four practice pillars — editorial split, no card grid. */}
      {content?.vision && (
        <section className="bg-white py-18 md:py-24">
          <Container>
            <div className="grid gap-12 md:grid-cols-12 md:gap-14">
              <div className="md:col-span-5">
                <p className="flex items-center gap-3 text-caption font-semibold uppercase tracking-[0.06em] text-sea-800">
                  <span className="h-0.5 w-6 rounded-full bg-gold-600" aria-hidden />
                  {t("visionLabel")}
                </p>
                <p className="mt-6 text-[1.45rem] font-medium leading-[1.6] tracking-[-0.01em] text-ink md:text-[1.6rem]">
                  {pick(content.vision)}
                </p>
              </div>
              {content.pillars.length > 0 && (
                <div className="md:col-span-6 md:col-start-7">
                  <h2 className="text-h4 font-semibold text-ink">
                    {t("pillarsTitle")}
                  </h2>
                  <ol className="mt-6">
                    {content.pillars.map((pillar, i) => (
                      <li
                        key={pillar.title_zh || i}
                        className="grid grid-cols-[3rem_1fr] gap-4 border-t border-grey-100 py-5 first:border-t-0"
                      >
                        <span className="text-h3 font-semibold tabular-nums text-grey-300">
                          {String(i + 1).padStart(2, "0")}
                        </span>
                        <div>
                          <h3 className="text-body font-semibold text-ink">
                            {zh ? pillar.title_zh : pillar.title_en}
                          </h3>
                          <p className="mt-1.5 text-small leading-relaxed text-grey-600">
                            {pick(pillar)}
                          </p>
                        </div>
                      </li>
                    ))}
                  </ol>
                </div>
              )}
            </div>
          </Container>
        </section>
      )}

      {/* 3 · Industry chapters — modular cards (per the DOCX brief); the
             heading count comes from the published rows. */}
      {chapters.length > 0 && (
        <section className="bg-grey-50 py-18 md:py-24">
          <Container>
            <div className="flex items-end justify-between">
              <SectionHeading
                label={t("industriesLabel")}
                title={t("industriesTitle", {
                  count: countWord(chapters.length, locale),
                })}
                standfirst={t("industriesStandfirst")}
              />
              <Link
                href="/chapters"
                className="hidden shrink-0 text-small font-medium text-sea-800 transition-colors hover:text-sea-600 md:block"
              >
                {tCommon("viewAll")} →
              </Link>
            </div>
            <div className="mt-10 grid gap-6 sm:grid-cols-2 md:grid-cols-3">
              {chapters.map((chapter, i) => (
                <Reveal key={chapter.id} delay={(i % 3) * 80}>
                  <Link
                    href={`/chapters/${chapter.slug}`}
                    className="card-surface group flex h-full flex-col p-7 transition-shadow duration-300 hover:shadow-card-hover"
                  >
                    <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-sea-50 text-small font-semibold text-sea-800">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <h3 className="mt-5 text-h4 font-semibold text-ink transition-colors duration-200 group-hover:text-sea-800">
                      {loc(chapter, "name", locale)}
                    </h3>
                    {loc(chapter, "tagline", locale) && (
                      <p className="mt-2 text-small leading-relaxed text-grey-600">
                        {loc(chapter, "tagline", locale)}
                      </p>
                    )}
                    <span className="mt-auto pt-5 text-small font-medium text-sea-800">
                      {tCommon("learnMore")} →
                    </span>
                  </Link>
                </Reveal>
              ))}
            </div>
          </Container>
        </section>
      )}

      {/* 4 · ABS one-stop services — content band with numbered rows. */}
      {abs.length > 0 && (
        <section className="bg-white py-18 md:py-24">
          <Container>
            <div className="grid gap-12 md:grid-cols-12 md:gap-14">
              <div className="md:col-span-5">
                <SectionHeading
                  label={t("absLabel")}
                  title={t("absTitle")}
                  standfirst={t("absText")}
                />
                <div className="mt-8">
                  <ButtonLink href="/membership" variant="primary">
                    {t("absCta")}
                  </ButtonLink>
                </div>
              </div>
              <div className="md:col-span-7 md:col-start-6">
                <ul>
                  {abs.map((service, i) => (
                    <li
                      key={service.id}
                      className="grid grid-cols-[3rem_1fr] gap-4 border-t border-grey-100 py-6 first:border-t-0 first:pt-0"
                    >
                      <span className="text-h3 font-semibold tabular-nums text-grey-300">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <div>
                        <h3 className="text-body font-semibold text-ink">
                          {loc(service, "name", locale)}
                        </h3>
                        <p className="mt-1.5 text-small leading-relaxed text-grey-600">
                          {loc(service, "summary", locale)}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </Container>
        </section>
      )}

      {/* 5 · Latest three articles. */}
      {news.length > 0 && (
        <section className="bg-sea-50 py-18 md:py-24">
          <Container>
            <div className="flex items-end justify-between">
              <SectionHeading
                label={t("newsLabel")}
                title={t("newsTitle")}
                standfirst={t("newsStandfirst")}
              />
              <Link
                href="/news"
                className="hidden shrink-0 text-small font-medium text-sea-800 transition-colors hover:text-sea-600 md:block"
              >
                {tCommon("viewAll")} →
              </Link>
            </div>
            <div className="mt-10 grid gap-6 md:grid-cols-3">
              {news.map((article, i) => {
                const cover = mediaUrl(article.cover_image_path);
                return (
                  <Reveal key={article.id} as="article" delay={i * 80}>
                    <Link
                      href={`/news/${article.slug}`}
                      className="card-surface group block h-full overflow-hidden transition-shadow duration-300 hover:shadow-card-hover"
                    >
                      {cover && (
                        <div className="relative aspect-[3/2] overflow-hidden bg-sea-50">
                          <Image
                            src={cover}
                            alt=""
                            fill
                            sizes="(min-width: 768px) 350px, 100vw"
                            className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                          />
                        </div>
                      )}
                      <div className="p-6">
                        <p className="flex items-center gap-3 text-caption">
                          {article.category && (
                            <span
                              className={
                                isLegacyNewsCategory(article.category, designFixturesEnabled())
                                  ? "rounded-full border border-dashed border-grey-300 px-2.5 py-1 font-medium text-grey-600"
                                  : "rounded-full bg-sea-50 px-2.5 py-1 font-medium text-sea-800"
                              }
                            >
                              {newsCategoryName(article.category, locale, designFixturesEnabled())}
                              {isLegacyNewsCategory(article.category, designFixturesEnabled()) && (
                                <span className="ml-1.5 font-normal text-grey-500">
                                  · {tNews("legacyCategory")}
                                </span>
                              )}
                            </span>
                          )}
                          <span className="text-grey-500">
                            {formatDate(article.published_at, locale)}
                          </span>
                        </p>
                        <h3 className="mt-4 text-h4 font-semibold leading-snug text-ink transition-colors duration-200 group-hover:text-sea-800">
                          {loc(article, "title", locale)}
                        </h3>
                        <p className="mt-3 line-clamp-2 text-small leading-relaxed text-grey-600">
                          {loc(article, "summary", locale)}
                        </p>
                      </div>
                    </Link>
                  </Reveal>
                );
              })}
            </div>
            <Link
              href="/news"
              className="mt-8 inline-block text-small font-medium text-sea-800 md:hidden"
            >
              {tCommon("viewAll")} →
            </Link>
          </Container>
        </section>
      )}

      {/* 6 · Upcoming / recent events — date rows. */}
      <section className="bg-white py-18 md:py-24">
        <Container>
          <div className="flex items-end justify-between">
            <SectionHeading label={t("eventsLabel")} title={t("eventsTitle")} />
            <Link
              href="/events"
              className="hidden shrink-0 text-small font-medium text-sea-800 transition-colors hover:text-sea-600 md:block"
            >
              {tCommon("viewAll")} →
            </Link>
          </div>
          <div className="mt-10 space-y-4">
            {events.length === 0 && (
              <p className="text-body text-grey-500">{tEvents("empty")}</p>
            )}
            {events.map((event) => {
              const cover = mediaUrl(event.cover_image_path);
              return (
                <Link
                  key={event.id}
                  href={`/events/${event.slug}`}
                  className="card-surface group grid grid-cols-[4.5rem_1fr] items-center gap-5 p-5 transition-shadow duration-300 hover:shadow-card-hover md:grid-cols-[4.5rem_1fr_9rem] md:gap-6"
                >
                  <p className="flex h-[4.5rem] flex-col items-center justify-center rounded-xl bg-sea-800 text-white">
                    <span className="text-h3 font-semibold leading-none tabular-nums">
                      {melbourneDay(event.starts_at)}
                    </span>
                    <span className="mt-1 text-[0.6875rem] tracking-[0.04em] text-white/75">
                      {formatDate(event.starts_at, locale, {
                        year: "numeric",
                        month: "short",
                      })}
                    </span>
                  </p>
                  <div>
                    <h3 className="text-h4 font-semibold leading-snug text-ink transition-colors duration-200 group-hover:text-sea-800">
                      {loc(event, "title", locale)}
                    </h3>
                    {loc(event, "location", locale) && (
                      <p className="mt-1.5 text-small text-grey-500">
                        {loc(event, "location", locale)}
                      </p>
                    )}
                  </div>
                  {cover && (
                    <div className="relative hidden aspect-[16/10] overflow-hidden rounded-lg md:block">
                      <Image
                        src={cover}
                        alt=""
                        fill
                        sizes="144px"
                        className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                      />
                    </div>
                  )}
                </Link>
              );
            })}
          </div>
        </Container>
      </section>

      {/* 7 · Membership at a glance + Join CTA (benefits summary only —
             the fee table lives on the Join page). */}
      <section className="bg-grey-50 py-18 md:py-24">
        <Container>
          <SectionHeading
            label={t("membershipLabel")}
            title={t("membershipTitle")}
            standfirst={t("membershipText")}
          />
          {content && content.memberBenefits.length > 0 && (
            <ul className="mt-10 grid gap-x-12 gap-y-4 md:grid-cols-2">
              {content.memberBenefits.map((benefit, i) => (
                <li
                  key={i}
                  className="flex items-start gap-3 border-b border-grey-100 pb-4 text-body text-ink"
                >
                  <span
                    className="mt-[0.7em] h-0.5 w-4 shrink-0 rounded-full bg-gold-600"
                    aria-hidden
                  />
                  {pick(benefit)}
                </li>
              ))}
            </ul>
          )}
          <div className="mt-12 rounded-2xl bg-sea-800 px-8 py-10 text-center text-white md:px-14">
            <h2 className="mx-auto max-w-[24em] text-h3 font-semibold tracking-[-0.01em]">
              {t("ctaTitle")}
            </h2>
            <div className="mt-7 flex flex-wrap items-center justify-center gap-5">
              <Link
                href="/membership/apply"
                className="inline-flex h-11 items-center justify-center rounded-full bg-white px-7 text-small font-medium text-sea-800 transition-colors duration-200 hover:bg-sea-100"
              >
                {tMembership("applyCta")}
              </Link>
              <p className="text-caption text-white/70">
                {tMembership("applyNote")}
              </p>
            </div>
          </div>
        </Container>
      </section>

      {/* 8 · Honorary advisers + partner institutions (partners only once
             confirmed; the title narrows to advisers when they are absent). */}
      {(honoraryAdvisers.length > 0 || partners.length > 0) && (
        <section className="bg-white py-18 md:py-24">
          <Container>
            <SectionHeading
              label={
                partners.length > 0
                  ? t("advisorsLabel")
                  : t("advisorsOnlyLabel")
              }
              title={
                partners.length > 0
                  ? t("advisorsTitle")
                  : t("advisorsOnlyTitle")
              }
            />
            {honoraryAdvisers.length > 0 && (
              <div className="mt-10 flex flex-wrap gap-x-12 gap-y-8">
                {honoraryAdvisers.map((person) => {
                  const portrait = imageUrl(person.portrait_path);
                  return (
                    <div key={person.id} className="flex items-center gap-4">
                      {portrait && (
                        <span className="relative block h-16 w-16 overflow-hidden rounded-full border border-grey-100">
                          <Image
                            src={portrait}
                            alt=""
                            fill
                            sizes="64px"
                            className="object-cover"
                          />
                        </span>
                      )}
                      <div>
                        <p className="text-body font-semibold text-ink">
                          {loc(person, "name", locale)}
                        </p>
                        <p className="text-small text-grey-500">
                          {loc(person, "title", locale)}
                        </p>
                      </div>
                    </div>
                  );
                })}
                <Link
                  href="/about/leadership"
                  className="flex items-center text-small font-medium text-sea-800 transition-colors hover:text-sea-600"
                >
                  {tLeadership("title")} →
                </Link>
              </div>
            )}
            {partners.length > 0 && (
              <div className="mt-14 border-t border-grey-100 pt-10">
                <p className="text-caption font-semibold uppercase tracking-[0.06em] text-grey-500">
                  {t("partnersTitle")}
                </p>
                <p className="mt-5 max-w-[54rem] text-body leading-loose text-grey-600">
                  {partners.map((partner, i) => (
                    <span key={partner.id}>
                      {loc(partner, "name", locale)}
                      {i < partners.length - 1 && (
                        <span className="mx-3.5 text-grey-300">·</span>
                      )}
                    </span>
                  ))}
                </p>
              </div>
            )}
          </Container>
        </section>
      )}
    </>
  );
}
