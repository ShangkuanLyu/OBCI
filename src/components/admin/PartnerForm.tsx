"use client";

import { FormStatus } from "@/components/admin/Field";

import { useActionState } from "react";
import {
  Field,
  TextInput,
  Select,
  AdminButton,
} from "@/components/admin/Field";
import {
  createPartner,
  updatePartner,
  deletePartner,
  type ActionState,
} from "@/app/[locale]/admin/partners/actions";
import type { Tables } from "@/types/database.types";

const initialState: ActionState = { status: "idle" };

const KINDS = [
  { value: "government", zh: "政府机构", en: "Government" },
  { value: "chamber", zh: "商会协会", en: "Chamber" },
  { value: "enterprise", zh: "企业", en: "Enterprise" },
  { value: "provincial", zh: "省级机构", en: "Provincial" },
  { value: "media", zh: "媒体", en: "Media" },
];

export function PartnerForm({
  locale,
  item,
}: {
  locale: string;
  item?: Tables<"partners">;
}) {
  const zh = locale === "zh";
  const [state, formAction, pending] = useActionState(
    item ? updatePartner : createPartner,
    initialState,
  );
  const [deleteState, deleteAction, deletePending] = useActionState(
    deletePartner,
    initialState,
  );

  return (
    <>
      <form action={formAction} className="space-y-5">
        <input type="hidden" name="locale" value={locale} />
        {item && <input type="hidden" name="id" value={item.id} />}

        <div className="grid gap-5 md:grid-cols-2">
          <Field label={`${zh ? "名称" : "Name"} 中文`} htmlFor="name_zh">
            <TextInput
              id="name_zh"
              name="name_zh"
              required
              maxLength={200}
              defaultValue={item?.name_zh}
            />
          </Field>
          <Field label={`${zh ? "名称" : "Name"} EN`} htmlFor="name_en">
            <TextInput
              id="name_en"
              name="name_en"
              required
              maxLength={200}
              defaultValue={item?.name_en}
            />
          </Field>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <Field label={zh ? "类型" : "Kind"} htmlFor="kind">
            <Select id="kind" name="kind" defaultValue={item?.kind ?? "government"}>
              {KINDS.map((kind) => (
                <option key={kind.value} value={kind.value}>
                  {zh ? kind.zh : kind.en}
                </option>
              ))}
            </Select>
          </Field>
          <Field label={zh ? "地区" : "Region"} htmlFor="region">
            <TextInput
              id="region"
              name="region"
              maxLength={200}
              defaultValue={item?.region ?? ""}
            />
          </Field>
          <Field
            label={zh ? "网站" : "Website"}
            htmlFor="website"
            hint={zh ? "如 https://example.com" : "e.g. https://example.com"}
          >
            <TextInput
              id="website"
              name="website"
              maxLength={300}
              defaultValue={item?.website ?? ""}
            />
          </Field>
          <Field label={zh ? "排序" : "Display order"} htmlFor="display_order">
            <TextInput
              id="display_order"
              name="display_order"
              type="number"
              min={0}
              max={9999}
              defaultValue={item?.display_order ?? 0}
            />
          </Field>
        </div>

        <label className="flex items-center gap-2 text-small text-ink">
          <input
            type="checkbox"
            name="is_active"
            defaultChecked={item ? item.is_active : true}
            className="h-4 w-4 rounded border-grey-300 accent-sea-900"
          />
          {zh ? "启用显示" : "Active"}
        </label>

        <div className="pt-2">
          <AdminButton type="submit" disabled={pending}>
            {pending
              ? zh
                ? "保存中…"
                : "Saving…"
              : zh
                ? "保存"
                : "Save"}
          </AdminButton>
          <FormStatus state={state} />
        </div>
      </form>

      {item && (
        <form
          action={deleteAction}
          onSubmit={(event) => {
            if (
              !confirm(
                zh
                  ? "确定要删除该合作伙伴吗？此操作不可撤销。"
                  : "Delete this partner? This cannot be undone.",
              )
            ) {
              event.preventDefault();
            }
          }}
          className="mt-8 border-t border-grey-300 pt-6"
        >
          <input type="hidden" name="locale" value={locale} />
          <input type="hidden" name="id" value={item.id} />
          <AdminButton type="submit" variant="danger" disabled={deletePending}>
            {zh ? "删除" : "Delete"}
          </AdminButton>
          <FormStatus state={deleteState} />
        </form>
      )}
    </>
  );
}
