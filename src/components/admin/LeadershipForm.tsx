"use client";

import { useActionState } from "react";
import {
  Field,
  TextInput,
  TextArea,
  Select,
  AdminButton,
} from "@/components/admin/Field";
import {
  createLeadership,
  updateLeadership,
  deleteLeadership,
  type ActionState,
} from "@/app/[locale]/admin/leadership/actions";
import type { Tables } from "@/types/database.types";

const initialState: ActionState = { status: "idle" };

const GROUPS = [
  { value: "president", zh: "会长", en: "President" },
  { value: "honorary_chairman", zh: "名誉主席", en: "Honorary Chairman" },
  { value: "vice_chair", zh: "副会长", en: "Vice Chair" },
  { value: "advisor", zh: "顾问", en: "Advisor" },
  { value: "secretariat", zh: "秘书处", en: "Secretariat" },
];

export function LeadershipForm({
  locale,
  item,
}: {
  locale: string;
  item?: Tables<"leadership">;
}) {
  const zh = locale === "zh";
  const [state, formAction, pending] = useActionState(
    item ? updateLeadership : createLeadership,
    initialState,
  );
  const [deleteState, deleteAction, deletePending] = useActionState(
    deleteLeadership,
    initialState,
  );

  return (
    <>
      <form action={formAction} className="space-y-5">
        <input type="hidden" name="locale" value={locale} />
        {item && <input type="hidden" name="id" value={item.id} />}

        <div className="grid gap-5 md:grid-cols-2">
          <Field label={`${zh ? "姓名" : "Name"} 中文`} htmlFor="name_zh">
            <TextInput
              id="name_zh"
              name="name_zh"
              required
              maxLength={200}
              defaultValue={item?.name_zh}
            />
          </Field>
          <Field label={`${zh ? "姓名" : "Name"} EN`} htmlFor="name_en">
            <TextInput
              id="name_en"
              name="name_en"
              required
              maxLength={200}
              defaultValue={item?.name_en}
            />
          </Field>
          <Field label={`${zh ? "职务" : "Title"} 中文`} htmlFor="title_zh">
            <TextInput
              id="title_zh"
              name="title_zh"
              required
              maxLength={200}
              defaultValue={item?.title_zh}
            />
          </Field>
          <Field label={`${zh ? "职务" : "Title"} EN`} htmlFor="title_en">
            <TextInput
              id="title_en"
              name="title_en"
              required
              maxLength={200}
              defaultValue={item?.title_en}
            />
          </Field>
          <Field label={`${zh ? "简介" : "Bio"} 中文`} htmlFor="bio_zh">
            <TextArea
              id="bio_zh"
              name="bio_zh"
              rows={4}
              maxLength={5000}
              defaultValue={item?.bio_zh ?? ""}
            />
          </Field>
          <Field label={`${zh ? "简介" : "Bio"} EN`} htmlFor="bio_en">
            <TextArea
              id="bio_en"
              name="bio_en"
              rows={4}
              maxLength={5000}
              defaultValue={item?.bio_en ?? ""}
            />
          </Field>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <Field label={zh ? "分组" : "Group"} htmlFor="group_key">
            <Select
              id="group_key"
              name="group_key"
              defaultValue={item?.group_key ?? "president"}
            >
              {GROUPS.map((group) => (
                <option key={group.value} value={group.value}>
                  {zh ? group.zh : group.en}
                </option>
              ))}
            </Select>
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

        <Field
          label={zh ? "肖像照片" : "Portrait"}
          htmlFor="portrait"
          hint={
            item?.portrait_path
              ? zh
                ? `当前：${item.portrait_path}`
                : `Current: ${item.portrait_path}`
              : zh
                ? "JPG/PNG，5MB 以内"
                : "JPG/PNG, under 5MB"
          }
        >
          <input
            id="portrait"
            name="portrait"
            type="file"
            accept="image/*"
            className="block w-full text-small text-grey-600 file:mr-3 file:h-9 file:rounded-md file:border-0 file:bg-grey-100 file:px-3 file:text-small file:font-medium file:text-ink"
          />
        </Field>

        <label className="flex items-center gap-2 text-small text-ink">
          <input
            type="checkbox"
            name="is_active"
            defaultChecked={item ? item.is_active : true}
            className="h-4 w-4 rounded border-grey-300 accent-navy-900"
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
          {state.status === "error" && (
            <p className="mt-2 text-small text-red-700">{state.message}</p>
          )}
        </div>
      </form>

      {item && (
        <form
          action={deleteAction}
          onSubmit={(event) => {
            if (
              !confirm(
                zh
                  ? "确定要删除该成员吗？此操作不可撤销。"
                  : "Delete this member? This cannot be undone.",
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
          {deleteState.status === "error" && (
            <p className="mt-2 text-small text-red-700">{deleteState.message}</p>
          )}
        </form>
      )}
    </>
  );
}
