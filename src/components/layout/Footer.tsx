import { getLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { getSiteSettings, settingString } from "@/services/settings";
import {
  contactFieldState,
  contactHasPendingFields,
  type ContactField,
} from "@/lib/review";
import { isInternalReview, isPreviewDeployment } from "@/lib/preview";

export async function Footer() {
  const t = await getTranslations("footer");
  const tNav = await getTranslations("nav");
  const tCommon = await getTranslations("common");
  const locale = await getLocale();
  const settings = await getSiteSettings().catch(() => ({}));
  const zh = locale === "zh";

  // Contact details are published only once the chamber confirms them
  // (site_settings.contact.confirmed_fields). The local internal-review
  // build shows unconfirmed values with a "pending" marker; production and
  // the public preview never render them.
  const contact = (field: ContactField, key: string) => {
    const state = contactFieldState(settings, field);
    const value =
      state === "hidden" ? "" : settingString(settings, "contact", key, "");
    return { value, pending: state === "pending" && value !== "" };
  };
  const address = contact("address", zh ? "address_zh" : "address_en");
  const phone = contact("phone", "phone");
  const email = contact("email", "email");
  const wechat = contact("wechat", zh ? "wechat_zh" : "wechat_en");
  const rows = [address, phone, email, wechat].filter((row) => row.value);
  const pending = contactHasPendingFields(settings, [
    "address",
    "phone",
    "email",
    "wechat",
  ]);

  const pendingBadge = (
    <span className="ml-2 rounded-full border border-white/30 px-2 py-0.5 text-[0.6875rem] font-medium uppercase tracking-[0.06em] text-white/70">
      {tCommon("pendingConfirmation")}
    </span>
  );

  return (
    <footer className="bg-sea-900 text-white">
      <div className="mx-auto w-full max-w-[69.5rem] px-6 py-16 md:px-10 md:py-20">
        <div className="grid gap-12 md:grid-cols-12">
          <div className="md:col-span-5">
            {/* Interim text wordmark — replaced once the official OBAI logo
               artwork is supplied. */}
            <p className="flex items-baseline gap-3">
              <span className="text-h3 font-semibold tracking-[0.02em] text-white">
                OBAI
              </span>
              <span className="border-l border-white/25 pl-3 text-small text-white/80">
                {tCommon("orgName")}
              </span>
            </p>
            <p
              lang={zh ? "en" : "zh"}
              className="mt-4 text-caption tracking-[0.06em] text-white/50"
            >
              {zh
                ? "OCEANIA BUSINESS ASSOCIATION INCORPORATED"
                : "大洋洲工商协会"}
            </p>
            <p className="mt-5 max-w-[26rem] text-small leading-relaxed text-white/70">
              {t("mission")}
            </p>
          </div>

          <nav className="md:col-span-2" aria-label={t("navigation")}>
            <p className="text-caption font-medium uppercase tracking-[0.06em] text-sea-200">
              {t("navigation")}
            </p>
            <ul className="mt-5 space-y-3 text-small text-white/70">
              <li><Link className="transition-colors hover:text-white" href="/about">{tNav("about")}</Link></li>
              <li><Link className="transition-colors hover:text-white" href="/chapters">{tNav("chapters")}</Link></li>
              <li><Link className="transition-colors hover:text-white" href="/news">{tNav("news")}</Link></li>
              <li><Link className="transition-colors hover:text-white" href="/events">{tNav("events")}</Link></li>
            </ul>
          </nav>

          <nav className="md:col-span-2" aria-label={t("membership")}>
            <p className="text-caption font-medium uppercase tracking-[0.06em] text-sea-200">
              {t("membership")}
            </p>
            <ul className="mt-5 space-y-3 text-small text-white/70">
              <li><Link className="transition-colors hover:text-white" href="/membership">{t("benefits")}</Link></li>
              <li><Link className="transition-colors hover:text-white" href="/membership/apply">{t("apply")}</Link></li>
              <li><Link className="transition-colors hover:text-white" href="/contact">{tNav("contact")}</Link></li>
            </ul>
          </nav>

          <div className="md:col-span-3">
            <p className="text-caption font-medium uppercase tracking-[0.06em] text-sea-200">
              {t("contact")}
            </p>
            <ul className="mt-5 space-y-3 text-small text-white/70">
              <li>{t("locality")}</li>
              {address.value && (
                <li>
                  {address.value}
                  {address.pending && pendingBadge}
                </li>
              )}
              {phone.value && (
                <li>
                  {phone.value}
                  {phone.pending && pendingBadge}
                </li>
              )}
              {email.value && (
                <li>
                  <a
                    className="transition-colors hover:text-white"
                    href={`mailto:${email.value}`}
                  >
                    {email.value}
                  </a>
                  {email.pending && pendingBadge}
                </li>
              )}
              {wechat.value && (
                <li>
                  {wechat.value}
                  {wechat.pending && pendingBadge}
                </li>
              )}
              {rows.length === 0 && pending && isPreviewDeployment() && (
                <li className="text-caption text-white/50">
                  {t("contactPending")}
                </li>
              )}
            </ul>
            {pending && isInternalReview() && (
              <p className="mt-4 text-caption leading-relaxed text-white/50">
                {tCommon("internalReviewOnly")}
              </p>
            )}
          </div>
        </div>

        <div className="mt-16 flex flex-col gap-4 border-t border-white/10 pt-8 text-caption text-white/50 md:flex-row md:items-center md:justify-between">
          <p>{t("copyright", { year: new Date().getFullYear() })}</p>
          <nav className="flex gap-6" aria-label={t("legalLabel")}>
            <Link className="transition-colors hover:text-white" href="/terms">{t("terms")}</Link>
            <Link className="transition-colors hover:text-white" href="/privacy">{t("privacy")}</Link>
            <Link className="transition-colors hover:text-white" href="/accessibility">{t("accessibility")}</Link>
          </nav>
        </div>
        {isPreviewDeployment() && (
          <p className="mt-6 text-caption text-white/50">
            {tCommon("previewBanner")}
          </p>
        )}
      </div>
    </footer>
  );
}
