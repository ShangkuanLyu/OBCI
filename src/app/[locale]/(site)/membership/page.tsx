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

      {/* Membership types — card grid with colored top bars */}
      <section className="bg-white py-16 md:py-24">
        <Container>
          <SectionHeading label={t("typesLabel")} title={t("typesTitle")} />

          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {types.map((type, i) => {
              const primary =
                locale === "zh" ? type.benefits_zh : type.benefits_en;
              const fallback =
                locale === "zh" ? type.benefits_en : type.benefits_zh;
              const benefits =
                primary && primary.length > 0 ? primary : (fallback ?? []);
              const description = loc(type, "description", locale);
              const bar = ["bg-royal-600", "bg-rose-500", "bg-royal-500"][
                i % 3
              ];

              return (
                <Reveal key={type.id} delay={(i % 3) * 80} className="h-full">
                  <div className="card-surface flex h-full flex-col overflow-hidden">
                    <span className={`block h-1.5 ${bar}`} aria-hidden />
                    <div className="flex flex-1 flex-col p-7">
                      <div className="pb-8">
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
                                className="flex gap-2.5 text-small leading-relaxed text-grey-600"
                              >
                                <span
                                  className="font-semibold text-royal-600"
                                  aria-hidden
                                >
                                  ✓
                                </span>
                                {benefit}
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                      <p className="mt-auto border-t border-grey-100 pt-5">
                        {type.price_annual !== null ? (
                          <>
                            <span className="text-h4 font-semibold text-ink">
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
                  </div>
                </Reveal>
              );
            })}
          </div>
        </Container>
      </section>

      {/* Application process — grey band, numbered step cards */}
      <section className="bg-grey-50 py-16 md:py-24">
        <Container>
          <SectionHeading label={t("processLabel")} title={t("processTitle")} />

          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {steps.map((step, i) => (
              <Reveal key={step.num} delay={i * 80} className="h-full">
                <div className="card-surface h-full p-7">
                  <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-royal-50 text-small font-semibold text-royal-600">
                    {step.num}
                  </span>
                  <h3 className="mt-5 text-h4 font-semibold text-ink">
                    {step.title}
                  </h3>
                  <p className="mt-3 text-small leading-relaxed text-grey-600">
                    {step.text}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      {/* Apply — royal call-to-action band */}
      <section className="bg-white py-16 md:py-24">
        <Container>
          <div className="rounded-2xl bg-royal-600 px-8 py-10 text-center text-white md:px-14">
            <div className="flex justify-center">
              <ButtonLink href="/membership/apply" variant="accent">
                {t("applyCta")}
              </ButtonLink>
            </div>
            <p className="mt-5 text-caption text-white/70">{t("applyNote")}</p>
          </div>
        </Container>
      </section>
    </>
  );
}
