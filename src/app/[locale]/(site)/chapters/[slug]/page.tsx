import { notFound } from "next/navigation";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Container } from "@/components/ui/Container";
import { ButtonLink } from "@/components/ui/Button";
import { getChapterBySlug, getChapters } from "@/services/organisation";
import { loc } from "@/lib/utils/l10n";
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
  return {
    title: loc(chapter, "name", locale as Locale),
    description: loc(chapter, "description", locale as Locale) || undefined,
  };
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

  const description = loc(chapter, "description", locale);
  const paragraphs = description
    .split(/\n+/)
    .map((p) => p.trim())
    .filter(Boolean);

  return (
    <>
      {/* Chapter header — navy, editorial */}
      <section className="bg-navy-900 text-white">
        <Container className="pb-16 pt-14 md:pb-20 md:pt-16">
          <p className="text-caption font-medium uppercase tracking-[0.08em] text-gold-400">
            {t("title")}
          </p>
          <h1 className="mt-4 max-w-[20em] text-[2rem] font-semibold leading-[1.12] tracking-[-0.02em] md:text-h1">
            {loc(chapter, "name", locale)}
          </h1>
          {paragraphs[0] && (
            <p className="mt-6 max-w-[36rem] text-body-lg text-navy-100/85">
              {paragraphs[0]}
            </p>
          )}
        </Container>
      </section>

      <section className="bg-white py-16 md:py-24">
        <Container>
          <div className="max-w-[42rem]">
            {/* Secretary-general & contact — hairline definition rows */}
            {(chapter.secretary_general || chapter.contact_email) && (
              <div className="divide-y divide-grey-300 border-y border-grey-300">
                {chapter.secretary_general && (
                  <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 py-5">
                    <span className="text-caption font-medium uppercase tracking-[0.08em] text-gold-600">
                      {t("secretaryGeneral")}
                    </span>
                    <span className="text-body font-medium text-ink">
                      {chapter.secretary_general}
                    </span>
                  </div>
                )}
                {chapter.contact_email && (
                  <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 py-5">
                    <span className="text-caption font-medium uppercase tracking-[0.08em] text-gold-600">
                      {tCommon("contactUs")}
                    </span>
                    <a
                      href={`mailto:${chapter.contact_email}`}
                      className="text-body text-navy-800 underline decoration-grey-300 underline-offset-4 transition-colors hover:text-gold-600"
                    >
                      {chapter.contact_email}
                    </a>
                  </div>
                )}
              </div>
            )}

            {/* Description */}
            {paragraphs.length > 0 ? (
              <div className="mt-10 space-y-5">
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
              <p className="mt-10 text-body text-grey-500">{t("empty")}</p>
            )}

            <Link
              href="/chapters"
              className="mt-14 inline-block text-small font-medium text-navy-800 transition-colors hover:text-gold-600"
            >
              ← {t("backToChapters")}
            </Link>
          </div>
        </Container>
      </section>

      {/* Join — quiet closing band */}
      <section className="border-t border-grey-300 bg-grey-50 py-16 md:py-20">
        <Container>
          <div className="flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
            <h2 className="text-h4 font-semibold text-ink">
              {t("joinPrompt")}
            </h2>
            <ButtonLink href="/membership/apply" variant="primary">
              {t("joinCta")}
            </ButtonLink>
          </div>
        </Container>
      </section>
    </>
  );
}
