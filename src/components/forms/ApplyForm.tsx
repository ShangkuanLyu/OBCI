"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";

type Status = "idle" | "pending" | "success" | "partial" | "error" | "preview";

const ALLOWED_DOC_TYPES = new Set([
  "application/pdf",
  "image/jpeg",
  "image/png",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);
const MAX_DOC_BYTES = 20 * 1024 * 1024;

/** Consent snapshot version — matches the date stamp on the published
 *  terms/privacy pages. Bump when the legal texts are formally revised. */
const POLICY_VERSION = "2026-08";

/**
 * Company-introduction limit, applied to the CONTENT of the text rather
 * than the page locale (mirrored 1:1 in the v2 RPC):
 * text containing CJK ideographs (一-鿿) → max 500 characters;
 * otherwise → max 500 words.
 */
const CJK_RE = /[一-鿿]/;
export function introMetrics(text: string): {
  count: number;
  limit: number;
  unit: "chars" | "words";
  ok: boolean;
} {
  const trimmed = text.trim();
  if (CJK_RE.test(trimmed)) {
    const count = [...trimmed].length;
    return { count, limit: 500, unit: "chars", ok: count <= 500 };
  }
  const count = trimmed === "" ? 0 : trimmed.split(/\s+/).length;
  return { count, limit: 500, unit: "words", ok: count <= 500 };
}

const inputClass =
  "h-11 w-full rounded-md border border-grey-300 bg-white px-4 text-small transition-colors focus:border-sea-600";
const labelClass = "mb-2 block text-small font-medium text-ink";
const sectionClass =
  "md:col-span-2 mt-4 border-t border-grey-100 pt-6 text-caption font-semibold uppercase tracking-[0.06em] text-sea-800 first:mt-0 first:border-t-0 first:pt-0";

export function ApplyForm({
  types,
}: {
  types: { code: string; label: string }[];
}) {
  const t = useTranslations("apply");
  const tCommon = useTranslations("common");
  const locale = useLocale();
  const [status, setStatus] = useState<Status>("idle");
  const [intro, setIntro] = useState("");
  const pending = status === "pending";
  const metrics = introMetrics(intro);
  const zh = locale === "zh";

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!metrics.ok) return;

    // Preview builds never submit: the design-review fixtures predate the
    // v2 RPC, and the isolated preview deployment must not write to the
    // production database (applications and uploads included).
    if (
      process.env.NEXT_PUBLIC_DESIGN_FIXTURES === "1" ||
      process.env.NEXT_PUBLIC_PREVIEW_DEPLOYMENT === "1"
    ) {
      setStatus("preview");
      return;
    }

    setStatus("pending");
    const form = new FormData(e.currentTarget);
    const field = (name: string) => String(form.get(name) ?? "").trim();

    const supabase = createClient();
    // v2 RPC (added by the application-form migration). Typed via `never`
    // cast until the generated types are refreshed post-migration.
    const { data, error } = await supabase.rpc(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      "submit_membership_application_v2" as any,
      {
        p_membership_type_code: field("membership_type_code"),
        p_first_name: field("first_name"),
        p_last_name: field("last_name"),
        p_email: field("email").toLowerCase(),
        p_mobile: field("mobile") || undefined,
        p_company_name: field("company_name"),
        p_company_address: field("company_address") || undefined,
        p_company_phone: field("company_phone") || undefined,
        p_fax: field("fax") || undefined,
        p_position: field("position") || undefined,
        p_company_intro: field("company_intro") || undefined,
        p_directory_consent: field("directory_consent") === "yes",
        p_agreed_terms: form.get("agreed_terms") === "on",
        p_agreed_marketing: form.get("agreed_marketing") === "on",
        p_policy_version: POLICY_VERSION,
        p_locale: locale === "en" ? "en" : "zh",
      },
    );
    if (error || !data) {
      setStatus("error");
      return;
    }
    const { application_id, access_token } = data as unknown as {
      application_id: number;
      access_token: string;
    };

    // Optional supporting documents → private bucket, linked via token RPC.
    const files = form
      .getAll("documents")
      .filter((f): f is File => f instanceof File && f.size > 0);
    let uploadFailed = false;
    for (const file of files.slice(0, 10)) {
      if (file.size > MAX_DOC_BYTES || !ALLOWED_DOC_TYPES.has(file.type)) {
        uploadFailed = true;
        continue;
      }
      const safeName = file.name.replace(/[^\w.\-一-鿿]/g, "_").slice(-100);
      const path = `applications/${application_id}/${crypto.randomUUID()}-${safeName}`;
      const { error: uploadError } = await supabase.storage
        .from("member-documents")
        .upload(path, file, { contentType: file.type });
      if (uploadError) {
        uploadFailed = true;
        continue;
      }
      const { error: attachError } = await supabase.rpc(
        "attach_application_document",
        {
          p_application_id: application_id,
          p_access_token: access_token,
          p_storage_path: path,
          p_file_name: file.name.slice(0, 200),
          p_mime_type: file.type,
          p_size_bytes: file.size,
        },
      );
      if (attachError) uploadFailed = true;
    }
    setStatus(uploadFailed ? "partial" : "success");
  }

  if (status === "success" || status === "partial") {
    return (
      <div className="rounded-lg bg-sea-50 p-7 md:p-8" role="status">
        <h3 className="text-h3 font-semibold tracking-[-0.01em] text-ink">
          {t("successTitle")}
        </h3>
        <p className="mt-4 text-body leading-relaxed text-grey-600">
          {t("successText")}
        </p>
        {status === "partial" && (
          <p className="mt-6 text-caption text-grey-500">{t("uploadError")}</p>
        )}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-6 md:grid-cols-2">
      <div className="md:col-span-2">
        <label htmlFor="apply-type" className={labelClass}>
          {t("type")}
        </label>
        <select
          id="apply-type"
          name="membership_type_code"
          required
          defaultValue=""
          className={inputClass}
        >
          <option value="" disabled>
            {t("type")}
          </option>
          {types.map((type) => (
            <option key={type.code} value={type.code}>
              {type.label}
            </option>
          ))}
        </select>
      </div>

      <p className={sectionClass}>{t("companySection")}</p>

      <div>
        <label htmlFor="apply-company" className={labelClass}>
          {t("companyName")}
        </label>
        <input
          id="apply-company"
          name="company_name"
          type="text"
          required
          autoComplete="organization"
          className={inputClass}
        />
      </div>
      <div>
        <label htmlFor="apply-company-phone" className={labelClass}>
          {t("companyPhone")}
        </label>
        <input
          id="apply-company-phone"
          name="company_phone"
          type="tel"
          className={inputClass}
        />
      </div>
      <div>
        <label htmlFor="apply-company-address" className={labelClass}>
          {t("companyAddress")}
        </label>
        <input
          id="apply-company-address"
          name="company_address"
          type="text"
          autoComplete="street-address"
          className={inputClass}
        />
      </div>
      <div>
        <label htmlFor="apply-fax" className={labelClass}>
          {t("fax")}{" "}
          <span className="font-normal text-grey-500">({t("optional")})</span>
        </label>
        <input id="apply-fax" name="fax" type="tel" className={inputClass} />
      </div>

      <p className={sectionClass}>{t("contactSection")}</p>

      <div>
        <label htmlFor="apply-last-name" className={labelClass}>
          {t("lastName")}
        </label>
        <input
          id="apply-last-name"
          name="last_name"
          type="text"
          required
          autoComplete="family-name"
          className={inputClass}
        />
      </div>
      <div>
        <label htmlFor="apply-first-name" className={labelClass}>
          {t("firstName")}
        </label>
        <input
          id="apply-first-name"
          name="first_name"
          type="text"
          required
          autoComplete="given-name"
          className={inputClass}
        />
      </div>
      <div>
        <label htmlFor="apply-position" className={labelClass}>
          {t("position")}
        </label>
        <input
          id="apply-position"
          name="position"
          type="text"
          autoComplete="organization-title"
          className={inputClass}
        />
      </div>
      <div>
        <label htmlFor="apply-email" className={labelClass}>
          {t("email")}
        </label>
        <input
          id="apply-email"
          name="email"
          type="email"
          required
          autoComplete="email"
          className={inputClass}
        />
      </div>
      <div>
        <label htmlFor="apply-mobile" className={labelClass}>
          {t("mobile")}
        </label>
        <input
          id="apply-mobile"
          name="mobile"
          type="tel"
          autoComplete="tel"
          className={inputClass}
        />
      </div>

      <p className={sectionClass}>{t("introSection")}</p>

      <div className="md:col-span-2">
        <label htmlFor="apply-intro" className={labelClass}>
          {t("intro")}
        </label>
        <textarea
          id="apply-intro"
          name="company_intro"
          rows={6}
          value={intro}
          onChange={(e) => setIntro(e.target.value)}
          aria-describedby="apply-intro-count"
          className="w-full rounded-md border border-grey-300 bg-white px-4 py-3 text-small transition-colors focus:border-sea-600"
        />
        <div className="mt-2 flex flex-wrap items-baseline justify-between gap-2">
          <p className="text-caption text-grey-500">{t("introHint")}</p>
          <p
            id="apply-intro-count"
            className={`text-caption tabular-nums ${metrics.ok ? "text-grey-500" : "font-medium text-red-700"}`}
          >
            {metrics.count} / {metrics.limit}{" "}
            {intro.trim() === ""
              ? zh
                ? "字"
                : "words"
              : metrics.unit === "chars"
                ? zh
                  ? "字"
                  : "characters"
                : zh
                  ? "词"
                  : "words"}
          </p>
        </div>
        {!metrics.ok && (
          <p className="mt-1 text-small text-red-700" role="alert">
            {t("errorIntroTooLong")}
          </p>
        )}
      </div>

      <p className={sectionClass}>{t("consentSection")}</p>

      <fieldset className="md:col-span-2">
        <legend className={labelClass}>{t("directoryTitle")}</legend>
        <div className="space-y-2.5">
          <label className="flex items-start gap-3 text-small text-ink">
            <input
              type="radio"
              name="directory_consent"
              value="yes"
              required
              className="mt-1 h-4 w-4 accent-sea-800"
            />
            {t("directoryYes")}
          </label>
          <label className="flex items-start gap-3 text-small text-ink">
            <input
              type="radio"
              name="directory_consent"
              value="no"
              className="mt-1 h-4 w-4 accent-sea-800"
            />
            {t("directoryNo")}
          </label>
        </div>
      </fieldset>

      <div className="md:col-span-2 space-y-2.5">
        <label className="flex items-start gap-3 text-small text-ink">
          <input
            type="checkbox"
            name="agreed_terms"
            required
            className="mt-1 h-4 w-4 accent-sea-800"
          />
          <span>
            {t("agreeTerms")}
            {zh ? "（" : " ("}
            <Link
              href="/terms"
              className="text-sea-800 underline underline-offset-2 hover:text-sea-600"
              target="_blank"
            >
              {t("termsLink")}
            </Link>
            {" · "}
            <Link
              href="/privacy"
              className="text-sea-800 underline underline-offset-2 hover:text-sea-600"
              target="_blank"
            >
              {t("privacyLink")}
            </Link>
            {zh ? "）" : ")"}
          </span>
        </label>
        <label className="flex items-start gap-3 text-small text-ink">
          <input
            type="checkbox"
            name="agreed_marketing"
            className="mt-1 h-4 w-4 accent-sea-800"
          />
          {t("agreeMarketing")}
        </label>
      </div>

      <div className="md:col-span-2">
        <label htmlFor="apply-documents" className={labelClass}>
          {t("documents")}
        </label>
        <input
          id="apply-documents"
          name="documents"
          type="file"
          multiple
          accept=".pdf,.doc,.docx,image/jpeg,image/png"
          className="block w-full text-small text-grey-600 file:mr-3 file:h-9 file:rounded-md file:border file:border-grey-300 file:bg-white file:px-4 file:text-small file:font-medium file:text-sea-800 file:transition-colors hover:file:bg-grey-50"
        />
        <p className="mt-2 text-caption text-grey-500">{t("documentsHint")}</p>
      </div>

      <div className="md:col-span-2 mt-2">
        <Button type="submit" disabled={pending} className="w-full md:w-auto">
          {pending ? tCommon("submitting") : t("submit")}
        </Button>
        <div aria-live="polite">
          {status === "error" && (
            <p className="mt-4 text-small text-red-700">{t("errorGeneric")}</p>
          )}
          {status === "preview" && (
            <p className="mt-4 text-small text-grey-600">
              {t("previewNotice")}
            </p>
          )}
        </div>
      </div>
    </form>
  );
}
