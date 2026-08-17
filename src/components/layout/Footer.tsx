import { getLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { getSiteSettings, settingString } from "@/services/settings";

export async function Footer() {
  const t = await getTranslations("footer");
  const tNav = await getTranslations("nav");
  const locale = await getLocale();
  const settings = await getSiteSettings().catch(() => ({}));

  const address = settingString(
    settings,
    "contact",
    locale === "zh" ? "address_zh" : "address_en",
    "Melbourne VIC, Australia",
  );
  const phone = settingString(settings, "contact", "phone", "");
  const email = settingString(settings, "contact", "email", "");

  return (
    <footer className="bg-navy-950 text-white">
      <div className="mx-auto w-full max-w-[69.5rem] px-6 py-16 md:px-10 md:py-20">
        <div className="grid gap-12 md:grid-cols-12">
          <div className="md:col-span-5">
            <p className="text-body font-semibold">
              {locale === "zh"
                ? "大洋洲工商协会"
                : "Oceania Business Association"}
            </p>
            <p className="mt-1 text-caption tracking-[0.08em] text-white/50">
              {locale === "zh"
                ? "OCEANIA BUSINESS ASSOCIATION INCORPORATED"
                : "大洋洲工商协会 · OBCI"}
            </p>
            <p className="mt-6 max-w-[26rem] text-small leading-relaxed text-white/70">
              {t("mission")}
            </p>
          </div>

          <nav className="md:col-span-2" aria-label={t("navigation")}>
            <p className="text-caption font-medium uppercase tracking-[0.08em] text-gold-400">
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
            <p className="text-caption font-medium uppercase tracking-[0.08em] text-gold-400">
              {t("membership")}
            </p>
            <ul className="mt-5 space-y-3 text-small text-white/70">
              <li><Link className="transition-colors hover:text-white" href="/membership">{t("benefits")}</Link></li>
              <li><Link className="transition-colors hover:text-white" href="/membership/apply">{t("apply")}</Link></li>
              <li><Link className="transition-colors hover:text-white" href="/projects">{tNav("projects")}</Link></li>
              <li><Link className="transition-colors hover:text-white" href="/contact">{tNav("contact")}</Link></li>
            </ul>
          </nav>

          <div className="md:col-span-3">
            <p className="text-caption font-medium uppercase tracking-[0.08em] text-gold-400">
              {t("contact")}
            </p>
            <ul className="mt-5 space-y-3 text-small text-white/70">
              <li>{address}</li>
              {phone && <li>{phone}</li>}
              {email && (
                <li>
                  <a className="transition-colors hover:text-white" href={`mailto:${email}`}>
                    {email}
                  </a>
                </li>
              )}
            </ul>
          </div>
        </div>

        <div className="mt-16 flex flex-col gap-4 border-t border-white/10 pt-8 text-caption text-white/50 md:flex-row md:items-center md:justify-between">
          <p>{t("copyright", { year: new Date().getFullYear() })}</p>
          <nav className="flex gap-6" aria-label="Legal">
            <Link className="transition-colors hover:text-white" href="/terms">{t("terms")}</Link>
            <Link className="transition-colors hover:text-white" href="/privacy">{t("privacy")}</Link>
            <Link className="transition-colors hover:text-white" href="/accessibility">{t("accessibility")}</Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}
