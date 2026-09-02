import { setRequestLocale, getTranslations } from "next-intl/server";
import { Container } from "@/components/ui/Container";
import { PageHero } from "@/components/ui/PageHero";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ButtonLink } from "@/components/ui/Button";
import { ReviewNote } from "@/components/ui/ReviewNote";
import { ApplyForm } from "@/components/forms/ApplyForm";
import { getMembershipTypes } from "@/services/membership";
import { getSiteSettings, settingString } from "@/services/settings";
import {
  contactFieldState,
  contactHasPendingFields,
  legalStatus,
  type ContactField,
} from "@/lib/review";
import {
  isInternalReview,
  isPreviewDeployment,
  submissionsDisabled,
} from "@/lib/preview";
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

const PENDING_CONTACT_FIELDS: ContactField[] = [
  "address",
  "email",
  "membership_contact",
];

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
  }));

  // Applications are accepted only against approved legal texts. Without
  // them there is nothing lawful to consent to, so production shows the
  // pending card instead; review builds still show the (disabled) form.
  const legal = legalStatus(settings);
  const disabled = submissionsDisabled();
  const showForm = legal.approved || disabled;

  const validityNote = settingString(
    settings,
    "membership",
    zh ? "validity_note_zh" : "validity_note_en",
    t("feeValidity"),
  );

  // Contact details are published only once the chamber confirms them
  // (site_settings.contact.confirmed_fields); the local internal-review
  // build shows unconfirmed values with a "pending" marker.
  const pendingFields = new Set<ContactField>();
  const contactField = (field: ContactField, key: string) => {
    const state = contactFieldState(settings, field);
    if (state === "hidden") return "";
    const value = settingString(settings, "contact", key, "");
    if (value && state === "pending") pendingFields.add(field);
    return value;
  };
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
  const contactPending =
    isPreviewDeployment() &&
    contactHasPendingFields(settings, PENDING_CONTACT_FIELDS);
  const pendingBadge = (
    <span className="ml-2 inline-block rounded-full border border-grey-300 px-2 py-0.5 align-middle text-[0.6875rem] font-medium uppercase tracking-[0.06em] text-grey-500">
      {tCommon("pendingConfirmation")}
    </span>
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
                  <ReviewNote className="mt-6">
                    {t("legalPendingReviewNote")}
                  </ReviewNote>
                </div>
              )}
              {showForm && (
                <div className={legal.approved ? undefined : "mt-12"}>
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
              {(hasContact || contactPending) && (
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
                          {pendingFields.has("membership_contact") && pendingBadge}
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
                          {pendingFields.has("email") && pendingBadge}
                        </li>
                      )}
                      {contactAddress && (
                        <li>
                          <span className="block text-caption text-grey-500">
                            {tContact("address")}
                          </span>
                          {contactAddress}
                          {pendingFields.has("address") && pendingBadge}
                        </li>
                      )}
                    </ul>
                  )}
                  {contactPending && (
                    <ReviewNote className="mt-4">
                      {tContact("detailsPending")}
                      {isInternalReview() && ` ${tCommon("internalReviewOnly")}`}
                    </ReviewNote>
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
