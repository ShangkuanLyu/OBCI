"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { createClient } from "@/lib/supabase/client";
import { isPreviewDeployment } from "@/lib/preview";

type Status = "idle" | "pending" | "success" | "error" | "preview";

export function NewsletterForm() {
  const t = useTranslations("newsletter");
  const tCommon = useTranslations("common");
  const locale = useLocale();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // The isolated preview deployment never writes to production.
    if (isPreviewDeployment()) {
      setStatus("preview");
      return;
    }
    setStatus("pending");
    const supabase = createClient();
    const { error } = await supabase.from("newsletter_subscribers").insert({
      email: email.trim().toLowerCase(),
      locale: locale === "en" ? "en" : "zh",
      source: "website",
    });
    // Unique violation = already subscribed; treat as success.
    if (error && error.code !== "23505") {
      setStatus("error");
      return;
    }
    setStatus("success");
  }

  if (status === "success") {
    return (
      <p className="text-small text-grey-600" role="status">
        {t("success")}
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-md">
      <div className="flex gap-3">
        <label className="sr-only" htmlFor="newsletter-email">
          {t("placeholder")}
        </label>
        <input
          id="newsletter-email"
          name="email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={t("placeholder")}
          className="h-11 flex-1 rounded-md border border-grey-300 bg-white px-4 text-small transition-colors focus:border-sea-600"
        />
        <button
          type="submit"
          disabled={status === "pending"}
          className="inline-flex h-11 items-center rounded-md bg-sea-800 px-5 text-small font-medium text-white transition-colors duration-200 hover:bg-sea-700 disabled:opacity-50"
        >
          {t("subscribe")}
        </button>
      </div>
      <p aria-live="polite" className="mt-2">
        {status === "error" && (
          <span className="text-small text-red-700">{t("error")}</span>
        )}
        {status === "preview" && (
          <span className="text-small text-grey-600">
            {tCommon("previewDisabled")}
          </span>
        )}
      </p>
    </form>
  );
}
