"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";

type Status = "idle" | "pending" | "success" | "error";

const inputClass =
  "h-11 w-full rounded-md border border-grey-300 bg-white px-4 text-small outline-none transition-colors focus:border-royal-500";

const labelClass = "mb-2 block text-small font-medium text-ink";

export function ContactForm() {
  const t = useTranslations("contact");
  const tCommon = useTranslations("common");
  const locale = useLocale();
  const [status, setStatus] = useState<Status>("idle");
  const pending = status === "pending";

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("pending");
    const form = new FormData(e.currentTarget);
    const field = (name: string) => String(form.get(name) ?? "").trim();

    const supabase = createClient();
    const { error } = await supabase.from("contact_enquiries").insert({
      name: field("name"),
      email: field("email").toLowerCase(),
      phone: field("phone") || null,
      organisation_name: field("organisation_name") || null,
      subject: field("subject") || null,
      message: field("message"),
      locale: locale === "en" ? "en" : "zh",
    });
    setStatus(error ? "error" : "success");
  }

  if (status === "success") {
    return (
      <div className="border-t-2 border-rose-500 pt-6">
        <p className="text-h4 font-semibold text-ink">{t("successTitle")}</p>
        <p className="mt-3 max-w-[42rem] text-body leading-relaxed text-grey-600">
          {t("successText")}
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <label htmlFor="contact-name" className={labelClass}>
            {t("name")}
          </label>
          <input
            id="contact-name"
            name="name"
            type="text"
            required
            maxLength={200}
            autoComplete="name"
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="contact-email" className={labelClass}>
            {t("emailField")}
          </label>
          <input
            id="contact-email"
            name="email"
            type="email"
            required
            maxLength={320}
            autoComplete="email"
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="contact-phone" className={labelClass}>
            {t("phoneField")}
          </label>
          <input
            id="contact-phone"
            name="phone"
            type="tel"
            maxLength={50}
            autoComplete="tel"
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="contact-organisation" className={labelClass}>
            {t("organisation")}
          </label>
          <input
            id="contact-organisation"
            name="organisation_name"
            type="text"
            maxLength={300}
            autoComplete="organization"
            className={inputClass}
          />
        </div>
        <div className="md:col-span-2">
          <label htmlFor="contact-subject" className={labelClass}>
            {t("subject")}
          </label>
          <input
            id="contact-subject"
            name="subject"
            type="text"
            maxLength={300}
            className={inputClass}
          />
        </div>
      </div>

      <div>
        <label htmlFor="contact-message" className={labelClass}>
          {t("message")}
        </label>
        <textarea
          id="contact-message"
          name="message"
          required
          rows={6}
          maxLength={5000}
          className="w-full rounded-md border border-grey-300 bg-white px-4 py-3 text-small leading-relaxed outline-none transition-colors focus:border-royal-500"
        />
      </div>

      <div className="flex items-center gap-4">
        <Button type="submit" disabled={pending}>
          {pending ? tCommon("submitting") : tCommon("submit")}
        </Button>
        {status === "error" && (
          <p className="text-small text-red-700">{t("errorGeneric")}</p>
        )}
      </div>
    </form>
  );
}
