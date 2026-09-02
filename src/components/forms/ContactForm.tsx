"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { useLocale, useTranslations } from "next-intl";
import { createClient } from "@/lib/supabase/client";
import { submissionsDisabled } from "@/lib/preview";
import { Button } from "@/components/ui/Button";
import { PreviewFormNotice } from "@/components/forms/PreviewFormNotice";

type Status = "idle" | "pending" | "success" | "error";

const NOTICE_ID = "contact-preview-notice";

const noopSubscribe = () => () => {};
/** `?topic=` from the current URL; "" on the server so the form is part of
 *  the prerendered HTML and hydrates unchanged. */
const readTopic = () =>
  new URLSearchParams(window.location.search).get("topic") ?? "";

const inputClass =
  "h-11 w-full rounded-md border border-grey-300 bg-white px-4 text-small transition-colors focus:border-sea-600";

const labelClass = "mb-2 block text-small font-medium text-ink";

/**
 * Public enquiry form (client-side insert, RLS-guarded). A `?topic=` query
 * parameter — used by the industry-matching and article-enquiry CTAs —
 * prefills the subject line. The parameter is read after mount (not via
 * useSearchParams) so the form is part of the prerendered HTML and its
 * disabled state is visible without JavaScript.
 */
export function ContactForm() {
  const t = useTranslations("contact");
  const tCommon = useTranslations("common");
  const locale = useLocale();
  const disabled = submissionsDisabled();
  const [status, setStatus] = useState<Status>("idle");
  const successRef = useRef<HTMLHeadingElement>(null);
  const pending = status === "pending";
  const done = status === "success";

  const topic = useSyncExternalStore(noopSubscribe, readTopic, () => "");
  const defaultSubject = topic
    ? `${t("topicPrefix")}${locale === "zh" ? "：" : ": "}${topic}`.slice(0, 300)
    : "";

  useEffect(() => {
    if (done) successRef.current?.focus();
  }, [done]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (disabled) return;
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

  return (
    <div>
      {/* Mounted before the submission so the confirmation is announced. */}
      <div role="status" aria-live="polite">
        {done && (
          <div className="border-t-2 border-gold-600 pt-6">
            <h3
              ref={successRef}
              tabIndex={-1}
              className="text-h4 font-semibold text-ink"
            >
              {t("successTitle")}
            </h3>
            <p className="mt-3 max-w-[42rem] text-body leading-relaxed text-grey-600">
              {t("successText")}
            </p>
          </div>
        )}
      </div>

      {!done && (
        <>
          {disabled && (
            <div className="mb-8">
              <PreviewFormNotice id={NOTICE_ID} />
            </div>
          )}
          <form
            method="post"
            action=""
            noValidate={false}
            onSubmit={handleSubmit}
            aria-describedby={disabled ? NOTICE_ID : undefined}
            className="space-y-6"
          >
            <fieldset
              disabled={disabled}
              className="contents m-0 min-w-0 border-0 p-0"
            >
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
                  {/* Keyed on the prefill so the untouched field adopts the
                      topic once the client reads the URL after hydration. */}
                  <input
                    key={defaultSubject}
                    id="contact-subject"
                    name="subject"
                    type="text"
                    maxLength={300}
                    defaultValue={defaultSubject}
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
                  className="w-full rounded-md border border-grey-300 bg-white px-4 py-3 text-small leading-relaxed transition-colors focus:border-sea-600"
                />
              </div>

              <div className="flex items-center gap-4">
                <Button type="submit" disabled={pending || disabled}>
                  {disabled
                    ? tCommon("previewSubmitDisabled")
                    : pending
                      ? tCommon("submitting")
                      : tCommon("submit")}
                </Button>
                <span aria-live="polite">
                  {status === "error" && (
                    <span className="text-small text-red-700">
                      {t("errorGeneric")}
                    </span>
                  )}
                </span>
              </div>
            </fieldset>
          </form>
        </>
      )}
    </div>
  );
}
