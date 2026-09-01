import { setRequestLocale, getTranslations } from "next-intl/server";
import { Container } from "@/components/ui/Container";
import { PageHero } from "@/components/ui/PageHero";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ApplyForm } from "@/components/forms/ApplyForm";
import { getMembershipTypes } from "@/services/membership";
import { getSiteSettings, settingString } from "@/services/settings";
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
  const t = await getTranslations({ locale, namespace: "apply" });
  return pageMetadata({
    locale,
    path: "/membership/apply",
    title: t("title"),
    description: t("standfirst"),
  });
}

function formatPrice(amount: number, locale: Locale): string {
  return new Intl.NumberFormat(locale === "zh" ? "zh-CN" : "en-AU", {
    maximumFractionDigits: 0,
  }).format(amount);
}

export default async function ApplyPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: rawLocale } = await params;
  setRequestLocale(rawLocale);
  const locale = rawLocale as Locale;
  const t = await getTranslations("apply");
  const tContact = await getTranslations("contact");
  const zh = locale === "zh";

  const [types, settings] = await Promise.all([
    getMembershipTypes().catch(() => []),
    getSiteSettings().catch(() => ({})),
  ]);
  const typeOptions = types.map((type) => ({
    code: type.code,
    label: loc(type, "name", locale),
  }));

  const validityNote = settingString(
    settings,
    "membership",
    zh ? "validity_note_zh" : "validity_note_en",
    t("feeValidity"),
  );
  const contactName = settingString(
    settings,
    "contact",
    "membership_contact_name",
    "",
  );
  const contactPhone = settingString(
    settings,
    "contact",
    "membership_contact_phone",
    "",
  );
  const contactEmail = settingString(settings, "contact", "email", "");
  const contactAddress = settingString(
    settings,
    "contact",
    zh ? "address_zh" : "address_en",
    "",
  );

  const steps = [1, 2, 3, 4] as const;

  return (
    <>
      <PageHero
        title={t("title")}
        standfirst={t("standfirst")}
      />

      {/* Process — four steps */}
      <section className="bg-white py-14 md:py-16">
        <Container>
          <h2 className="sr-only">{t("processTitle")}</h2>
          <ol className="grid gap-8 sm:grid-cols-2 md:grid-cols-4">
            {steps.map((n) => (
              <li key={n} className="border-t-2 border-grey-100 pt-4">
                <p className="text-caption font-semibold uppercase tracking-[0.06em] text-sea-800">
                  {String(n).padStart(2, "0")}
                </p>
                <h3 className="mt-2 text-body font-semibold text-ink">
                  {t(`step${n}Title`)}
                </h3>
                <p className="mt-1.5 text-small leading-relaxed text-grey-600">
                  {t(`step${n}Text`)}
                </p>
              </li>
            ))}
          </ol>
        </Container>
      </section>

      {/* Fee table */}
      {types.length > 0 && (
        <section className="bg-grey-50 py-16 md:py-20">
          <Container>
            <SectionHeading title={t("feesTitle")} />
            <div className="mt-8 overflow-x-auto rounded-xl border border-grey-100 bg-white">
              <table className="w-full min-w-[36rem] text-left text-small">
                <thead>
                  <tr className="border-b border-grey-100 bg-sea-50 text-sea-800">
                    <th scope="col" className="px-6 py-4 font-semibold">
                      {t("feeType")}
                    </th>
                    <th scope="col" className="px-6 py-4 font-semibold">
                      {t("feeThreshold")}
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-4 text-right font-semibold"
                    >
                      {t("feeAnnual")}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {types.map((type) => (
                    <tr
                      key={type.id}
                      className="border-b border-grey-100 last:border-b-0"
                    >
                      <th
                        scope="row"
                        className="px-6 py-4 font-medium text-ink"
                      >
                        {loc(type, "name", locale)}
                      </th>
                      <td className="px-6 py-4 text-grey-600">
                        {loc(type, "turnover", locale) ||
                          loc(type, "description", locale)}
                      </td>
                      <td className="px-6 py-4 text-right font-semibold tabular-nums text-sea-800">
                        {type.price_annual != null
                          ? formatPrice(Number(type.price_annual), locale)
                          : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-4 text-caption text-grey-500">{validityNote}</p>
          </Container>
        </section>
      )}

      {/* Application form */}
      <section className="bg-white py-16 md:py-20">
        <Container>
          <div className="grid gap-12 md:grid-cols-12 md:gap-16">
            <div className="md:col-span-7">
              <SectionHeading title={t("formTitle")} />
              <div className="mt-10">
                <ApplyForm types={typeOptions} />
              </div>
            </div>
            <aside className="md:col-span-4 md:col-start-9">
              {/* Payment — process description only. No account details or
                  payment buttons until methods are formally confirmed. */}
              <div className="card-surface p-6">
                <h2 className="text-body font-semibold text-ink">
                  {t("paymentTitle")}
                </h2>
                <p className="mt-2.5 text-small leading-relaxed text-grey-600">
                  {t("paymentText")}
                </p>
              </div>
              {(contactName || contactEmail) && (
                <div className="card-surface mt-6 p-6">
                  <h2 className="text-body font-semibold text-ink">
                    {t("contactTitle")}
                  </h2>
                  <ul className="mt-3 space-y-2 text-small text-grey-600">
                    {contactName && (
                      <li className="font-medium text-ink">
                        {contactName}
                        {contactPhone && (
                          <span className="ml-2 font-normal text-grey-600">
                            {contactPhone}
                          </span>
                        )}
                      </li>
                    )}
                    {contactEmail && (
                      <li>
                        <a
                          href={`mailto:${contactEmail}`}
                          className="text-sea-800 transition-colors hover:text-sea-600"
                        >
                          {contactEmail}
                        </a>
                      </li>
                    )}
                    {contactAddress && (
                      <li>
                        <span className="block text-caption text-grey-500">
                          {tContact("address")}
                        </span>
                        {contactAddress}
                      </li>
                    )}
                  </ul>
                </div>
              )}
            </aside>
          </div>
        </Container>
      </section>
    </>
  );
}
