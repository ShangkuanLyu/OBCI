import { setRequestLocale, getTranslations } from "next-intl/server";
import { Container } from "@/components/ui/Container";
import { PageHero } from "@/components/ui/PageHero";
import { NewsletterForm } from "@/components/forms/NewsletterForm";
import { NewsIndex } from "@/components/news/NewsIndex";
import { getNewsCategories, getPublishedNews } from "@/services/news";
import { loc, formatDate } from "@/lib/utils/l10n";
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
  return { title: t("title"), description: t("standfirst") };
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

  const [categories, articles] = await Promise.all([
    getNewsCategories().catch(() => []),
    getPublishedNews().catch(() => []),
  ]);

  const items = articles.map((article) => ({
    id: article.id,
    slug: article.slug,
    title: loc(article, "title", locale),
    summary: loc(article, "summary", locale),
    date: formatDate(article.published_at, locale),
    categorySlug: article.category?.slug ?? null,
    categoryName: article.category ? loc(article.category, "name", locale) : "",
  }));
  const categoryItems = categories.map((cat) => ({
    slug: cat.slug,
    name: loc(cat, "name", locale),
  }));

  return (
    <>
      <PageHero
        label="News & Insights"
        title={t("title")}
        standfirst={t("standfirst")}
      />

      <section className="bg-white py-16 md:py-24">
        <Container>
          <NewsIndex items={items} categories={categoryItems} />
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
