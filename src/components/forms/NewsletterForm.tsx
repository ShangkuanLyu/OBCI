"use client";

import { useEffect, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { createClient } from "@/lib/supabase/client";

type Status = "idle" | "pending" | "success" | "error";


export function NewsletterForm() {
  const t = useTranslations("newsletter");
  const locale = useLocale();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const successRef = useRef<HTMLParagraphElement>(null);
  const done = status === "success";

  useEffect(() => {
    if (done) successRef.current?.focus();
  }, [done]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
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

  return (
    <div className="max-w-md">
      {/* Mounted before the submission so the confirmation is announced. */}
      <div role="status" aria-live="polite">
        {done && (
          <p
            ref={successRef}
            tabIndex={-1}
            className="text-small text-grey-600"
          >
            {t("success")}
          </p>
        )}
      </div>

      {!done && (
        <>
          <form
            method="post"
            action=""
            noValidate={false}
            onSubmit={handleSubmit}
          >
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
                className="h-11 flex-1 rounded-md border border-grey-300 bg-white px-4 text-small transition-colors focus:border-sea-600 disabled:opacity-50"
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
            </p>
          </form>
        </>
      )}
    </div>
  );
}
