import Image from "next/image";
import { notFound } from "next/navigation";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Container } from "@/components/ui/Container";
import { getAllNewsSlugs, getNewsBySlug, getPublishedNews } from "@/services/news";
import { loc, formatDate, mediaUrl } from "@/lib/utils/l10n";
import { renderMarkdown } from "@/lib/utils/markdown";
import type { Locale } from "@/i18n/routing";
import type { Metadata } from "next";

export const revalidate = 300;

export async function generateStaticParams() {
  const slugs = await getAllNewsSlugs().catch(() => []);
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const article = await getNewsBySlug(slug).catch(() => null);
  if (!article) return {};
  return {
    title: loc(article, "title", locale as Locale),
    description: loc(article, "summary", locale as Locale),
  };
}

export default async function NewsArticlePage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale: rawLocale, slug } = await params;
  setRequestLocale(rawLocale);
  const locale = rawLocale as Locale;
  const t = await getTranslations("news");
  const tCommon = await getTranslations("common");

  const article = await getNewsBySlug(slug).catch(() => null);
  if (!article) notFound();

  const body = loc(article, "body", locale);
  const bodyIsFallback =
    locale === "zh"
      ? !article.body_zh?.trim() && !!article.body_en?.trim()
      : !article.body_en?.trim() && !!article.body_zh?.trim();

  const related = (await getPublishedNews({ limit: 4 }).catch(() => []))
    .filter((a) => a.slug !== slug)
    .slice(0, 3);

  return (
    <>
      {/* Article header — navy, editorial */}
      <section className="bg-navy-900 text-white">
        <Container className="pb-14 pt-14 md:pb-16 md:pt-16">
          <p className="flex flex-wrap items-baseline gap-x-3 gap-y-1 text-caption">
            {article.category && (
              <span className="font-medium uppercase tracking-[0.08em] text-rose-400">
                {loc(article.category, "name", locale)}
              </span>
            )}
            <span className="text-white/60">
              {formatDate(article.published_at, locale)}
            </span>
            {article.author_name && (
              <span className="text-white/60">· {article.author_name}</span>
            )}
          </p>
          <h1 className="mt-5 max-w-[24em] text-[1.75rem] font-semibold leading-[1.2] tracking-[-0.015em] md:text-[2.5rem] md:leading-[1.15]">
            {loc(article, "title", locale)}
          </h1>
        </Container>
      </section>

      <article className="bg-white py-14 md:py-20">
        <Container>
          {mediaUrl(article.cover_image_path) && (
            <div className="relative mx-auto mb-12 aspect-[2/1] max-w-[56rem] overflow-hidden rounded-lg bg-navy-100">
              <Image
                src={mediaUrl(article.cover_image_path)!}
                alt=""
                fill
                sizes="(min-width: 1024px) 896px, 100vw"
                className="object-cover"
                priority
              />
            </div>
          )}
          <div className="mx-auto max-w-[42rem]">
            {bodyIsFallback && (
              <p className="mb-8 border-l-2 border-rose-500 pl-4 text-small text-grey-500">
                {locale === "zh" ? tCommon("englishOnly") : tCommon("chineseOnly")}
              </p>
            )}
            <p className="text-body-lg leading-relaxed text-grey-600">
              {loc(article, "summary", locale)}
            </p>
            <div className="mt-10 border-t border-grey-300 pt-2">
              {renderMarkdown(body)}
            </div>
            {article.source_url && (
              <p className="mt-12 border-t border-grey-300 pt-6 text-caption text-grey-500">
                {t("source")}:{" "}
                <a
                  href={article.source_url}
                  rel="noopener noreferrer"
                  className="underline decoration-grey-300 underline-offset-4 hover:text-navy-800"
                >
                  {article.source_url}
                </a>
              </p>
            )}
          </div>
        </Container>
      </article>

      {/* Related — quiet editorial row */}
      {related.length > 0 && (
        <section className="border-t border-grey-300 bg-grey-50 py-16 md:py-20">
          <Container>
            <div className="flex items-baseline justify-between">
              <h2 className="text-h4 font-semibold text-ink">{t("related")}</h2>
              <Link
                href="/news"
                className="text-small font-medium text-navy-800 transition-colors hover:text-rose-600"
              >
                {t("backToNews")} →
              </Link>
            </div>
            <div className="mt-10 grid gap-x-10 gap-y-10 md:grid-cols-3">
              {related.map((item) => (
                <Link
                  key={item.id}
                  href={`/news/${item.slug}`}
                  className="group block border-t border-grey-300 pt-5"
                >
                  <p className="text-caption text-grey-500">
                    {formatDate(item.published_at, locale)}
                  </p>
                  <h3 className="mt-3 text-body font-semibold leading-snug text-ink transition-colors duration-200 group-hover:text-navy-800">
                    {loc(item, "title", locale)}
                  </h3>
                </Link>
              ))}
            </div>
          </Container>
        </section>
      )}
    </>
  );
}
