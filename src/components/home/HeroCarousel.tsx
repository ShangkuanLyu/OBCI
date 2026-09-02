"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils/cn";
import { mediaUrl } from "@/lib/utils/l10n";
import type { BannerData } from "@/lib/fixtures/design-review";

const AUTOPLAY_MS = 7000;
const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";
const TITLE_CLASS =
  "mt-5 max-w-[16em] text-[2rem] font-semibold leading-[1.2] tracking-[-0.02em] md:text-[2.9rem] md:leading-[1.16]";

function subscribeReducedMotion(onChange: () => void) {
  const query = window.matchMedia(REDUCED_MOTION_QUERY);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

/**
 * Homepage banner carousel. Accessibility contract:
 * manual prev/next/dot controls, an explicit pause/play toggle, arrow-key
 * navigation, no autoplay under prefers-reduced-motion (or while hovered,
 * focused or the tab is hidden), and no layout shift — slides are stacked
 * in one grid cell so the band height never changes between slides.
 * With a single banner it renders as a static hero without controls.
 */
export function HeroCarousel({ banners }: { banners: BannerData[] }) {
  const t = useTranslations("home");
  const tCommon = useTranslations("common");
  const locale = useLocale();
  const zh = locale === "zh";
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const hoverRef = useRef(false);
  const regionRef = useRef<HTMLElement>(null);
  // SSR-safe media-query read; autoplay never starts under reduced motion.
  const reducedMotion = useSyncExternalStore(
    subscribeReducedMotion,
    () => window.matchMedia(REDUCED_MOTION_QUERY).matches,
    () => true,
  );

  const count = banners.length;
  const multiple = count > 1;

  const step = useCallback(
    (delta: number) => {
      setIndex((current) => (current + delta + count) % count);
    },
    [count],
  );

  useEffect(() => {
    if (!multiple || paused || reducedMotion) return;
    const timer = window.setInterval(() => {
      if (document.hidden || hoverRef.current) return;
      if (regionRef.current?.contains(document.activeElement)) return;
      step(1);
    }, AUTOPLAY_MS);
    return () => window.clearInterval(timer);
  }, [multiple, paused, reducedMotion, step]);

  const onKeyDown = (event: React.KeyboardEvent) => {
    if (!multiple) return;
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      step(-1);
    } else if (event.key === "ArrowRight") {
      event.preventDefault();
      step(1);
    }
  };

  if (count === 0) return null;

  return (
    <section
      ref={regionRef}
      aria-roledescription={multiple ? "carousel" : undefined}
      aria-label={zh ? "首页横幅" : "Homepage banners"}
      className="relative isolate overflow-hidden bg-sea-900 text-white"
      onMouseEnter={() => (hoverRef.current = true)}
      onMouseLeave={() => (hoverRef.current = false)}
      onKeyDown={onKeyDown}
    >
      {/* Quiet institutional backdrop: deep-sea gradient, no artwork. */}
      <div
        aria-hidden
        className="absolute inset-0 bg-[linear-gradient(115deg,var(--color-sea-950)_0%,var(--color-sea-900)_45%,var(--color-sea-800)_100%)]"
      />
      <div
        aria-hidden
        className="absolute inset-x-0 bottom-0 h-px bg-white/10"
      />

      <div className="relative mx-auto grid w-full max-w-[69.5rem] px-6 md:px-10">
        {banners.map((banner, i) => {
          const active = i === index;
          const image = banner.image_path ? mediaUrl(banner.image_path) : null;
          return (
            <div
              key={banner.key || i}
              aria-hidden={active ? undefined : true}
              className={cn(
                "col-start-1 row-start-1 grid items-center gap-10 pb-20 pt-16 md:grid-cols-12 md:pb-24 md:pt-24",
                "motion-safe:transition-opacity motion-safe:duration-500",
                active
                  ? "opacity-100"
                  : "pointer-events-none select-none opacity-0",
              )}
            >
              <div className={image ? "md:col-span-7" : "md:col-span-9"}>
                <p className="flex items-center gap-3 text-caption font-semibold uppercase tracking-[0.06em] text-sea-200">
                  <span
                    className="h-0.5 w-6 rounded-full bg-gold-500"
                    aria-hidden
                  />
                  <span lang={zh ? "en" : "zh"}>{tCommon("orgNameEn")}</span>
                </p>
                {/* One <h1> per page: only the first slide's title is the
                    page heading; later slides carry the same styling. */}
                {i === 0 ? (
                  <h1 className={TITLE_CLASS}>
                    {zh ? banner.title_zh : banner.title_en}
                  </h1>
                ) : (
                  <p className={TITLE_CLASS}>
                    {zh ? banner.title_zh : banner.title_en}
                  </p>
                )}
                <p className="mt-6 max-w-[36rem] text-body-lg leading-relaxed text-white/80">
                  {zh ? banner.text_zh : banner.text_en}
                </p>
                <div className="mt-9 flex flex-wrap gap-4">
                  <Link
                    href={banner.cta_href}
                    tabIndex={active ? undefined : -1}
                    className="inline-flex h-11 items-center justify-center rounded-full bg-white px-7 text-small font-medium text-sea-800 transition-colors duration-200 hover:bg-sea-100"
                  >
                    {zh ? banner.cta_label_zh : banner.cta_label_en}
                  </Link>
                  <Link
                    href="/about"
                    tabIndex={active ? undefined : -1}
                    className="inline-flex h-11 items-center justify-center rounded-full border border-white/40 px-7 text-small font-medium text-white transition-colors duration-200 hover:bg-white/10"
                  >
                    {t("heroSecondary")}
                  </Link>
                </div>
              </div>
              {image && (
                <div className="relative hidden aspect-[4/3] overflow-hidden rounded-2xl md:col-span-5 md:block">
                  <Image
                    src={image}
                    alt=""
                    fill
                    sizes="(min-width: 768px) 420px, 100vw"
                    className="object-cover"
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {multiple && (
        <div className="absolute inset-x-0 bottom-6">
          <div className="mx-auto flex w-full max-w-[69.5rem] items-center gap-4 px-6 md:px-10">
            <div className="flex items-center gap-2" role="group">
              {banners.map((banner, i) => (
                <button
                  key={banner.key || i}
                  type="button"
                  onClick={() => setIndex(i)}
                  aria-label={t("bannerGoTo", { index: i + 1 })}
                  aria-current={i === index ? "true" : undefined}
                  className={cn(
                    "h-2 rounded-full transition-all duration-300",
                    i === index
                      ? "w-6 bg-white"
                      : "w-2 bg-white/40 hover:bg-white/70",
                  )}
                />
              ))}
            </div>
            <div className="ml-auto flex items-center gap-2">
              <button
                type="button"
                onClick={() => setPaused(!paused)}
                aria-label={paused ? t("bannerPlay") : t("bannerPause")}
                className="flex h-8 w-8 items-center justify-center rounded-full border border-white/30 text-white/80 transition-colors hover:bg-white/10"
              >
                <span aria-hidden className="text-[0.7rem] leading-none">
                  {paused ? "▶" : "❚❚"}
                </span>
              </button>
              <button
                type="button"
                onClick={() => step(-1)}
                aria-label={t("bannerPrev")}
                className="flex h-8 w-8 items-center justify-center rounded-full border border-white/30 text-white/80 transition-colors hover:bg-white/10"
              >
                <span aria-hidden>←</span>
              </button>
              <button
                type="button"
                onClick={() => step(1)}
                aria-label={t("bannerNext")}
                className="flex h-8 w-8 items-center justify-center rounded-full border border-white/30 text-white/80 transition-colors hover:bg-white/10"
              >
                <span aria-hidden>→</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
