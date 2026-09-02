"use client";

import { FormStatus } from "@/components/admin/Field";

import { useActionState } from "react";
import { AdminButton } from "@/components/admin/Field";
import {
  updateEnquiryStatus,
  type ActionState,
} from "@/app/[locale]/admin/enquiries/actions";

const initialState: ActionState = { status: "idle" };

export function StatusButtons({
  enquiryId,
  locale,
  currentStatus,
}: {
  enquiryId: number;
  locale: string;
  currentStatus: string;
}) {
  const [state, formAction, pending] = useActionState(
    updateEnquiryStatus,
    initialState,
  );
  const zh = locale === "zh";

  return (
    <form action={formAction}>
      <input type="hidden" name="id" value={enquiryId} />
      <input type="hidden" name="locale" value={locale} />
      <div className="flex flex-wrap gap-3">
        {currentStatus !== "in_progress" && (
          <AdminButton
            type="submit"
            name="status"
            value="in_progress"
            variant="quiet"
            disabled={pending}
          >
            {zh ? "标记为处理中" : "Mark in progress"}
          </AdminButton>
        )}
        {currentStatus !== "closed" && (
          <AdminButton
            type="submit"
            name="status"
            value="closed"
            disabled={pending}
          >
            {zh ? "标记为已关闭" : "Mark closed"}
          </AdminButton>
        )}
      </div>
      <FormStatus state={state} fallback={zh ? "保存失败" : "Failed to save"} />
    </form>
  );
}
