"use client";

import { useState, useSyncExternalStore } from "react";
import { useTranslations } from "next-intl";

const noopSubscribe = () => () => {};

/**
 * Article share actions — baseline implementation: copy link, plus the
 * native share sheet where the browser offers one. Additional channels
 * (WeChat QR, LinkedIn, X) are pending the chamber's channel decision.
 */
export function ShareActions() {
  const t = useTranslations("news");
  const [copied, setCopied] = useState(false);
  // Environment capability — read once, SSR-safe (false on the server).
  const canShare = useSyncExternalStore(
    noopSubscribe,
    () => typeof navigator.share === "function",
    () => false,
  );

  const buttonClass =
    "inline-flex h-9 items-center rounded-full border border-grey-300 px-4 text-small font-medium text-grey-600 transition-colors hover:border-sea-600 hover:text-sea-800";

  async function copy() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard unavailable — leave the button state unchanged.
    }
  }

  async function nativeShare() {
    try {
      await navigator.share({ title: document.title, url: window.location.href });
    } catch {
      // Dismissed or unsupported — nothing to do.
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <span className="text-caption font-semibold uppercase tracking-[0.06em] text-grey-500">
        {t("shareTitle")}
      </span>
      <button type="button" onClick={copy} className={buttonClass}>
        {copied ? t("shareCopied") : t("shareCopy")}
      </button>
      {canShare && (
        <button type="button" onClick={nativeShare} className={buttonClass}>
          {t("shareNative")}
        </button>
      )}
      <span aria-live="polite" className="sr-only">
        {copied ? t("shareCopied") : ""}
      </span>
    </div>
  );
}
