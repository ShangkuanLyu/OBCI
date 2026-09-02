import { getLocale, getTranslations } from "next-intl/server";
import { Container } from "@/components/ui/Container";

/**
 * Standard interior-page hero: light sea band, gold-ruled eyebrow, ink
 * title. When no label is given, the eyebrow falls back to the
 * cross-language organisation name (the site's identity device).
 */
export async function PageHero({
  label,
  title,
  standfirst,
}: {
  label?: string;
  title: string;
  standfirst?: string;
}) {
  const [locale, tCommon] = await Promise.all([
    getLocale(),
    getTranslations("common"),
  ]);
  const eyebrow = label ?? tCommon("orgNameEn");
  // orgNameEn is deliberately the other language of the pair.
  const eyebrowLang = label ? undefined : locale === "zh" ? "en" : "zh";
  return (
    <section className="border-b border-grey-100 bg-sea-50">
      <Container className="pb-12 pt-12 md:pb-16 md:pt-16">
        <p className="flex items-center gap-3 text-caption font-semibold uppercase tracking-[0.06em] text-sea-800">
          <span className="h-0.5 w-6 rounded-full bg-gold-600" aria-hidden />
          <span lang={eyebrowLang}>{eyebrow}</span>
        </p>
        <h1 className="mt-4 max-w-[20em] text-[2rem] font-semibold leading-[1.2] tracking-[-0.02em] text-ink md:text-h1">
          {title}
        </h1>
        {standfirst && (
          <p className="mt-5 max-w-[36rem] text-body-lg text-grey-600">
            {standfirst}
          </p>
        )}
      </Container>
    </section>
  );
}
