import Image from "next/image";
import { notFound } from "next/navigation";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Container } from "@/components/ui/Container";
import { ButtonLink } from "@/components/ui/Button";
import { getChapterBySlug, getChapters } from "@/services/organisation";
import { getNewsByChapter } from "@/services/news";
import { getEventsByChapter } from "@/services/events";
import { loc, formatDate, melbourneDay, mediaUrl } from "@/lib/utils/l10n";
import { pageMetadata } from "@/lib/seo";
import type { Locale } from "@/i18n/routing";
import type { Metadata } from "next";

export const revalidate = 300;

export async function generateStaticParams() {
  const chapters = await getChapters().catch(() => []);
  return chapters.map((chapter) => ({ slug: chapter.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const chapter = await getChapterBySlug(slug).catch(() => null);
  if (!chapter) return {};
  return pageMetadata({
    locale,
    path: `/chapters/${slug}`,
    title: loc(chapter, "name", locale as Locale),
    description:
      loc(chapter, "tagline", locale as Locale) ||
      loc(chapter, "description", locale as Locale) ||
      undefined,
  });
}

export default async function ChapterPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale: rawLocale, slug } = await params;
  setRequestLocale(rawLocale);
  const locale = rawLocale as Locale;
  const t = await getTranslations("chapters");
  const tCommon = await getTranslations("common");

  const chapter = await getChapterBySlug(slug).catch(() => null);
  if (!chapter) notFound();

  const [news, events] = await Promise.all([
    getNewsByChapter(slug, 3).catch(() => []),
    getEventsByChapter(slug, 3).catch(() => []),
  ]);

  const tagline = loc(chapter, "tagline", locale);
  const description = loc(chapter, "description", locale);
  const paragraphs = description
    .split(/\n+/)
    .map((p) => p.trim())
    .filter(Boolean);
  const resources =
    locale === "zh"
      ? chapter.resources_zh.length > 0
        ? chapter.resources_zh
        : chapter.resources_en
      : chapter.resources_en.length > 0
        ? chapter.resources_en
        : chapter.resources_zh;
  const services =
    locale === "zh"
      ? chapter.services_zh.length > 0
        ? chapter.services_zh
        : chapter.services_en
      : chapter.services_en.length > 0
        ? chapter.services_en
        : chapter.services_zh;
  const consultHref = `/contact?topic=${encodeURIComponent(loc(chapter, "name", locale))}`;

  return (
    <>
      {/* 1 · Chapter header */}
      <section className="border-b border-grey-100 bg-sea-50">
        <Container className="pb-12 pt-12 md:pb-16 md:pt-16">
          <p className="flex items-center gap-3 text-caption font-semibold uppercase tracking-[0.06em] text-sea-800">
            <span className="h-0.5 w-6 rounded-full bg-gold-600" aria-hidden />
            {t("title")}
          </p>
          <h1 className="mt-4 max-w-[20em] text-[2rem] font-semibold leading-[1.2] tracking-[-0.02em] text-ink md:text-h1">
            {loc(chapter, "name", locale)}
          </h1>
          {tagline && (
            <p className="mt-5 max-w-[36rem] text-body-lg text-grey-600">
              {tagline}
            </p>
          )}
          <div className="mt-8 flex flex-wrap gap-4">
            <ButtonLink href={consultHref} variant="primary">
              {t("consultCta")}
            </ButtonLink>
            <ButtonLink href="/membership/apply" variant="secondary">
              {t("joinCta")}
            </ButtonLink>
          </div>
        </Container>
      </section>

      {/* 2 · Industry introduction + secretariat panel */}
      <section className="bg-white py-16 md:py-20">
        <Container>
          <div className="grid gap-12 md:grid-cols-12 md:gap-16">
            <div className="md:col-span-7">
              <h2 className="text-h3 font-semibold text-ink">
                {t("introTitle")}
              </h2>
              {paragraphs.length > 0 ? (
                <div className="mt-6 space-y-5">
                  {paragraphs.map((paragraph, i) => (
                    <p
                      key={i}
                      className="text-body leading-relaxed text-grey-600"
                    >
                      {paragraph}
                    </p>
                  ))}
                </div>
              ) : (
                <p className="mt-6 text-body text-grey-500">{t("empty")}</p>
              )}
            </div>
            {(chapter.secretary_general || chapter.contact_email) && (
              <aside className="md:col-span-4 md:col-start-9">
                <div className="card-surface divide-y divide-grey-100">
                  {chapter.secretary_general && (
                    <div className="px-6 py-5">
                      <p className="text-caption font-semibold uppercase tracking-[0.06em] text-sea-800">
                        {t("secretaryGeneral")}
                      </p>
                      <p className="mt-1.5 text-body font-medium text-ink">
                        {chapter.secretary_general}
                      </p>
                    </div>
                  )}
                  {chapter.contact_email && (
                    <div className="px-6 py-5">
                      <p className="text-caption font-semibold uppercase tracking-[0.06em] text-sea-800">
                        {tCommon("contactUs")}
                      </p>
                      <a
                        href={`mailto:${chapter.contact_email}`}
                        className="mt-1.5 block text-body font-medium text-sea-800 transition-colors hover:text-sea-600"
                      >
                        {chapter.contact_email}
                      </a>
                    </div>
                  )}
                </div>
              </aside>
            )}
          </div>
        </Container>
      </section>

      {/* 3 · Local resources (hidden until the chamber supplies content) */}
      {resources.length > 0 && (
        <section className="bg-grey-50 py-16 md:py-20">
          <Container>
            <h2 className="text-h3 font-semibold text-ink">
              {t("resourcesTitle")}
            </h2>
            <ul className="mt-8 grid gap-x-12 gap-y-4 md:grid-cols-2">
              {resources.map((item, i) => (
                <li
                  key={i}
                  className="flex items-start gap-3 border-b border-grey-100 pb-4 text-body text-ink"
                >
                  <span
                    className="mt-[0.7em] h-0.5 w-4 shrink-0 rounded-full bg-gold-600"
                    aria-hidden
                  />
                  {item}
                </li>
              ))}
            </ul>
          </Container>
        </section>
      )}

      {/* 4 · ABS industry services */}
      {services.length > 0 && (
        <section className="bg-white py-16 md:py-20">
          <Container>
            <div className="grid gap-10 md:grid-cols-12 md:gap-16">
              <div className="md:col-span-5">
                <h2 className="text-h3 font-semibold text-ink">
                  {t("absTitle")}
                </h2>
              </div>
              <div className="md:col-span-7">
                <ol>
                  {services.map((item, i) => (
                    <li
                      key={i}
                      className="grid grid-cols-[2.5rem_1fr] items-baseline gap-4 border-t border-grey-100 py-4 first:border-t-0 first:pt-0"
                    >
                      <span className="text-h4 font-semibold tabular-nums text-grey-300">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span className="text-body text-ink">{item}</span>
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          </Container>
        </section>
      )}

      {/* 5 · Industry news */}
      {news.length > 0 && (
        <section className="bg-grey-50 py-16 md:py-20">
          <Container>
            <div className="flex items-end justify-between">
              <h2 className="text-h3 font-semibold text-ink">
                {t("newsTitle")}
              </h2>
              <Link
                href="/news"
                className="hidden shrink-0 text-small font-medium text-sea-800 transition-colors hover:text-sea-600 md:block"
              >
                {tCommon("viewAll")} →
              </Link>
            </div>
            <div className="mt-8 grid gap-6 md:grid-cols-3">
              {news.map((article) => {
                const cover = mediaUrl(article.cover_image_path);
                return (
                  <Link
                    key={article.id}
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
                      <p className="text-caption text-grey-500">
                        {formatDate(article.published_at, locale)}
                      </p>
                      <h3 className="mt-3 text-body font-semibold leading-snug text-ink transition-colors duration-200 group-hover:text-sea-800">
                        {loc(article, "title", locale)}
                      </h3>
                    </div>
                  </Link>
                );
              })}
            </div>
          </Container>
        </section>
      )}

      {/* 6 · Past events */}
      {events.length > 0 && (
        <section className="bg-white py-16 md:py-20">
          <Container>
            <h2 className="text-h3 font-semibold text-ink">
              {t("eventsTitle")}
            </h2>
            <div className="mt-8 space-y-4">
              {events.map((event) => (
                <Link
                  key={event.id}
                  href={`/events/${event.slug}`}
                  className="card-surface group grid grid-cols-[4.5rem_1fr] items-center gap-5 p-5 transition-shadow duration-300 hover:shadow-card-hover"
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
                </Link>
              ))}
            </div>
          </Container>
        </section>
      )}

      {/* 7 · Back link + 8 · dual CTA band */}
      <section className="bg-white pb-16 md:pb-24">
        <Container>
          <Link
            href="/chapters"
            className="inline-block text-small font-medium text-sea-800 transition-colors hover:text-sea-600"
          >
            ← {t("backToChapters")}
          </Link>
          <div className="mt-10 rounded-2xl bg-sea-800 px-8 py-10 text-center text-white md:px-14">
            <h2 className="mx-auto max-w-[24em] text-h3 font-semibold tracking-[-0.01em]">
              {t("consultPrompt")}
            </h2>
            <div className="mt-7 flex flex-wrap justify-center gap-4">
              <Link
                href={consultHref}
                className="inline-flex h-11 items-center justify-center rounded-full bg-white px-7 text-small font-medium text-sea-800 transition-colors duration-200 hover:bg-sea-100"
              >
                {t("consultCta")}
              </Link>
              <Link
                href="/membership/apply"
                className="inline-flex h-11 items-center justify-center rounded-full border border-white/40 px-7 text-small font-medium text-white transition-colors duration-200 hover:bg-white/10"
              >
                {t("joinCta")}
              </Link>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
