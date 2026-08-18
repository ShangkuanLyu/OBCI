import { setRequestLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Container } from "@/components/ui/Container";
import { PageHero } from "@/components/ui/PageHero";
import { Reveal } from "@/components/ui/Reveal";
import { getChapters } from "@/services/organisation";
import { loc } from "@/lib/utils/l10n";
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
  return { title: t("title"), description: t("standfirst") };
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

  const chapters = await getChapters().catch(() => []);

  return (
    <>
      <PageHero
        label="Chapters"
        title={t("title")}
        standfirst={t("standfirst")}
      />

      <section className="bg-white py-16 md:py-24">
        <Container>
          {chapters.length === 0 && (
            <p className="text-body text-grey-500">{t("empty")}</p>
          )}

          {/* Numbered card-surface tile grid */}
          <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3">
            {chapters.map((chapter, i) => {
              const description = loc(chapter, "description", locale);
              return (
                <Reveal key={chapter.id} delay={(i % 3) * 80}>
                  <Link
                    href={`/chapters/${chapter.slug}`}
                    className="card-surface group block p-7 transition-shadow duration-300 hover:shadow-[0_2px_4px_rgba(5,5,62,0.06),0_16px_40px_-16px_rgba(5,5,62,0.25)]"
                  >
                    <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-royal-50 text-small font-semibold text-royal-600">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <h2 className="mt-5 text-h4 font-semibold leading-snug text-ink transition-colors duration-200 group-hover:text-royal-600">
                      {loc(chapter, "name", locale)}
                    </h2>
                    {chapter.secretary_general && (
                      <p className="mt-2 text-small text-grey-500">
                        {t("secretaryGeneral")} · {chapter.secretary_general}
                      </p>
                    )}
                    {description && (
                      <p className="mt-3 line-clamp-2 text-small leading-relaxed text-grey-600">
                        {description}
                      </p>
                    )}
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
