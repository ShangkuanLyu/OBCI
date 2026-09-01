"use client";

import { useActionState } from "react";
import {
  Field,
  TextInput,
  TextArea,
  AdminButton,
} from "@/components/admin/Field";
import {
  createChapter,
  updateChapter,
  deleteChapter,
  type ActionState,
} from "@/app/[locale]/admin/chapters/actions";
import type { Tables } from "@/types/database.types";

const initialState: ActionState = { status: "idle" };

export function ChapterForm({
  locale,
  item,
}: {
  locale: string;
  item?: Tables<"industry_chapters">;
}) {
  const zh = locale === "zh";
  const [state, formAction, pending] = useActionState(
    item ? updateChapter : createChapter,
    initialState,
  );
  const [deleteState, deleteAction, deletePending] = useActionState(
    deleteChapter,
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
              ? "小写字母、数字与连字符，如 finance-chapter"
              : "Lowercase letters, digits and hyphens, e.g. finance-chapter"
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
          <Field
            label={`${zh ? "一句话定位" : "Tagline"} 中文`}
            htmlFor="tagline_zh"
          >
            <TextInput
              id="tagline_zh"
              name="tagline_zh"
              maxLength={300}
              defaultValue={item?.tagline_zh ?? ""}
            />
          </Field>
          <Field
            label={`${zh ? "一句话定位" : "Tagline"} EN`}
            htmlFor="tagline_en"
          >
            <TextInput
              id="tagline_en"
              name="tagline_en"
              maxLength={300}
              defaultValue={item?.tagline_en ?? ""}
            />
          </Field>
          <Field
            label={`${zh ? "简介" : "Description"} 中文`}
            htmlFor="description_zh"
          >
            <TextArea
              id="description_zh"
              name="description_zh"
              rows={6}
              maxLength={5000}
              defaultValue={item?.description_zh ?? ""}
            />
          </Field>
          <Field
            label={`${zh ? "简介" : "Description"} EN`}
            htmlFor="description_en"
          >
            <TextArea
              id="description_en"
              name="description_en"
              rows={6}
              maxLength={5000}
              defaultValue={item?.description_en ?? ""}
            />
          </Field>
          <Field
            label={`${zh ? "本地资源（每行一条）" : "Local resources (one per line)"} 中文`}
            htmlFor="resources_zh"
          >
            <TextArea
              id="resources_zh"
              name="resources_zh"
              rows={4}
              maxLength={3000}
              defaultValue={(item?.resources_zh ?? []).join("\n")}
            />
          </Field>
          <Field
            label={`${zh ? "本地资源（每行一条）" : "Local resources (one per line)"} EN`}
            htmlFor="resources_en"
          >
            <TextArea
              id="resources_en"
              name="resources_en"
              rows={4}
              maxLength={3000}
              defaultValue={(item?.resources_en ?? []).join("\n")}
            />
          </Field>
          <Field
            label={`${zh ? "ABS 行业服务（每行一条）" : "ABS industry services (one per line)"} 中文`}
            htmlFor="services_zh"
          >
            <TextArea
              id="services_zh"
              name="services_zh"
              rows={4}
              maxLength={3000}
              defaultValue={(item?.services_zh ?? []).join("\n")}
            />
          </Field>
          <Field
            label={`${zh ? "ABS 行业服务（每行一条）" : "ABS industry services (one per line)"} EN`}
            htmlFor="services_en"
          >
            <TextArea
              id="services_en"
              name="services_en"
              rows={4}
              maxLength={3000}
              defaultValue={(item?.services_en ?? []).join("\n")}
            />
          </Field>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <Field
            label={zh ? "秘书长" : "Secretary general"}
            htmlFor="secretary_general"
          >
            <TextInput
              id="secretary_general"
              name="secretary_general"
              maxLength={200}
              defaultValue={item?.secretary_general ?? ""}
            />
          </Field>
          <Field
            label={zh ? "联系邮箱" : "Contact email"}
            htmlFor="contact_email"
          >
            <TextInput
              id="contact_email"
              name="contact_email"
              type="email"
              maxLength={320}
              defaultValue={item?.contact_email ?? ""}
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
                  ? "确定要删除该分会吗？此操作不可撤销。"
                  : "Delete this chapter? This cannot be undone.",
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
