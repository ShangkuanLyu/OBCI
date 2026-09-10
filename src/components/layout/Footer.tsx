import Image from "next/image";
import { getLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { assetPath } from "@/lib/utils/asset";
import { getSiteSettings, settingString } from "@/services/settings";
import { contactFieldState, type ContactField } from "@/lib/review";

export async function Footer() {
  const t = await getTranslations("footer");
  const tNav = await getTranslations("nav");
  const tCommon = await getTranslations("common");
  const locale = await getLocale();
  const settings = await getSiteSettings().catch(() => ({}));
  const zh = locale === "zh";

  // Contact details are published only where the CMS lists the field in
  // site_settings.contact.confirmed_fields; anything else is not rendered.
  const contact = (field: ContactField, key: string) => {
    const value =
      contactFieldState(settings, field) === "hidden"
        ? ""
        : settingString(settings, "contact", key, "");
    return { value };
  };
  const address = contact("address", zh ? "address_zh" : "address_en");
  const phone = contact("phone", "phone");
  const email = contact("email", "email");
  const wechat = contact("wechat", zh ? "wechat_zh" : "wechat_en");

  return (
    <footer className="bg-sea-900 text-white">
      <div className="mx-auto w-full max-w-[69.5rem] px-6 py-16 md:px-10 md:py-20">
        <div className="grid gap-12 md:grid-cols-12">
          <div className="md:col-span-5">
            {/* The lockup is dark ink on transparent, so on the navy footer
               it sits on a small white panel. */}
            <p className="flex items-center gap-4">
              <span className="inline-flex shrink-0 items-center rounded-lg bg-white px-3 py-2">
                <Image
                  src={assetPath("/brand/logo-lockup.png")}
                  alt={tCommon("orgName")}
                  width={66}
                  height={36}
                  className="h-9 w-auto"
                />
              </span>
              <span className="text-small font-medium leading-snug text-white">
                {tCommon("orgNameFull")}
              </span>
            </p>
            {/* Legal caption: incorporated name and registration number. */}
            <p className="mt-4 text-caption tracking-[0.02em] text-white/50">
              {tCommon("legalName")} · {tCommon("registrationNo")}
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
                </li>
              )}
              {phone.value && (
                <li>
                  {phone.value}
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
                </li>
              )}
              {wechat.value && (
                <li>
                  {wechat.value}
                </li>
              )}
            </ul>
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
      </div>
    </footer>
  );
}
