import Image from "next/image";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ButtonLink } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { getFeaturedNews } from "@/services/news";
import { getPastEvents, getUpcomingEvents } from "@/services/events";
import { getChapters, getPartners } from "@/services/organisation";
import { loc, formatDate, mediaUrl } from "@/lib/utils/l10n";
import { assetPath } from "@/lib/utils/asset";
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
  const tMembership = await getTranslations("membership");

  const [news, upcoming, past, chapters, partners] = await Promise.all([
    getFeaturedNews(3).catch(() => []),
    getUpcomingEvents().catch(() => []),
    getPastEvents(3).catch(() => []),
    getChapters().catch(() => []),
    getPartners().catch(() => []),
  ]);
  const events = [...upcoming, ...past].slice(0, 3);
  const zh = locale === "zh";

  const stats = [
    { value: "Melbourne", label: zh ? "总部立足墨尔本" : "Headquartered in Melbourne" },
    { value: String(chapters.length || 6), label: zh ? "专业委员会" : "Professional committees" },
    { value: String(partners.length || 7), label: zh ? "中国省市合作" : "Provincial partnerships" },
    { value: zh ? "5 天" : "5 days", label: zh ? "入会审核时限" : "Application review time" },
  ];

  const membershipCards = [
    {
      bar: "bg-royal-600",
      title: zh ? "个人会员" : "Individual",
      text: zh
        ? "面向参与中澳经贸活动的专业人士。"
        : "For professionals engaging in Oceania–China trade.",
    },
    {
      bar: "bg-rose-500",
      title: zh ? "企业会员" : "Corporate",
      text: zh
        ? "面向拓展国际市场的企业与机构。"
        : "For enterprises expanding into international markets.",
    },
    {
      bar: "bg-royal-500",
      title: zh ? "协会与机构会员" : "Associations & Institutions",
      text: zh
        ? "面向深耕多边合作的行业组织。"
        : "For industry bodies focused on multilateral cooperation.",
    },
  ];

  return (
    <>
      {/* Hero — light band, editorial split with photography */}
      <section className="border-b border-grey-100 bg-royal-50">
        <Container className="pb-16 pt-14 md:pb-20 md:pt-20">
          <div className="grid items-center gap-10 md:grid-cols-12 md:gap-12">
            <div className="md:col-span-6">
              <p className="flex items-center gap-3 text-caption font-semibold uppercase tracking-[0.08em] text-royal-600">
                <span className="h-0.5 w-6 rounded-full bg-rose-500" aria-hidden />
                {zh ? "Oceania Business Association" : "大洋洲工商协会"}
              </p>
              <h1 className="mt-5 text-[2.25rem] leading-[1.12] font-semibold tracking-[-0.02em] text-ink md:text-[3.25rem] md:leading-[1.08]">
                {t("heroTitle")}
              </h1>
              <p className="mt-6 max-w-[32rem] text-body-lg text-grey-600">
                {t("heroText")}
              </p>
              <div className="mt-9 flex flex-wrap gap-4">
                <ButtonLink href="/membership/apply" variant="accent">
                  {t("heroPrimary")}
                </ButtonLink>
                <ButtonLink href="/about" variant="secondary">
                  {t("heroSecondary")}
                </ButtonLink>
              </div>
            </div>
            <div className="relative md:col-span-6">
              <div
                className="absolute -bottom-4 -right-4 hidden h-full w-full rounded-2xl bg-royal-100 md:block"
                aria-hidden
              />
              <div className="relative aspect-[4/3] overflow-hidden rounded-2xl">
                <Image
                  src={assetPath("/images/hero.jpg")}
                  alt=""
                  fill
                  priority
                  sizes="(min-width: 768px) 540px, 100vw"
                  className="object-cover"
                />
              </div>
            </div>
          </div>

          {/* Stats strip */}
          <div className="card-surface mt-14 grid grid-cols-2 divide-grey-100 md:grid-cols-4 md:divide-x">
            {stats.map((stat) => (
              <div key={stat.label} className="px-6 py-6 md:px-8">
                <p className="text-h3 font-semibold tracking-[-0.01em] text-royal-600">
                  {stat.value}
                </p>
                <p className="mt-1 text-caption text-grey-500">{stat.label}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* Featured news — card grid with photography */}
      <section className="bg-white py-18 md:py-24">
        <Container>
          <div className="flex items-end justify-between">
            <SectionHeading
              label={t("newsLabel")}
              title={t("newsTitle")}
              standfirst={t("newsStandfirst")}
            />
            <Link
              href="/news"
              className="hidden shrink-0 text-small font-medium text-royal-600 transition-colors hover:text-royal-500 md:block"
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
                    className="card-surface group block overflow-hidden transition-shadow duration-300 hover:shadow-[0_2px_4px_rgba(5,5,62,0.06),0_16px_40px_-16px_rgba(5,5,62,0.25)]"
                  >
                    {cover && (
                      <div className="relative aspect-[3/2] overflow-hidden bg-royal-50">
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
                          <span className="rounded-full bg-royal-50 px-2.5 py-1 font-medium text-royal-600">
                            {loc(article.category, "name", locale)}
                          </span>
                        )}
                        <span className="text-grey-500">
                          {formatDate(article.published_at, locale)}
                        </span>
                      </p>
                      <h3 className="mt-4 text-h4 font-semibold leading-snug text-ink transition-colors duration-200 group-hover:text-royal-600">
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
            className="mt-8 inline-block text-small font-medium text-royal-600 md:hidden"
          >
            {tCommon("viewAll")} →
          </Link>
        </Container>
      </section>

      {/* About — split with photography */}
      <section className="bg-grey-50 py-18 md:py-24">
        <Container>
          <div className="grid items-center gap-10 md:grid-cols-12 md:gap-14">
            <div className="order-2 md:order-1 md:col-span-6">
              <div className="relative aspect-[4/3] overflow-hidden rounded-2xl">
                <Image
                  src={mediaUrl("events/agm-2026.jpg") ?? assetPath("/images/hero.jpg")}
                  alt={
                    zh
                      ? "协会 2026 年度会员大会现场"
                      : "The association's 2026 Annual General Meeting"
                  }
                  fill
                  sizes="(min-width: 768px) 540px, 100vw"
                  className="object-cover"
                />
              </div>
            </div>
            <div className="order-1 md:order-2 md:col-span-6">
              <SectionHeading label={t("aboutLabel")} title={t("aboutTitle")} />
              <p className="mt-5 max-w-[34rem] text-body leading-relaxed text-grey-600">
                {t("aboutText")}
              </p>
              <div className="mt-8">
                <ButtonLink href="/about" variant="secondary">
                  {t("aboutCta")}
                </ButtonLink>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Chapters — numbered tiles */}
      <section className="bg-white py-18 md:py-24">
        <Container>
          <SectionHeading
            label={t("chaptersLabel")}
            title={t("chaptersTitle")}
            standfirst={t("chaptersStandfirst")}
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
                      {zh ? "秘书长" : "Secretary-General"} ·{" "}
                      {chapter.secretary_general}
                    </p>
                  )}
                </Link>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      {/* Events — card rows with date chip + thumbnail */}
      <section className="bg-royal-50 py-18 md:py-24">
        <Container>
          <div className="flex items-end justify-between">
            <SectionHeading label={t("eventsLabel")} title={t("eventsTitle")} />
            <Link
              href="/events"
              className="hidden shrink-0 text-small font-medium text-royal-600 transition-colors hover:text-royal-500 md:block"
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
                  className="card-surface group grid grid-cols-[4.5rem_1fr] items-center gap-5 p-5 transition-shadow duration-300 hover:shadow-[0_2px_4px_rgba(5,5,62,0.06),0_16px_40px_-16px_rgba(5,5,62,0.25)] md:grid-cols-[4.5rem_1fr_9rem] md:gap-6"
                >
                  <p className="flex h-[4.5rem] flex-col items-center justify-center rounded-xl bg-royal-600 text-white">
                    <span className="text-h3 font-semibold leading-none">
                      {new Date(event.starts_at).getDate()}
                    </span>
                    <span className="mt-1 text-[0.6875rem] tracking-[0.04em] text-white/75">
                      {formatDate(event.starts_at, locale, {
                        year: "numeric",
                        month: "short",
                      })}
                    </span>
                  </p>
                  <div>
                    <h3 className="text-h4 font-semibold leading-snug text-ink transition-colors duration-200 group-hover:text-royal-600">
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

      {/* Membership — three cards + CTA band */}
      <section className="bg-white py-18 md:py-24">
        <Container>
          <SectionHeading
            label={t("membershipLabel")}
            title={t("membershipTitle")}
            standfirst={t("membershipText")}
          />
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {membershipCards.map((card) => (
              <Link
                key={card.title}
                href="/membership"
                className="card-surface group block overflow-hidden transition-shadow duration-300 hover:shadow-[0_2px_4px_rgba(5,5,62,0.06),0_16px_40px_-16px_rgba(5,5,62,0.25)]"
              >
                <span className={`block h-1.5 ${card.bar}`} aria-hidden />
                <div className="p-7">
                  <h3 className="text-h4 font-semibold text-ink transition-colors duration-200 group-hover:text-royal-600">
                    {card.title}
                  </h3>
                  <p className="mt-3 text-small leading-relaxed text-grey-600">
                    {card.text}
                  </p>
                  <span className="mt-5 inline-block text-small font-medium text-royal-600">
                    {tCommon("learnMore")} →
                  </span>
                </div>
              </Link>
            ))}
          </div>

          <div className="mt-12 rounded-2xl bg-royal-600 px-8 py-10 text-center text-white md:px-14">
            <h2 className="mx-auto max-w-[24em] text-h3 font-semibold tracking-[-0.01em]">
              {zh
                ? "与我们一起，开拓中澳市场的下一步"
                : "Take the next step in Oceania–China business with us"}
            </h2>
            <div className="mt-7 flex flex-wrap items-center justify-center gap-5">
              <ButtonLink href="/membership/apply" variant="accent">
                {tMembership("applyCta")}
              </ButtonLink>
              <p className="text-caption text-white/70">
                {tMembership("applyNote")}
              </p>
            </div>
          </div>
        </Container>
      </section>

      {/* Partners — quiet band */}
      {partners.length > 0 && (
        <section className="border-t border-grey-100 bg-white py-12 md:py-14">
          <Container>
            <p className="text-center text-caption font-semibold uppercase tracking-[0.08em] text-grey-500">
              {t("partnersTitle")}
            </p>
            <p className="mx-auto mt-5 max-w-[48rem] text-center text-body leading-loose text-grey-600">
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
