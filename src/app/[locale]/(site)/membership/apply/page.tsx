import { Fragment } from "react";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Container } from "@/components/ui/Container";
import { PageHero } from "@/components/ui/PageHero";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ButtonLink } from "@/components/ui/Button";
import { ApplyForm } from "@/components/forms/ApplyForm";
import { getMembershipTypes } from "@/services/membership";
import {
  bankDetails,
  getSiteSettings,
  settingString,
} from "@/services/settings";
import { contactFieldState, legalStatus, type ContactField } from "@/lib/review";
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
  const t = await getTranslations({ locale, namespace: "apply" });
  return pageMetadata({
    locale,
    path: "/membership/apply",
    title: t("title"),
    description: t("standfirst"),
  });
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
  const tCommon = await getTranslations("common");
  const tMembership = await getTranslations("membership");
  const zh = locale === "zh";

  const [types, settings] = await Promise.all([
    getMembershipTypes().catch(() => []),
    getSiteSettings().catch(() => ({})),
  ]);
  const typeOptions = types.map((type) => ({
    code: type.code,
    label: loc(type, "name", locale),
    price_annual: type.price_annual != null ? Number(type.price_annual) : null,
    currency: type.currency,
  }));

  // Applications are accepted only against published policies (terms and
  // privacy carry a version stamp in site_settings.legal, and the RPC
  // enforces the same gate). Without them there is nothing lawful to
  // consent to, so the unavailable card replaces the form.
  const legal = legalStatus(settings);

  const validityNote = settingString(
    settings,
    "membership",
    zh ? "validity_note_zh" : "validity_note_en",
    t("feeValidity"),
  );

  // Manual fee payment (owner decision D7, no online payment): the council
  // bank account from site_settings.bank is published as plain text, not
  // gated by chamber confirmation. Without a complete account the card
  // keeps the generic "instructions by email" sentence.
  const bank = bankDetails(settings);
  const bankRows = bank
    ? [
        [t("bankAccountName"), bank.account_name],
        [t("bankName"), bank.bank_name],
        [t("bankBsb"), bank.bsb],
        [t("bankAccountNumber"), bank.account_number],
        [t("bankReference"), t("bankReferenceValue")],
      ]
    : [];

  // Contact details are published only where the CMS lists the field in
  // site_settings.contact.confirmed_fields; anything else is not rendered.
  const contactField = (field: ContactField, key: string) =>
    contactFieldState(settings, field) === "hidden"
      ? ""
      : settingString(settings, "contact", key, "");
  const contactName = contactField(
    "membership_contact",
    "membership_contact_name",
  );
  const contactPhone = contactField(
    "membership_contact",
    "membership_contact_phone",
  );
  const contactEmail = contactField("email", "email");
  const contactAddress = contactField(
    "address",
    zh ? "address_zh" : "address_en",
  );
  const hasContact = Boolean(contactName || contactEmail || contactAddress);

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
            <SectionHeading title={t("feesTitle")} standfirst={t("feeNote")} />
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
                          ? `${formatFeeAmount(Number(type.price_annual), type.currency)}${tMembership("perYear")}`
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
              {!legal.approved && (
                <div className="card-surface p-7 md:p-8">
                  <h2 className="text-h4 font-semibold text-ink">
                    {t("legalPendingTitle")}
                  </h2>
                  <p className="mt-3 text-body leading-relaxed text-grey-600">
                    {t("legalPendingText")}
                  </p>
                  <ButtonLink
                    href="/contact"
                    variant="secondary"
                    className="mt-6"
                  >
                    {tCommon("contactUs")}
                  </ButtonLink>
                </div>
              )}
              {legal.approved && (
                <div>
                  <SectionHeading title={t("formTitle")} />
                  <div className="mt-10">
                    <ApplyForm
                      types={typeOptions}
                      policyVersion={legal.policyVersion}
                      constitutionHref={legal.constitutionHref}
                    />
                  </div>
                </div>
              )}
            </div>
            <aside className="md:col-span-4 md:col-start-9">
              {/* Payment — three manual methods with the council's bank
                  account as plain text. No payment buttons and no card
                  fields: nothing on this site collects payment data. */}
              <div className="card-surface p-6">
                <h2 className="text-body font-semibold text-ink">
                  {t("paymentTitle")}
                </h2>
                {bank ? (
                  <>
                    <p className="mt-2.5 text-small leading-relaxed text-grey-600">
                      {t("paymentIntro")}
                    </p>
                    <div className="mt-5 space-y-5 border-t border-grey-100 pt-5">
                      <div>
                        <h3 className="text-small font-semibold text-ink">
                          {t("paymentBankTransfer")}
                        </h3>
                        <dl className="mt-2 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-small">
                          {bankRows.map(([label, value]) => (
                            <Fragment key={label}>
                              <dt className="text-grey-500">{label}</dt>
                              <dd className="tabular-nums text-ink">{value}</dd>
                            </Fragment>
                          ))}
                        </dl>
                      </div>
                      <div>
                        <h3 className="text-small font-semibold text-ink">
                          {t("paymentCheque")}
                        </h3>
                        <p className="mt-2 text-small leading-relaxed text-grey-600">
                          {t("chequePayable", { name: bank.account_name })}{" "}
                          {t.rich("chequeDeliver", {
                            link: (chunks) => (
                              <Link
                                href="/contact"
                                className="text-sea-800 underline underline-offset-2 hover:text-sea-600"
                              >
                                {chunks}
                              </Link>
                            ),
                          })}
                        </p>
                      </div>
                      <div>
                        <h3 className="text-small font-semibold text-ink">
                          {t("paymentCreditCard")}
                        </h3>
                        <p className="mt-2 text-small leading-relaxed text-grey-600">
                          {bank.cards &&
                            `${t("creditCardCards", { cards: bank.cards })} `}
                          {t("creditCardText")}
                        </p>
                      </div>
                    </div>
                  </>
                ) : (
                  <p className="mt-2.5 text-small leading-relaxed text-grey-600">
                    {t("paymentText")}
                  </p>
                )}
              </div>
              {hasContact && (
                <div className="card-surface mt-6 p-6">
                  <h2 className="text-body font-semibold text-ink">
                    {t("contactTitle")}
                  </h2>
                  {hasContact && (
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
                  )}
                </div>
              )}
            </aside>
          </div>
        </Container>
      </section>
    </>
  );
}
