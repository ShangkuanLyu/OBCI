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
      {/* Chapter header — light band */}
      <section className="border-b border-grey-100 bg-royal-50">
        <Container className="pb-12 pt-12 md:pb-16 md:pt-16">
          <p className="flex items-center gap-3 text-caption font-semibold uppercase tracking-[0.08em] text-royal-600">
            <span className="h-0.5 w-6 rounded-full bg-rose-500" aria-hidden />
            {t("title")}
          </p>
          <h1 className="mt-4 max-w-[20em] text-[2rem] font-semibold leading-[1.12] tracking-[-0.02em] text-ink md:text-h1">
            {loc(chapter, "name", locale)}
          </h1>
          {paragraphs[0] && (
            <p className="mt-5 max-w-[36rem] text-body-lg text-grey-600">
              {paragraphs[0]}
            </p>
          )}
        </Container>
      </section>

      <section className="bg-white py-16 md:py-24">
        <Container>
          <div className="max-w-[42rem]">
            {/* Secretary-general & contact — card-surface definition panel */}
            {(chapter.secretary_general || chapter.contact_email) && (
              <div className="card-surface divide-y divide-grey-100">
                {chapter.secretary_general && (
                  <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 px-6 py-5">
                    <span className="text-caption font-semibold uppercase tracking-[0.08em] text-royal-600">
                      {t("secretaryGeneral")}
                    </span>
                    <span className="text-body font-medium text-ink">
                      {chapter.secretary_general}
                    </span>
                  </div>
                )}
                {chapter.contact_email && (
                  <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 px-6 py-5">
                    <span className="text-caption font-semibold uppercase tracking-[0.08em] text-royal-600">
                      {tCommon("contactUs")}
                    </span>
                    <a
                      href={`mailto:${chapter.contact_email}`}
                      className="text-body font-medium text-royal-600 transition-colors hover:text-royal-500"
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
              className="mt-14 inline-block text-small font-medium text-royal-600 transition-colors hover:text-royal-500"
            >
              ← {t("backToChapters")}
            </Link>
          </div>
        </Container>
      </section>

      {/* Join — closing CTA band */}
      <section className="bg-white pb-16 md:pb-24">
        <Container>
          <div className="rounded-2xl bg-royal-600 px-8 py-10 text-center text-white md:px-14">
            <h2 className="mx-auto max-w-[24em] text-h3 font-semibold tracking-[-0.01em]">
              {t("joinPrompt")}
            </h2>
            <div className="mt-7 flex justify-center">
              <ButtonLink href="/membership/apply" variant="accent">
                {t("joinCta")}
              </ButtonLink>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
