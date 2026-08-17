import { setRequestLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Container } from "@/components/ui/Container";
import { PageHero } from "@/components/ui/PageHero";
import { NewsletterForm } from "@/components/forms/NewsletterForm";
import { getNewsCategories, getPublishedNews } from "@/services/news";
import { loc, formatDate } from "@/lib/utils/l10n";
import { cn } from "@/lib/utils/cn";
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
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ category?: string }>;
}) {
  const { locale: rawLocale } = await params;
  const { category } = await searchParams;
  setRequestLocale(rawLocale);
  const locale = rawLocale as Locale;
  const t = await getTranslations("news");
  const tNewsletter = await getTranslations("newsletter");

  const [categories, articles] = await Promise.all([
    getNewsCategories().catch(() => []),
    getPublishedNews({ categorySlug: category }).catch(() => []),
  ]);

  const [lead, ...rest] = articles;

  return (
    <>
      <PageHero
        label="News & Insights"
        title={t("title")}
        standfirst={t("standfirst")}
      />

      <section className="bg-white py-16 md:py-24">
        <Container>
          {/* Category filter — quiet text tabs on a hairline */}
          <nav
            aria-label={t("title")}
            className="flex gap-8 overflow-x-auto border-b border-grey-300"
          >
            <Link
              href="/news"
              className={cn(
                "relative shrink-0 pb-4 text-small transition-colors",
                !category
                  ? "font-medium text-navy-900"
                  : "text-grey-500 hover:text-navy-800",
              )}
            >
              {t("all")}
              {!category && (
                <span className="absolute inset-x-0 bottom-0 h-0.5 bg-gold-500" />
              )}
            </Link>
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/news?category=${cat.slug}`}
                className={cn(
                  "relative shrink-0 pb-4 text-small transition-colors",
                  category === cat.slug
                    ? "font-medium text-navy-900"
                    : "text-grey-500 hover:text-navy-800",
                )}
              >
                {loc(cat, "name", locale)}
                {category === cat.slug && (
                  <span className="absolute inset-x-0 bottom-0 h-0.5 bg-gold-500" />
                )}
              </Link>
            ))}
          </nav>

          {articles.length === 0 && (
            <p className="py-20 text-body text-grey-500">{t("empty")}</p>
          )}

          {/* Lead article */}
          {lead && (
            <Link
              href={`/news/${lead.slug}`}
              className="group block py-12 md:py-16"
            >
              <div className="max-w-[46rem]">
                <p className="flex items-baseline gap-3 text-caption">
                  <span className="font-medium uppercase tracking-[0.08em] text-gold-600">
                    {lead.category ? loc(lead.category, "name", locale) : ""}
                  </span>
                  <span className="text-grey-500">
                    {formatDate(lead.published_at, locale)}
                  </span>
                </p>
                <h2 className="mt-5 text-h3 font-semibold leading-[1.2] tracking-[-0.01em] text-ink transition-colors duration-200 group-hover:text-navy-800 md:text-h2">
                  {loc(lead, "title", locale)}
                </h2>
                <p className="mt-5 max-w-[42rem] text-body leading-relaxed text-grey-600">
                  {loc(lead, "summary", locale)}
                </p>
              </div>
            </Link>
          )}

          {/* Editorial grid */}
          {rest.length > 0 && (
            <div className="grid gap-x-10 gap-y-12 border-t border-grey-300 pt-12 md:grid-cols-3">
              {rest.map((article) => (
                <Link
                  key={article.id}
                  href={`/news/${article.slug}`}
                  className="group block"
                >
                  <p className="flex items-baseline gap-3 text-caption">
                    <span className="font-medium uppercase tracking-[0.08em] text-gold-600">
                      {article.category
                        ? loc(article.category, "name", locale)
                        : ""}
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
              ))}
            </div>
          )}
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
