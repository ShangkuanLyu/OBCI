"use client";

import { useActionState } from "react";
import {
  AdminButton,
  Field,
  Select,
  TextArea,
} from "@/components/admin/Field";
import {
  updateApplicationStatus,
  type ActionState,
} from "@/app/[locale]/admin/applications/actions";
import { paymentMethodLabel } from "@/lib/utils/payment-methods.mjs";

const initialState: ActionState = { status: "idle" };

const REVIEW_STATUSES = [
  { value: "under_review", zh: "审核中", en: "Under review" },
  { value: "approved", zh: "已通过", en: "Approved" },
  { value: "rejected", zh: "已拒绝", en: "Rejected" },
] as const;

/** Read-only consent record. `undefined` booleans mean the column does not
 *  exist yet (application_form_v2 migration not applied) and render as "—". */
export type ConsentSummary = {
  directoryConsent: boolean;
  agreedConstitution: boolean | undefined;
  agreedTerms: boolean;
  agreedPrivacy: boolean | undefined;
  agreedMarketing: boolean;
  /** Pre-formatted for the admin locale; "—" when not recorded. */
  consentAt: string;
  policyVersion: string | null | undefined;
  /** Declared payment intent (bank_transfer | cheque | credit_card); null
   *  for rows submitted before the field was collected. */
  paymentMethod: string | null | undefined;
};

export function ApplicationReview({
  applicationId,
  locale,
  currentStatus,
  currentNote,
  consent,
}: {
  applicationId: number;
  locale: string;
  currentStatus: string;
  currentNote: string | null;
  consent: ConsentSummary;
}) {
  const [state, formAction, pending] = useActionState(
    updateApplicationStatus,
    initialState,
  );
  const zh = locale === "zh";
  const yesNo = (value: boolean | undefined) =>
    value === undefined ? "—" : value ? (zh ? "是" : "Yes") : zh ? "否" : "No";

  const consentRows: { label: string; value: string }[] = [
    {
      label: zh ? "会员名录授权" : "Directory consent",
      value: yesNo(consent.directoryConsent),
    },
    {
      label: zh ? "同意协会章程" : "Constitution",
      value: yesNo(consent.agreedConstitution),
    },
    { label: zh ? "同意服务条款" : "Terms", value: yesNo(consent.agreedTerms) },
    {
      label: zh ? "同意隐私政策" : "Privacy policy",
      value: yesNo(consent.agreedPrivacy),
    },
    {
      label: zh ? "订阅邮件资讯" : "Marketing emails",
      value: yesNo(consent.agreedMarketing),
    },
    { label: zh ? "同意时间" : "Consent recorded", value: consent.consentAt },
    {
      label: zh ? "政策版本" : "Policy version",
      value: consent.policyVersion || "—",
    },
    {
      label: zh ? "缴费方式" : "Payment method",
      value: paymentMethodLabel(consent.paymentMethod, locale),
    },
  ];

  return (
    <div className="space-y-6">
      <section aria-labelledby="application-consent-title">
        <h3
          id="application-consent-title"
          className="text-caption font-semibold uppercase tracking-[0.06em] text-grey-500"
        >
          {zh ? "同意与授权" : "Consents"}
        </h3>
        <dl className="mt-2 divide-y divide-grey-100">
          {consentRows.map((row) => (
            <div
              key={row.label}
              className="flex items-baseline justify-between gap-4 py-2"
            >
              <dt className="text-caption text-grey-500">{row.label}</dt>
              <dd className="text-right text-small text-ink">{row.value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <form action={formAction} className="space-y-5 border-t border-grey-100 pt-6">
        <input type="hidden" name="id" value={applicationId} />
        <input type="hidden" name="locale" value={locale} />

        <Field
          label={zh ? "审核状态" : "Review status"}
          htmlFor="review-status"
        >
          <Select
            id="review-status"
            name="status"
            required
            defaultValue={
              REVIEW_STATUSES.some((s) => s.value === currentStatus)
                ? currentStatus
                : "under_review"
            }
          >
            {REVIEW_STATUSES.map((s) => (
              <option key={s.value} value={s.value}>
                {zh ? s.zh : s.en}
              </option>
            ))}
          </Select>
        </Field>

        <Field
          label={zh ? "审核备注" : "Review note"}
          htmlFor="review-note"
        >
          <TextArea
            id="review-note"
            name="review_note"
            rows={4}
            defaultValue={currentNote ?? ""}
            maxLength={5000}
          />
        </Field>

        <div>
          <AdminButton type="submit" disabled={pending}>
            {zh ? "保存审核结果" : "Save review"}
          </AdminButton>
          <p aria-live="polite" className="mt-2">
            {state.status === "error" && (
              <span className="text-small text-red-700">
                {state.message ?? (zh ? "保存失败" : "Failed to save")}
              </span>
            )}
          </p>
        </div>
      </form>
    </div>
  );
}
