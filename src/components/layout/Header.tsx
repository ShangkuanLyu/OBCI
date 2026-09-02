"use client";

import { useEffect, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { cn } from "@/lib/utils/cn";
import { isPreviewDeployment } from "@/lib/preview";
import { PreviewBanner } from "@/components/layout/PreviewBanner";

/* Navigation order fixed by the redesign brief:
   Home · About OBAI · Industry Chapters · Member Services ·
   News & Insights · Events · Contact Us, plus the Join OBAI CTA. */
const NAV_ITEMS = [
  { key: "home", href: "/" },
  { key: "about", href: "/about" },
  { key: "chapters", href: "/chapters" },
  { key: "membership", href: "/membership" },
  { key: "news", href: "/news" },
  { key: "events", href: "/events" },
  { key: "contact", href: "/contact" },
] as const;

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

/**
 * Text wordmark. Interim brand treatment: the association has not yet
 * supplied an official OBAI logo, so the header carries a typographic
 * lockup only — deliberately not presented as a designed logo.
 */
function Wordmark({ locale }: { locale: string }) {
  return (
    <span className="flex items-baseline gap-3">
      <span className="text-[1.35rem] font-semibold tracking-[0.02em] text-sea-800">
        OBAI
      </span>
      <span className="hidden border-l border-grey-300 pl-3 text-[0.8125rem] leading-snug text-grey-600 min-[420px]:block lg:hidden min-[1200px]:block">
        {locale === "zh" ? (
          "大洋洲工商协会"
        ) : (
          <>
            Oceania Business
            <br />
            Association
          </>
        )}
      </span>
    </span>
  );
}

export function Header() {
  const t = useTranslations("nav");
  const tCommon = useTranslations("common");
  const locale = useLocale();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [sheetTop, setSheetTop] = useState(64);
  const headerRef = useRef<HTMLElement>(null);
  const sheetRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const preview = isPreviewDeployment();

  // Lock scroll while the mobile sheet is open, and anchor the sheet to
  // the bottom of the sticky header block (banner + bar) rather than a
  // hard-coded height.
  useEffect(() => {
    document.documentElement.style.overflow = open ? "hidden" : "";
    if (open && headerRef.current) {
      setSheetTop(Math.round(headerRef.current.getBoundingClientRect().bottom));
    }
    return () => {
      document.documentElement.style.overflow = "";
    };
  }, [open]);

  // Mobile sheet: Escape closes; Tab is trapped inside while open.
  useEffect(() => {
    if (!open) return;
    const sheet = sheetRef.current;
    const focusables = () =>
      Array.from(
        sheet?.querySelectorAll<HTMLElement>(
          "a[href], button:not([disabled])",
        ) ?? [],
      );
    focusables()[0]?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        toggleRef.current?.focus();
        return;
      }
      if (event.key !== "Tab") return;
      const items = focusables();
      if (items.length === 0) return;
      const first = items[0];
      const last = items[items.length - 1];
      const active = document.activeElement;
      if (event.shiftKey && active === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open]);

  const otherLocale = locale === "zh" ? "en" : "zh";

  return (
    <>
      <header
        ref={headerRef}
        className="sticky top-0 z-50 border-b border-grey-100 bg-white/95 backdrop-blur"
      >
        {preview && (
          <PreviewBanner
            badge={tCommon("previewBadge")}
            text={tCommon("previewBanner")}
          />
        )}
        <div className="mx-auto flex h-16 w-full max-w-[69.5rem] items-center justify-between px-6 md:px-10">
          <Link
            href="/"
            className="flex items-center"
            aria-label={locale === "zh" ? "大洋洲工商协会 OBAI 首页" : "OBAI home"}
          >
            <Wordmark locale={locale} />
          </Link>

          {/* Desktop navigation */}
          <nav className="hidden items-center lg:flex" aria-label={t("mainLabel")}>
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.key}
                href={item.href}
                aria-current={isActive(pathname, item.href) ? "page" : undefined}
                className={cn(
                  "relative flex h-16 items-center whitespace-nowrap px-2.5 text-small transition-colors duration-200 xl:px-3",
                  isActive(pathname, item.href)
                    ? "font-medium text-sea-800"
                    : "text-grey-600 hover:text-sea-600",
                )}
              >
                {t(item.key)}
                {isActive(pathname, item.href) && (
                  <span
                    className="absolute inset-x-2.5 bottom-0 h-0.5 rounded-full bg-sea-800 xl:inset-x-3"
                    aria-hidden
                  />
                )}
              </Link>
            ))}
          </nav>

          <div className="hidden items-center gap-4 lg:flex">
            <Link
              href={pathname}
              locale={otherLocale}
              className="text-small text-grey-500 transition-colors duration-200 hover:text-sea-600"
            >
              {t("switchLocale")}
            </Link>
            <Link
              href="/membership/apply"
              className="inline-flex h-9 items-center rounded-full bg-sea-800 px-5 text-small font-medium text-white transition-colors duration-200 hover:bg-sea-700"
            >
              {t("join")}
            </Link>
          </div>

          {/* Mobile controls */}
          <div className="flex items-center gap-5 lg:hidden">
            <Link
              href={pathname}
              locale={otherLocale}
              onClick={() => setOpen(false)}
              className="text-small text-grey-500"
            >
              {t("switchLocale")}
            </Link>
            <button
              ref={toggleRef}
              type="button"
              onClick={() => setOpen(!open)}
              aria-expanded={open}
              aria-controls="mobile-menu"
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
      </header>

      {/* Mobile sheet — rendered outside <header> because its backdrop-blur
         creates a containing block that would collapse this fixed panel. */}
      <div
        id="mobile-menu"
        ref={sheetRef}
        role="dialog"
        aria-modal="true"
        aria-label={t("menu")}
        style={{ top: sheetTop }}
        className={cn(
          "fixed inset-x-0 bottom-0 z-40 flex-col justify-between overflow-y-auto bg-white px-6 pb-10 pt-6 lg:hidden",
          open ? "flex" : "hidden",
        )}
      >
        <nav aria-label={t("mobileLabel")}>
          <ul>
            {NAV_ITEMS.map((item) => (
              <li key={item.key} className="border-b border-grey-100">
                <Link
                  href={item.href}
                  onClick={() => setOpen(false)}
                  aria-current={
                    isActive(pathname, item.href) ? "page" : undefined
                  }
                  className={cn(
                    "flex items-center justify-between py-4 text-h4 font-medium",
                    isActive(pathname, item.href) ? "text-sea-800" : "text-ink",
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
          onClick={() => setOpen(false)}
          className="inline-flex h-12 items-center justify-center rounded-full bg-sea-800 text-small font-medium text-white"
        >
          {t("join")}
        </Link>
      </div>
    </>
  );
}
