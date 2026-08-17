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

const initialState: ActionState = { status: "idle" };

const REVIEW_STATUSES = [
  { value: "under_review", zh: "审核中", en: "Under review" },
  { value: "approved", zh: "已通过", en: "Approved" },
  { value: "rejected", zh: "已拒绝", en: "Rejected" },
] as const;

export function ApplicationReview({
  applicationId,
  locale,
  currentStatus,
  currentNote,
}: {
  applicationId: number;
  locale: string;
  currentStatus: string;
  currentNote: string | null;
}) {
  const [state, formAction, pending] = useActionState(
    updateApplicationStatus,
    initialState,
  );
  const zh = locale === "zh";

  return (
    <form action={formAction} className="space-y-5">
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
        {state.status === "error" && (
          <p className="mt-2 text-small text-red-700">
            {state.message ?? (zh ? "保存失败" : "Failed to save")}
          </p>
        )}
      </div>
    </form>
  );
}
