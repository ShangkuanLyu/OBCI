import { setRequestLocale, getTranslations } from "next-intl/server";
import { Container } from "@/components/ui/Container";
import { PageHero } from "@/components/ui/PageHero";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ButtonLink } from "@/components/ui/Button";
import { getMembershipTypes } from "@/services/membership";
import { getContentBlocks } from "@/services/content";
import { getServiceOfferings } from "@/services/abs";
import { loc } from "@/lib/utils/l10n";
import { formatFeeAmount } from "@/lib/utils/fee";
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
  const t = await getTranslations({ locale, namespace: "membership" });
  return pageMetadata({
    locale,
    path: "/membership",
    title: t("title"),
    description: t("standfirst"),
  });
}

export default async function MembershipPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: rawLocale } = await params;
  setRequestLocale(rawLocale);
  const locale = rawLocale as Locale;
  const t = await getTranslations("membership");
  const zh = locale === "zh";

  const [content, abs, types] = await Promise.all([
    getContentBlocks().catch(() => null),
    getServiceOfferings().catch(() => []),
    getMembershipTypes().catch(() => []),
  ]);
  const pick = (row: { text_zh: string; text_en: string }) =>
    zh ? row.text_zh || row.text_en : row.text_en || row.text_zh;

  return (
    <>
      <PageHero
        title={t("title")}
        standfirst={t("standfirst")}
      />

      {/* Core member benefits — checklist, not cards */}
      {content && content.memberBenefits.length > 0 && (
        <section className="bg-white py-16 md:py-20">
          <Container>
            <SectionHeading
              label={t("benefitsLabel")}
              title={t("benefitsTitle")}
            />
            <ul className="mt-10 grid gap-x-12 gap-y-4 md:grid-cols-2">
              {content.memberBenefits.map((benefit, i) => (
                <li
                  key={i}
                  className="flex items-start gap-3 border-b border-grey-100 pb-4 text-body text-ink"
                >
                  <span
                    className="mt-[0.7em] h-0.5 w-4 shrink-0 rounded-full bg-gold-600"
                    aria-hidden
                  />
                  {pick(benefit)}
                </li>
              ))}
            </ul>
          </Container>
        </section>
      )}

      {/* ABS value-added services — layered service lists */}
      {abs.length > 0 && (
        <section className="bg-grey-50 py-16 md:py-20">
          <Container>
            <SectionHeading
              label={t("absLabel")}
              title={t("absTitle")}
              standfirst={t("absStandfirst")}
            />
            <div className="mt-10 space-y-0">
              {abs.map((service, i) => {
                const items =
                  zh && service.items_zh.length > 0
                    ? service.items_zh
                    : service.items_en.length > 0
                      ? service.items_en
                      : service.items_zh;
                return (
                  <article
                    key={service.id}
                    className="grid gap-6 border-t border-grey-100 py-10 first:border-t-0 first:pt-2 md:grid-cols-12 md:gap-14"
                  >
                    <div className="md:col-span-5">
                      <p className="text-h2 font-semibold tabular-nums text-grey-300">
                        {String(i + 1).padStart(2, "0")}
                      </p>
                      <h3 className="mt-3 text-h4 font-semibold text-ink">
                        {loc(service, "name", locale)}
                      </h3>
                      <p className="mt-3 text-body leading-relaxed text-grey-600">
                        {loc(service, "summary", locale)}
                      </p>
                    </div>
                    <div className="md:col-span-6 md:col-start-7">
                      <ul className="space-y-3">
                        {items.map((item, j) => (
                          <li
                            key={j}
                            className="flex items-start gap-3 text-body text-ink"
                          >
                            <span
                              className="mt-[0.7em] h-0.5 w-4 shrink-0 rounded-full bg-gold-600"
                              aria-hidden
                            />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </article>
                );
              })}
            </div>
          </Container>
        </section>
      )}

      {/* Five tiers at a glance — compact inline summary, table on Join page */}
      {types.length > 0 && (
        <section className="bg-white py-16 md:py-20">
          <Container>
            <SectionHeading
              label={t("tiersLabel")}
              title={t("tiersTitle")}
              standfirst={t("tiersText")}
            />
            <ul className="mt-10 divide-y divide-grey-100 border-y border-grey-100">
              {types.map((type) => (
                <li
                  key={type.id}
                  className="flex flex-wrap items-baseline justify-between gap-x-8 gap-y-1 py-4"
                >
                  <span className="flex items-baseline gap-3">
                    <span className="text-body font-semibold text-ink">
                      {loc(type, "name", locale)}
                    </span>
                    {loc(type, "turnover", locale) && (
                      <span className="text-small text-grey-500">
                        {loc(type, "turnover", locale)}
                      </span>
                    )}
                    {type.is_popular && (
                      <span className="rounded-full bg-gold-50 px-2.5 py-0.5 text-caption font-medium text-gold-600">
                        {t("popular")}
                      </span>
                    )}
                  </span>
                  <span className="text-body font-semibold tabular-nums text-sea-800">
                    {type.price_annual != null
                      ? `${formatFeeAmount(Number(type.price_annual), type.currency)}${t("perYear")}`
                      : t("feeContact")}
                  </span>
                </li>
              ))}
            </ul>
            <div className="mt-10 flex flex-wrap items-center gap-5">
              <ButtonLink href="/membership/apply" variant="primary">
                {t("tiersCta")}
              </ButtonLink>
              <p className="text-caption text-grey-500">{t("applyNote")}</p>
            </div>
          </Container>
        </section>
      )}

      {/* Service-model note — quiet small print per the DOCX */}
      {content?.revenueNote && (
        <section className="border-t border-grey-100 bg-white pb-14">
          <Container>
            <p className="pt-8 text-caption leading-relaxed text-grey-500">
              {pick(content.revenueNote)}
            </p>
          </Container>
        </section>
      )}
    </>
  );
}
