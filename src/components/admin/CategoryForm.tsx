"use client";

import { FormStatus } from "@/components/admin/Field";

import { useActionState } from "react";
import {
  Field,
  TextInput,
  AdminButton,
} from "@/components/admin/Field";
import {
  createCategory,
  updateCategory,
  deleteCategory,
  type ActionState,
} from "@/app/[locale]/admin/categories/actions";
import type { Tables } from "@/types/database.types";

const initialState: ActionState = { status: "idle" };

export function CategoryForm({
  locale,
  item,
}: {
  locale: string;
  item?: Tables<"news_categories">;
}) {
  const zh = locale === "zh";
  const [state, formAction, pending] = useActionState(
    item ? updateCategory : createCategory,
    initialState,
  );
  const [deleteState, deleteAction, deletePending] = useActionState(
    deleteCategory,
    initialState,
  );

  return (
    <>
      <form action={formAction} className="space-y-5">
        <input type="hidden" name="locale" value={locale} />
        {item && <input type="hidden" name="id" value={item.id} />}

        <Field
          label="Slug"
          htmlFor="slug"
          hint={
            zh
              ? "小写字母、数字与连字符，如 policy-updates"
              : "Lowercase letters, digits and hyphens, e.g. policy-updates"
          }
        >
          <TextInput
            id="slug"
            name="slug"
            required
            maxLength={100}
            pattern="[a-z0-9]+(-[a-z0-9]+)*"
            defaultValue={item?.slug}
          />
        </Field>

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

        <label className="flex items-start gap-3 text-small text-ink">
          <input
            type="checkbox"
            name="is_active"
            defaultChecked={item?.is_active ?? true}
            className="mt-1 h-4 w-4 rounded border-grey-300"
          />
          <span>
            {zh ? "作为一级分类显示" : "Show as a first-level category"}
            <span className="block text-caption text-grey-500">
              {zh
                ? "取消勾选 = 历史分类：不显示为分类页签；其文章继续发布，并标记「历史分类待整理」，直至重新归类。"
                : "Unchecked = legacy category: not offered as a tab; its articles stay published, marked “legacy category · pending review”, until re-assigned."}
            </span>
          </span>
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
                  ? "确定要删除该分类吗？相关文章不会被删除，但将不再归属任何分类并继续发布。"
                  : "Delete this category? Articles keep publishing but will no longer belong to any category.",
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
