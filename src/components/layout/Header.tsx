"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { assetPath } from "@/lib/utils/asset";
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
    <header className="sticky top-0 z-50 border-b border-grey-100 bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-[69.5rem] items-center justify-between px-6 md:px-10">
        {/* Logo lockup */}
        <Link href="/" className="flex items-center gap-3" aria-label="OBCI">
          <Image
            src={assetPath("/logo-dark.png")}
            alt={locale === "zh" ? "大洋洲工商协会" : "Oceania Business Association"}
            width={1244}
            height={656}
            priority
            className="h-10 w-auto"
          />
          <span className="hidden border-l border-grey-300 pl-3 text-[0.8125rem] leading-snug text-grey-600 sm:block">
            {locale === "zh" ? (
              <>大洋洲工商协会</>
            ) : (
              <>Oceania Business<br />Association</>
            )}
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
                  ? "font-medium text-royal-600"
                  : "text-grey-600 hover:text-royal-600",
              )}
            >
              {t(item.key)}
              {isActive(pathname, item.href) && (
                <span className="absolute inset-x-3.5 bottom-0 h-0.5 rounded-full bg-royal-600" />
              )}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-4 lg:flex">
          <Link
            href={pathname}
            locale={otherLocale}
            className="text-small text-grey-500 transition-colors duration-200 hover:text-royal-600"
          >
            {t("switchLocale")}
          </Link>
          <Link
            href="/membership/apply"
            className="inline-flex h-9 items-center rounded-lg bg-rose-500 px-4 text-small font-medium text-white transition-colors duration-200 hover:bg-rose-600"
          >
            {t("join")}
          </Link>
        </div>

        {/* Mobile controls */}
        <div className="flex items-center gap-5 lg:hidden">
          <Link
            href={pathname}
            locale={otherLocale}
            className="text-small text-grey-500"
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
                  "absolute left-0 top-0 h-[1.5px] w-5 bg-ink transition-transform duration-300",
                  open && "top-1.5 rotate-45",
                )}
              />
              <span
                className={cn(
                  "absolute left-0 top-3 h-[1.5px] w-5 bg-ink transition-transform duration-300",
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
          "fixed inset-0 top-16 z-40 flex-col justify-between bg-white px-6 pb-10 pt-6 lg:hidden",
          open ? "flex" : "hidden",
        )}
      >
        <nav aria-label="Mobile">
          <ul>
            {NAV_ITEMS.map((item) => (
              <li key={item.key} className="border-b border-grey-100">
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center justify-between py-4 text-h4 font-medium",
                    isActive(pathname, item.href) ? "text-royal-600" : "text-ink",
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
          className="inline-flex h-12 items-center justify-center rounded-lg bg-rose-500 text-small font-medium text-white"
        >
          {t("join")}
        </Link>
      </div>
    </header>
  );
}
