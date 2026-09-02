import { setRequestLocale, getTranslations } from "next-intl/server";
import { Container } from "@/components/ui/Container";
import { PageHero } from "@/components/ui/PageHero";
import { NewsletterForm } from "@/components/forms/NewsletterForm";
import { NewsIndex, type NewsListItem } from "@/components/news/NewsIndex";
import { ReviewNote } from "@/components/ui/ReviewNote";
import { getNewsCategories, getPublishedNews } from "@/services/news";
import { getChapters } from "@/services/organisation";
import { categoryOptions, tagOptions } from "@/lib/news/filter";
import {
  isLegacyNewsCategory,
  newsCategoryName,
  resolveNewsCategories,
} from "@/lib/news/categories";
import {
  designFixturesEnabled,
  fixtureNewsTags,
} from "@/lib/fixtures/design-review";
import { loc, formatDate, mediaUrl } from "@/lib/utils/l10n";
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
  const t = await getTranslations({ locale, namespace: "news" });
  return pageMetadata({
    locale,
    path: "/news",
    title: t("title"),
    description: t("standfirst"),
  });
}

export default async function NewsIndexPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: rawLocale } = await params;
  setRequestLocale(rawLocale);
  const locale = rawLocale as Locale;
  const t = await getTranslations("news");
  const tNewsletter = await getTranslations("newsletter");

  const [categories, articles, chapters] = await Promise.all([
    getNewsCategories().catch(() => []),
    getPublishedNews().catch(() => []),
    getChapters().catch(() => []),
  ]);

  // Preview build: the health articles carry their chapter tags from the
  // fixture map until the approved data update tags the rows themselves.
  const fixtures = designFixturesEnabled();
  // Category structure: the five DOCX first-level categories are always
  // offered (preview enforces them; production reads the CMS rows, whose
  // is_active flag marks legacy categories). Articles in a legacy category
  // stay listed under "全部", marked "历史分类待整理".
  const resolvedCategories = resolveNewsCategories(categories, {
    enforceDocx: fixtures,
  });
  // Per-article name/legacy flag come from the article's own embedded
  // category row — the same call the article page and the home page make.
  const items: NewsListItem[] = articles.map((article) => ({
    id: article.id,
    slug: article.slug,
    title: loc(article, "title", locale),
    summary: loc(article, "summary", locale),
    date: formatDate(article.published_at, locale),
    categorySlug: article.category?.slug ?? null,
    categoryName: article.category
      ? newsCategoryName(article.category, locale, fixtures)
      : "",
    categoryLegacy: isLegacyNewsCategory(article.category, fixtures),
    image: mediaUrl(article.cover_image_path),
    featured: article.is_featured,
    tags: fixtures
      ? Array.from(
          new Set([...(article.tags ?? []), ...fixtureNewsTags(article.slug)]),
        )
      : (article.tags ?? []),
  }));
  const categoryItems = categoryOptions(
    resolvedCategories.map((category) => ({
      slug: category.slug,
      name: newsCategoryName(category, locale, false),
      legacy: category.legacy,
    })),
    items,
  );
  const chapterNames = new Map(
    chapters.map((chapter) => [chapter.slug, loc(chapter, "name", locale)]),
  );
  const tagItems = tagOptions(items, chapterNames);

  return (
    <>
      <PageHero
        title={t("title")}
        standfirst={t("standfirst")}
      />

      <section className="bg-white py-16 md:py-24">
        <Container>
          {/* Fixture-only chapter tags are a demonstration association. */}
          {fixtures && tagItems.length > 0 && (
            <ReviewNote className="mb-8">{t("demoTagsNote")}</ReviewNote>
          )}
          <NewsIndex
            items={items}
            categories={categoryItems}
            tags={tagItems}
          />
        </Container>
      </section>

      {/* Newsletter — quiet closing band */}
      <section className="border-t border-grey-300 bg-grey-50 py-16 md:py-20">
        <Container>
          <div className="grid items-center gap-8 md:grid-cols-2">
            <div>
              <h2 className="text-h4 font-semibold text-ink">
                {tNewsletter("title")}
              </h2>
              <p className="mt-2 text-small text-grey-600">
                {tNewsletter("text")}
              </p>
            </div>
            <div className="md:justify-self-end">
              <NewsletterForm />
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
