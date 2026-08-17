import { setRequestLocale, getTranslations } from "next-intl/server";
import { Container } from "@/components/ui/Container";
import { PageHero } from "@/components/ui/PageHero";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ButtonLink } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { getMembershipTypes } from "@/services/membership";
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
  const t = await getTranslations({ locale, namespace: "membership" });
  return { title: t("title"), description: t("standfirst") };
}

function formatPrice(amount: number, currency: string, locale: Locale): string {
  return new Intl.NumberFormat(locale === "zh" ? "zh-CN" : "en-AU", {
    style: "currency",
    currency: currency || "AUD",
    maximumFractionDigits: 0,
  }).format(amount);
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

  const types = await getMembershipTypes().catch(() => []);

  const steps = [
    { num: "01", title: t("step1Title"), text: t("step1Text") },
    { num: "02", title: t("step2Title"), text: t("step2Text") },
    { num: "03", title: t("step3Title"), text: t("step3Text") },
  ];

  return (
    <>
      <PageHero
        label="Membership"
        title={t("title")}
        standfirst={t("standfirst")}
      />

      {/* Membership types — typographic 3-column grid */}
      <section className="bg-white py-16 md:py-24">
        <Container>
          <SectionHeading label={t("typesLabel")} title={t("typesTitle")} />

          <div className="mt-14 grid gap-x-10 gap-y-12 md:grid-cols-3">
            {types.map((type, i) => {
              const primary =
                locale === "zh" ? type.benefits_zh : type.benefits_en;
              const fallback =
                locale === "zh" ? type.benefits_en : type.benefits_zh;
              const benefits =
                primary && primary.length > 0 ? primary : (fallback ?? []);
              const description = loc(type, "description", locale);

              return (
                <Reveal key={type.id} delay={(i % 3) * 80}>
                  <div className="flex h-full flex-col border-t border-grey-300 pt-6">
                    <h3 className="text-h4 font-semibold text-ink">
                      {loc(type, "name", locale)}
                    </h3>
                    {description && (
                      <p className="mt-3 text-small leading-relaxed text-grey-600">
                        {description}
                      </p>
                    )}
                    {benefits.length > 0 && (
                      <ul className="mt-6 space-y-2.5">
                        {benefits.map((benefit) => (
                          <li
                            key={benefit}
                            className="border-l-2 border-gold-500 pl-3 text-small leading-relaxed text-grey-600"
                          >
                            {benefit}
                          </li>
                        ))}
                      </ul>
                    )}
                    <p className="mt-8 border-t border-grey-300 pt-5">
                      {type.price_annual !== null ? (
                        <>
                          <span className="text-h4 font-semibold text-navy-900">
                            {formatPrice(
                              type.price_annual,
                              type.currency,
                              locale,
                            )}
                          </span>{" "}
                          <span className="text-caption text-grey-500">
                            {t("perYear")}
                          </span>
                        </>
                      ) : (
                        <span className="text-caption text-grey-500">
                          {t("feeContact")}
                        </span>
                      )}
                    </p>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </Container>
      </section>

      {/* Application process — grey band, numbered steps */}
      <section className="bg-grey-50 py-16 md:py-24">
        <Container>
          <SectionHeading label={t("processLabel")} title={t("processTitle")} />

          <div className="mt-14 grid gap-x-10 gap-y-10 md:grid-cols-3">
            {steps.map((step, i) => (
              <Reveal key={step.num} delay={i * 80}>
                <div className="border-t border-grey-300 pt-6">
                  <p className="text-caption font-medium tracking-[0.08em] text-gold-600">
                    {step.num}
                  </p>
                  <h3 className="mt-3 text-h4 font-semibold text-ink">
                    {step.title}
                  </h3>
                  <p className="mt-3 max-w-[24rem] text-small leading-relaxed text-grey-600">
                    {step.text}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      {/* Apply — navy call-to-action band */}
      <section className="bg-navy-900 py-24 text-white md:py-32">
        <Container className="text-center">
          <div className="flex justify-center">
            <ButtonLink href="/membership/apply" variant="primary">
              {t("applyCta")}
            </ButtonLink>
          </div>
          <p className="mt-6 text-caption text-white/60">{t("applyNote")}</p>
        </Container>
      </section>
    </>
  );
}
