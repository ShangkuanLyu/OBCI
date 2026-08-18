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

  const membershipPanels = [
    {
      href: "/membership",
      bg: "bg-royal-600 hover:bg-royal-700",
      title: locale === "zh" ? "个人会员" : "Individual",
      text:
        locale === "zh"
          ? "面向参与中澳经贸活动的专业人士。"
          : "For professionals engaging in Oceania–China trade.",
    },
    {
      href: "/membership",
      bg: "bg-rose-500 hover:bg-rose-600",
      title: locale === "zh" ? "企业会员" : "Corporate",
      text:
        locale === "zh"
          ? "面向拓展国际市场的企业与机构。"
          : "For enterprises expanding into international markets.",
    },
    {
      href: "/membership",
      bg: "bg-navy-900 hover:bg-navy-800",
      title: locale === "zh" ? "协会与机构会员" : "Associations",
      text:
        locale === "zh"
          ? "面向深耕多边合作的行业组织。"
          : "For industry bodies focused on multilateral cooperation.",
    },
  ];

  return (
    <>
      {/* Hero — full-bleed photography with indigo scrim */}
      <section className="relative overflow-hidden bg-navy-900 text-white">
        <Image
          src={assetPath("/images/hero.jpg")}
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-navy-950/55" />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-navy-950/80 to-transparent" />
        <Container className="relative flex min-h-[560px] flex-col justify-center pb-24 pt-24 md:min-h-[640px] md:pb-32 md:pt-28">
          <p className="text-caption font-medium uppercase tracking-[0.08em] text-rose-400">
            {locale === "zh" ? "Oceania Business Association" : "大洋洲工商协会"}
          </p>
          <h1 className="mt-6 max-w-[15em] text-[2.375rem] leading-[1.1] font-semibold tracking-[-0.02em] md:text-[3.5rem] md:leading-[1.08]">
            {t("heroTitle")}
          </h1>
          <p className="mt-7 max-w-[34rem] text-body-lg text-white/85">
            {t("heroText")}
          </p>
          <div className="mt-10 flex flex-wrap gap-4">
            <ButtonLink href="/membership/apply" variant="primary">
              {t("heroPrimary")}
            </ButtonLink>
            <ButtonLink href="/about" variant="secondaryDark">
              {t("heroSecondary")}
            </ButtonLink>
          </div>
        </Container>
      </section>

      {/* Featured news — editorial grid with photography */}
      <section className="bg-white py-20 md:py-28">
        <Container>
          <div className="flex items-end justify-between">
            <SectionHeading
              label={t("newsLabel")}
              title={t("newsTitle")}
              standfirst={t("newsStandfirst")}
            />
            <Link
              href="/news"
              className="hidden shrink-0 text-small font-medium text-royal-600 transition-colors hover:text-rose-600 md:block"
            >
              {tCommon("viewAll")} →
            </Link>
          </div>

          <div className="mt-12 grid gap-x-8 gap-y-12 md:grid-cols-3">
            {news.map((article, i) => {
              const cover = mediaUrl(article.cover_image_path);
              return (
                <Reveal key={article.id} as="article" delay={i * 80}>
                  <Link href={`/news/${article.slug}`} className="group block">
                    {cover && (
                      <div className="relative aspect-[3/2] overflow-hidden rounded-md bg-navy-100">
                        <Image
                          src={cover}
                          alt=""
                          fill
                          sizes="(min-width: 768px) 350px, 100vw"
                          className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                        />
                      </div>
                    )}
                    <p className="mt-5 flex items-baseline gap-3 text-caption">
                      <span className="font-medium uppercase tracking-[0.08em] text-rose-600">
                        {article.category
                          ? loc(article.category, "name", locale)
                          : ""}
                      </span>
                      <span className="text-grey-500">
                        {formatDate(article.published_at, locale)}
                      </span>
                    </p>
                    <h3 className="mt-3 text-h4 font-semibold leading-snug text-ink transition-colors duration-200 group-hover:text-royal-600">
                      {loc(article, "title", locale)}
                    </h3>
                    <p className="mt-3 line-clamp-2 text-small leading-relaxed text-grey-600">
                      {loc(article, "summary", locale)}
                    </p>
                  </Link>
                </Reveal>
              );
            })}
          </div>

          <Link
            href="/news"
            className="mt-10 inline-block text-small font-medium text-royal-600 md:hidden"
          >
            {tCommon("viewAll")} →
          </Link>
        </Container>
      </section>

      {/* About — warm ivory editorial band with photography */}
      <section className="bg-ivory py-20 md:py-28">
        <Container>
          <div className="grid items-center gap-10 md:grid-cols-12 md:gap-14">
            <div className="md:col-span-6">
              <SectionHeading label={t("aboutLabel")} title={t("aboutTitle")} />
              <p className="mt-6 max-w-[34rem] text-body leading-relaxed text-grey-600">
                {t("aboutText")}
              </p>
              <Link
                href="/about"
                className="mt-8 inline-block text-small font-medium text-royal-600 transition-colors hover:text-rose-600"
              >
                {t("aboutCta")} →
              </Link>
            </div>
            <div className="md:col-span-6">
              <div className="relative aspect-[4/3] overflow-hidden rounded-lg">
                <Image
                  src={
                    mediaUrl("events/agm-2026.jpg") ??
                    assetPath("/images/hero.jpg")
                  }
                  alt={
                    locale === "zh"
                      ? "协会 2026 年度会员大会现场"
                      : "The association's 2026 Annual General Meeting"
                  }
                  fill
                  sizes="(min-width: 768px) 540px, 100vw"
                  className="object-cover"
                />
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Chapters — numbered typographic grid */}
      <section className="bg-white py-20 md:py-28">
        <Container>
          <SectionHeading
            label={t("chaptersLabel")}
            title={t("chaptersTitle")}
            standfirst={t("chaptersStandfirst")}
          />
          <div className="mt-12 grid gap-x-10 gap-y-10 sm:grid-cols-2 md:grid-cols-3">
            {chapters.map((chapter, i) => (
              <Reveal key={chapter.id} delay={(i % 3) * 80}>
                <Link
                  href={`/chapters/${chapter.slug}`}
                  className="group block border-t-2 border-grey-100 pt-6 transition-colors hover:border-royal-600"
                >
                  <p className="text-caption font-medium tracking-[0.08em] text-royal-600">
                    {String(i + 1).padStart(2, "0")}
                  </p>
                  <h3 className="mt-3 text-h4 font-semibold text-ink transition-colors duration-200 group-hover:text-royal-600">
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

      {/* Events — date + typography + thumbnail rows */}
      <section className="bg-grey-50 py-20 md:py-28">
        <Container>
          <div className="flex items-end justify-between">
            <SectionHeading label={t("eventsLabel")} title={t("eventsTitle")} />
            <Link
              href="/events"
              className="hidden shrink-0 text-small font-medium text-royal-600 transition-colors hover:text-rose-600 md:block"
            >
              {tCommon("viewAll")} →
            </Link>
          </div>
          <div className="mt-12">
            {events.length === 0 && (
              <p className="text-body text-grey-500">{tEvents("empty")}</p>
            )}
            {events.map((event) => {
              const cover = mediaUrl(event.cover_image_path);
              return (
                <Link
                  key={event.id}
                  href={`/events/${event.slug}`}
                  className="group grid grid-cols-[5.5rem_1fr] items-center gap-6 border-t border-grey-300 py-6 last:border-b md:grid-cols-[7rem_1fr_10rem]"
                >
                  <p>
                    <span className="block text-h3 font-semibold leading-none text-royal-600">
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
                    <h3 className="text-h4 font-semibold leading-snug text-ink transition-colors duration-200 group-hover:text-royal-600">
                      {loc(event, "title", locale)}
                    </h3>
                    {loc(event, "location", locale) && (
                      <p className="mt-2 text-small text-grey-500">
                        {loc(event, "location", locale)}
                      </p>
                    )}
                  </div>
                  {cover && (
                    <div className="relative hidden aspect-[16/10] overflow-hidden rounded-md md:block">
                      <Image
                        src={cover}
                        alt=""
                        fill
                        sizes="160px"
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

      {/* Membership — brand tri-colour panels */}
      <section className="bg-white py-20 md:py-28">
        <Container>
          <SectionHeading
            label={t("membershipLabel")}
            title={t("membershipTitle")}
            standfirst={t("membershipText")}
          />
          <div className="mt-12 grid gap-4 md:grid-cols-3">
            {membershipPanels.map((panel) => (
              <Link
                key={panel.title}
                href={panel.href}
                className={`group flex min-h-[13rem] flex-col justify-between rounded-lg p-8 text-white transition-colors duration-200 ${panel.bg}`}
              >
                <div>
                  <h3 className="text-h4 font-semibold">{panel.title}</h3>
                  <p className="mt-3 max-w-[16rem] text-small leading-relaxed text-white/80">
                    {panel.text}
                  </p>
                </div>
                <span className="text-small font-medium">
                  {tCommon("learnMore")} →
                </span>
              </Link>
            ))}
          </div>
          <div className="mt-10 flex flex-wrap items-center gap-5">
            <ButtonLink href="/membership/apply" variant="primary">
              {tMembership("applyCta")}
            </ButtonLink>
            <p className="text-caption text-grey-500">
              {tMembership("applyNote")}
            </p>
          </div>
        </Container>
      </section>

      {/* Partners — quiet text band */}
      {partners.length > 0 && (
        <section className="border-t border-grey-100 bg-white py-14 md:py-16">
          <Container>
            <p className="text-center text-caption font-medium uppercase tracking-[0.08em] text-grey-500">
              {t("partnersTitle")}
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
