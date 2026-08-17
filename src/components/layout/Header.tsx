"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { cn } from "@/lib/utils/cn";

const NAV_ITEMS = [
  { key: "home", href: "/" },
  { key: "about", href: "/about" },
  { key: "chapters", href: "/chapters" },
  { key: "news", href: "/news" },
  { key: "events", href: "/events" },
  { key: "membership", href: "/membership" },
  { key: "contact", href: "/contact" },
] as const;

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function Header() {
  const t = useTranslations("nav");
  const locale = useLocale();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  // Close the mobile sheet on navigation and lock scroll while it is open.
  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    document.documentElement.style.overflow = open ? "hidden" : "";
    return () => {
      document.documentElement.style.overflow = "";
    };
  }, [open]);

  const otherLocale = locale === "zh" ? "en" : "zh";

  return (
    <header className="sticky top-0 z-50 bg-navy-900 text-white">
      <div className="mx-auto flex h-16 w-full max-w-[69.5rem] items-center justify-between px-6 md:px-10">
        {/* Wordmark lockup */}
        <Link href="/" className="flex items-center gap-3" aria-label="OBCI">
          <span className="flex h-9 w-9 items-center justify-center bg-gold-500 text-[0.8125rem] font-semibold tracking-tight text-navy-950">
            OB
          </span>
          <span className="leading-tight">
            <span className="block text-[0.9375rem] font-semibold tracking-wide">
              {locale === "zh" ? "大洋洲工商协会" : "Oceania Business Association"}
            </span>
            <span className="hidden text-[0.6875rem] tracking-[0.08em] text-white/60 sm:block">
              {locale === "zh" ? "OCEANIA BUSINESS ASSOCIATION" : "大洋洲工商协会 · OBCI"}
            </span>
          </span>
        </Link>

        {/* Desktop navigation */}
        <nav className="hidden items-center lg:flex" aria-label="Main">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.key}
              href={item.href}
              className={cn(
                "relative flex h-16 items-center px-3.5 text-small transition-colors duration-200",
                isActive(pathname, item.href)
                  ? "text-white"
                  : "text-white/70 hover:text-gold-400",
              )}
            >
              {t(item.key)}
              {isActive(pathname, item.href) && (
                <span className="absolute inset-x-3.5 bottom-0 h-0.5 bg-gold-500" />
              )}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-4 lg:flex">
          <Link
            href={pathname}
            locale={otherLocale}
            className="text-small text-white/70 transition-colors duration-200 hover:text-gold-400"
          >
            {t("switchLocale")}
          </Link>
          <Link
            href="/membership/apply"
            className="inline-flex h-9 items-center rounded-md bg-gold-500 px-4 text-small font-medium text-navy-950 transition-colors duration-200 hover:bg-gold-600"
          >
            {t("join")}
          </Link>
        </div>

        {/* Mobile controls */}
        <div className="flex items-center gap-5 lg:hidden">
          <Link
            href={pathname}
            locale={otherLocale}
            className="text-small text-white/70"
          >
            {t("switchLocale")}
          </Link>
          <button
            type="button"
            onClick={() => setOpen(!open)}
            aria-expanded={open}
            aria-label={open ? t("close") : t("menu")}
            className="flex h-10 w-10 items-center justify-center"
          >
            <span className="relative block h-3 w-5">
              <span
                className={cn(
                  "absolute left-0 top-0 h-px w-5 bg-white transition-transform duration-300",
                  open && "top-1.5 rotate-45",
                )}
              />
              <span
                className={cn(
                  "absolute left-0 top-3 h-px w-5 bg-white transition-transform duration-300",
                  open && "top-1.5 -rotate-45",
                )}
              />
            </span>
          </button>
        </div>
      </div>

      {/* Mobile sheet */}
      <div
        className={cn(
          "fixed inset-0 top-16 z-40 flex-col justify-between bg-navy-900 px-6 pb-10 pt-8 lg:hidden",
          open ? "flex" : "hidden",
        )}
      >
        <nav aria-label="Mobile">
          <ul>
            {NAV_ITEMS.map((item) => (
              <li key={item.key} className="border-b border-white/10">
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center justify-between py-4 text-h4 font-medium",
                    isActive(pathname, item.href) ? "text-gold-400" : "text-white",
                  )}
                >
                  {t(item.key)}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <Link
          href="/membership/apply"
          className="inline-flex h-12 items-center justify-center rounded-md bg-gold-500 text-small font-medium text-navy-950"
        >
          {t("join")}
        </Link>
      </div>
    </header>
  );
}
