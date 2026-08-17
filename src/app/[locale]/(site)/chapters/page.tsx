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

          {/* Numbered typographic grid — hairline rows, no cards */}
          <div className="grid gap-x-10 gap-y-12 sm:grid-cols-2 md:grid-cols-3">
            {chapters.map((chapter, i) => {
              const description = loc(chapter, "description", locale);
              return (
                <Reveal key={chapter.id} delay={(i % 3) * 80}>
                  <Link
                    href={`/chapters/${chapter.slug}`}
                    className="group block border-t border-grey-300 pt-6"
                  >
                    <p className="text-caption font-medium tracking-[0.08em] text-gold-600">
                      {String(i + 1).padStart(2, "0")}
                    </p>
                    <h2 className="mt-3 text-h4 font-semibold leading-snug text-ink transition-colors duration-200 group-hover:text-navy-800">
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
