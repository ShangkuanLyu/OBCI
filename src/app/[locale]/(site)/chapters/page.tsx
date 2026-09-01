import { setRequestLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Container } from "@/components/ui/Container";
import { PageHero } from "@/components/ui/PageHero";
import { Reveal } from "@/components/ui/Reveal";
import { getChapters } from "@/services/organisation";
import { loc } from "@/lib/utils/l10n";
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
  const t = await getTranslations({ locale, namespace: "chapters" });
  return pageMetadata({
    locale,
    path: "/chapters",
    title: t("title"),
    description: t("standfirst"),
  });
}

export default async function ChaptersPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: rawLocale } = await params;
  setRequestLocale(rawLocale);
  const locale = rawLocale as Locale;
  const t = await getTranslations("chapters");
  const tCommon = await getTranslations("common");

  const chapters = await getChapters().catch(() => []);

  return (
    <>
      <PageHero
        title={t("title")}
        standfirst={t("standfirst")}
      />

      <section className="bg-white py-16 md:py-24">
        <Container>
          {chapters.length === 0 && (
            <p className="text-body text-grey-500">{t("empty")}</p>
          )}

          {/* Modular industry cards (per the DOCX brief). */}
          <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3">
            {chapters.map((chapter, i) => {
              const tagline =
                loc(chapter, "tagline", locale) ||
                loc(chapter, "description", locale);
              return (
                <Reveal key={chapter.id} delay={(i % 3) * 80}>
                  <Link
                    href={`/chapters/${chapter.slug}`}
                    className="card-surface group flex h-full flex-col p-7 transition-shadow duration-300 hover:shadow-card-hover"
                  >
                    <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-sea-50 text-small font-semibold text-sea-800">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <h2 className="mt-5 text-h4 font-semibold leading-snug text-ink transition-colors duration-200 group-hover:text-sea-800">
                      {loc(chapter, "name", locale)}
                    </h2>
                    {chapter.secretary_general && (
                      <p className="mt-2 text-small text-grey-500">
                        {t("secretaryGeneral")} · {chapter.secretary_general}
                      </p>
                    )}
                    {tagline && (
                      <p className="mt-3 line-clamp-3 text-small leading-relaxed text-grey-600">
                        {tagline}
                      </p>
                    )}
                    <span className="mt-auto pt-5 text-small font-medium text-sea-800">
                      {tCommon("learnMore")} →
                    </span>
                  </Link>
                </Reveal>
              );
            })}
          </div>
        </Container>
      </section>
    </>
  );
}
