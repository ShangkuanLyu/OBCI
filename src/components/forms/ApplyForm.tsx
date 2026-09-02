"use client";

import { useEffect, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/client";
import { submissionsDisabled } from "@/lib/preview";
import {
  EN_INTRO_MAX_CHARS,
  ZH_INTRO_MAX_CHARS,
  enIntroMetrics,
  zhIntroMetrics,
} from "@/lib/apply/intro-limits";
import { Button } from "@/components/ui/Button";
import { PreviewFormNotice } from "@/components/forms/PreviewFormNotice";

type Status = "idle" | "pending" | "success" | "partial" | "error";

type ErrorKey =
  | "errorGeneric"
  | "errorAgreeConstitution"
  | "errorAgreeTerms"
  | "errorIntroZhTooLong"
  | "errorIntroEnTooLong"
  | "errorIntroRequired"
  | "errorInvalidType"
  | "errorNameRequired"
  | "errorFormUnavailable";

/** Exception texts raised by submit_membership_application_v2 → message
 *  keys. Anything unrecognised falls back to the generic error. */
const RPC_ERRORS: ReadonlyArray<readonly [string, ErrorKey]> = [
  ["constitution not accepted", "errorAgreeConstitution"],
  ["terms not accepted", "errorAgreeTerms"],
  ["privacy not accepted", "errorAgreeTerms"],
  ["company intro zh too long", "errorIntroZhTooLong"],
  ["company intro en too long", "errorIntroEnTooLong"],
  ["company intro required", "errorIntroRequired"],
  ["invalid membership type", "errorInvalidType"],
  ["name required", "errorNameRequired"],
  // Server-side legal gate, and PostgREST's "could not find the function"
  // while the v2 migration is not applied.
  ["legal texts not approved", "errorFormUnavailable"],
  ["policy version mismatch", "errorFormUnavailable"],
  ["could not find the function", "errorFormUnavailable"],
];

function rpcErrorKey(message: string | undefined): ErrorKey {
  const text = (message ?? "").toLowerCase();
  return RPC_ERRORS.find(([needle]) => text.includes(needle))?.[1] ?? "errorGeneric";
}

const ALLOWED_DOC_TYPES = new Set([
  "application/pdf",
  "image/jpeg",
  "image/png",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);
const MAX_DOC_BYTES = 20 * 1024 * 1024;

const NOTICE_ID = "apply-preview-notice";

const inputClass =
  "h-11 w-full rounded-md border border-grey-300 bg-white px-4 text-small transition-colors focus:border-sea-600";
const textareaClass =
  "w-full rounded-md border border-grey-300 bg-white px-4 py-3 text-small transition-colors focus:border-sea-600 aria-[invalid]:border-red-700";
const labelClass = "mb-2 block text-small font-medium text-ink";
const checkClass = "flex items-start gap-3 text-small text-ink";
const boxClass = "mt-1 h-4 w-4 accent-sea-800";
const linkClass =
  "text-sea-800 underline underline-offset-2 hover:text-sea-600";

/** Titled form section: the legend is the divider label, so the section
 *  is announced as a group and the title is never a detached paragraph. */
function Section({
  title,
  note,
  children,
}: {
  title: string;
  note?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="border-t border-grey-100 pt-8">
      <fieldset className="m-0 min-w-0 border-0 p-0">
        <legend className="p-0 text-caption font-semibold uppercase tracking-[0.06em] text-sea-800">
          {title}
        </legend>
        {note && <p className="mt-2 text-small text-grey-600">{note}</p>}
        <div className="mt-6 grid gap-6 md:grid-cols-2">{children}</div>
      </fieldset>
    </div>
  );
}

export function ApplyForm({
  types,
  policyVersion,
  constitutionHref,
}: {
  types: { code: string; label: string }[];
  /** Approved legal-text versions recorded with each consent; null while
   *  the texts are unapproved (the page then never renders a live form). */
  policyVersion: string | null;
  /** Where the constitution text is published (site_settings.legal). */
  constitutionHref: string;
}) {
  const t = useTranslations("apply");
  const tCommon = useTranslations("common");
  const locale = useLocale();
  const disabled = submissionsDisabled();
  const [status, setStatus] = useState<Status>("idle");
  const [errorKey, setErrorKey] = useState<ErrorKey>("errorGeneric");
  const [introZh, setIntroZh] = useState("");
  const [introEn, setIntroEn] = useState("");
  const [introMissing, setIntroMissing] = useState(false);
  const introZhRef = useRef<HTMLTextAreaElement>(null);
  const introEnRef = useRef<HTMLTextAreaElement>(null);
  const successRef = useRef<HTMLHeadingElement>(null);

  const pending = status === "pending";
  const done = status === "success" || status === "partial";
  const zhMetrics = zhIntroMetrics(introZh);
  const enMetrics = enIntroMetrics(introEn);
  const zh = locale === "zh";
  const paren = (inner: React.ReactNode) => (
    <>
      {zh ? "（" : " ("}
      {inner}
      {zh ? "）" : ")"}
    </>
  );

  useEffect(() => {
    if (done) successRef.current?.focus();
  }, [done]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (disabled) return;

    const hasIntro = zhMetrics.count > 0 || enMetrics.count > 0;
    if (!zhMetrics.ok || !enMetrics.ok || !hasIntro) {
      setIntroMissing(!hasIntro);
      const target = !zhMetrics.ok || !hasIntro ? introZhRef : introEnRef;
      target.current?.focus();
      return;
    }

    setStatus("pending");
    const form = new FormData(e.currentTarget);
    const field = (name: string) => String(form.get(name) ?? "").trim();
    const agreedTerms = form.get("agreed_terms") === "on";

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
        p_company_intro_zh: field("company_intro_zh") || undefined,
        p_company_intro_en: field("company_intro_en") || undefined,
        p_directory_consent: field("directory_consent") === "yes",
        p_agreed_constitution: form.get("agreed_constitution") === "on",
        p_agreed_terms: agreedTerms,
        p_agreed_privacy: agreedTerms,
        p_agreed_marketing: form.get("agreed_marketing") === "on",
        p_policy_version: policyVersion ?? undefined,
        p_locale: locale === "en" ? "en" : "zh",
      },
    );
    if (error || !data) {
      setErrorKey(rpcErrorKey(error?.message));
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

  const describe = (...ids: (string | false)[]) =>
    ids.filter(Boolean).join(" ") || undefined;
  const zhOver = !zhMetrics.ok;
  const enOver = !enMetrics.ok;

  return (
    <div>
      {/* Mounted before the submission so the confirmation is announced. */}
      <div role="status" aria-live="polite">
        {done && (
          <div className="rounded-lg bg-sea-50 p-7 md:p-8">
            <h3
              ref={successRef}
              tabIndex={-1}
              className="text-h3 font-semibold tracking-[-0.01em] text-ink"
            >
              {t("successTitle")}
            </h3>
            <p className="mt-4 text-body leading-relaxed text-grey-600">
              {t("successText")}
            </p>
            {status === "partial" && (
              <p className="mt-6 text-caption text-grey-500">
                {t("uploadError")}
              </p>
            )}
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
          >
            <fieldset
              disabled={disabled}
              className="contents m-0 min-w-0 border-0 p-0"
            >
              <div className="space-y-10">
                <div>
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

                <Section title={t("companySection")}>
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
                    <label
                      htmlFor="apply-company-address"
                      className={labelClass}
                    >
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
                      <span className="font-normal text-grey-500">
                        ({t("optional")})
                      </span>
                    </label>
                    <input
                      id="apply-fax"
                      name="fax"
                      type="tel"
                      className={inputClass}
                    />
                  </div>
                </Section>

                <Section title={t("contactSection")}>
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
                </Section>

                <Section title={t("introSection")} note={t("introEitherNote")}>
                  <div className="md:col-span-2">
                    <label htmlFor="apply-intro-zh" className={labelClass}>
                      {t("introZh")}
                    </label>
                    <textarea
                      ref={introZhRef}
                      id="apply-intro-zh"
                      name="company_intro_zh"
                      lang="zh"
                      rows={6}
                      maxLength={ZH_INTRO_MAX_CHARS}
                      value={introZh}
                      onChange={(e) => {
                        setIntroZh(e.target.value);
                        setIntroMissing(false);
                      }}
                      aria-invalid={zhOver ? true : undefined}
                      aria-describedby={describe(
                        "apply-intro-zh-count",
                        zhOver && "apply-intro-zh-error",
                        introMissing && "apply-intro-required",
                      )}
                      className={textareaClass}
                    />
                    <div className="mt-2 flex flex-wrap items-baseline justify-between gap-2">
                      <p className="text-caption text-grey-500">
                        {t("introZhHint")}
                      </p>
                      <p
                        id="apply-intro-zh-count"
                        className={`text-caption tabular-nums ${zhOver ? "font-medium text-red-700" : "text-grey-500"}`}
                      >
                        {t("countChars", {
                          count: zhMetrics.count,
                          limit: zhMetrics.limit,
                        })}
                      </p>
                    </div>
                    {zhOver && (
                      <p
                        id="apply-intro-zh-error"
                        role="alert"
                        className="mt-1 text-small text-red-700"
                      >
                        {t("errorIntroZhTooLong")}
                      </p>
                    )}
                  </div>

                  <div className="md:col-span-2">
                    <label htmlFor="apply-intro-en" className={labelClass}>
                      {t("introEn")}
                    </label>
                    <textarea
                      ref={introEnRef}
                      id="apply-intro-en"
                      name="company_intro_en"
                      lang="en"
                      rows={6}
                      maxLength={EN_INTRO_MAX_CHARS}
                      value={introEn}
                      onChange={(e) => {
                        setIntroEn(e.target.value);
                        setIntroMissing(false);
                      }}
                      aria-invalid={enOver ? true : undefined}
                      aria-describedby={describe(
                        "apply-intro-en-count",
                        enOver && "apply-intro-en-error",
                        introMissing && "apply-intro-required",
                      )}
                      className={textareaClass}
                    />
                    <div className="mt-2 flex flex-wrap items-baseline justify-between gap-2">
                      <p className="text-caption text-grey-500">
                        {t("introEnHint")}
                      </p>
                      <p
                        id="apply-intro-en-count"
                        className={`text-caption tabular-nums ${enOver ? "font-medium text-red-700" : "text-grey-500"}`}
                      >
                        {t("countWords", {
                          count: enMetrics.count,
                          limit: enMetrics.limit,
                        })}
                      </p>
                    </div>
                    {enOver && (
                      <p
                        id="apply-intro-en-error"
                        role="alert"
                        className="mt-1 text-small text-red-700"
                      >
                        {t("errorIntroEnTooLong")}
                      </p>
                    )}
                  </div>

                  {introMissing && (
                    <p
                      id="apply-intro-required"
                      role="alert"
                      className="md:col-span-2 text-small text-red-700"
                    >
                      {t("errorIntroRequired")}
                    </p>
                  )}
                </Section>

                <Section title={t("consentSection")}>
                  <fieldset className="md:col-span-2 m-0 min-w-0 border-0 p-0">
                    <legend className={labelClass}>{t("directoryTitle")}</legend>
                    <div className="space-y-2.5">
                      <label className={checkClass}>
                        <input
                          type="radio"
                          name="directory_consent"
                          value="yes"
                          required
                          className={boxClass}
                        />
                        {t("directoryYes")}
                      </label>
                      <label className={checkClass}>
                        <input
                          type="radio"
                          name="directory_consent"
                          value="no"
                          required
                          className={boxClass}
                        />
                        {t("directoryNo")}
                      </label>
                    </div>
                  </fieldset>

                  <div className="md:col-span-2 space-y-2.5">
                    <p className="text-small font-medium text-ink">
                      {t("consentRequiredNote")}
                    </p>
                    <label className={checkClass}>
                      <input
                        type="checkbox"
                        name="agreed_constitution"
                        required
                        className={boxClass}
                      />
                      <span>
                        {t("agreeConstitution")}
                        {paren(
                          <Link
                            href={constitutionHref}
                            className={linkClass}
                            target="_blank"
                          >
                            {t("constitutionLink")}
                          </Link>,
                        )}
                      </span>
                    </label>
                    <label className={checkClass}>
                      <input
                        type="checkbox"
                        name="agreed_terms"
                        required
                        className={boxClass}
                      />
                      <span>
                        {t("agreeTerms")}
                        {paren(
                          <>
                            <Link href="/terms" className={linkClass} target="_blank">
                              {t("termsLink")}
                            </Link>
                            {" · "}
                            <Link href="/privacy" className={linkClass} target="_blank">
                              {t("privacyLink")}
                            </Link>
                          </>,
                        )}
                      </span>
                    </label>
                  </div>

                  <div className="md:col-span-2">
                    <label className={checkClass}>
                      <input
                        type="checkbox"
                        name="agreed_marketing"
                        className={boxClass}
                      />
                      {t("agreeMarketing")}
                    </label>
                  </div>
                </Section>

                <div>
                  <label htmlFor="apply-documents" className={labelClass}>
                    {t("documents")}
                  </label>
                  <input
                    id="apply-documents"
                    name="documents"
                    type="file"
                    multiple
                    disabled={disabled}
                    accept=".pdf,.doc,.docx,image/jpeg,image/png"
                    aria-describedby={disabled ? undefined : "apply-documents-hint"}
                    className="block w-full text-small text-grey-600 file:mr-3 file:h-9 file:rounded-md file:border file:border-grey-300 file:bg-white file:px-4 file:text-small file:font-medium file:text-sea-800 file:transition-colors hover:file:bg-grey-50 disabled:opacity-50"
                  />
                  {!disabled && (
                    <p
                      id="apply-documents-hint"
                      className="mt-2 text-caption text-grey-500"
                    >
                      {t("documentsHint")}
                    </p>
                  )}
                </div>

                <div>
                  <Button
                    type="submit"
                    disabled={pending || disabled}
                    className="w-full md:w-auto"
                  >
                    {disabled
                      ? tCommon("previewSubmitDisabled")
                      : pending
                        ? tCommon("submitting")
                        : t("submit")}
                  </Button>
                  <div aria-live="polite">
                    {status === "error" && (
                      <p className="mt-4 text-small text-red-700">
                        {t(errorKey)}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </fieldset>
          </form>
        </>
      )}
    </div>
  );
}
