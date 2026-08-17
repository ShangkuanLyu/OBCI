"use client";

import { useActionState } from "react";
import {
  createNews,
  updateNews,
  deleteNews,
  type NewsActionState,
} from "@/app/[locale]/admin/news/actions";
import {
  Field,
  TextInput,
  TextArea,
  Select,
  AdminButton,
} from "@/components/admin/Field";
import type { Tables } from "@/types/database.types";

const initialState: NewsActionState = { status: "idle" };

/** ISO timestamp → value for <input type="datetime-local"> in local time. */
function toDatetimeLocal(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function NewsForm({
  categories,
  initial,
  locale,
}: {
  categories: { id: number; name: string }[];
  initial: Tables<"news"> | null;
  locale: string;
}) {
  const zh = locale === "zh";
  const [state, formAction, pending] = useActionState(
    initial ? updateNews : createNews,
    initialState,
  );

  return (
    <>
      <form action={formAction} className="grid gap-6 md:grid-cols-2">
        <input type="hidden" name="locale" value={locale} />
        {initial && <input type="hidden" name="id" value={initial.id} />}

        <Field
          label="Slug"
          htmlFor="news-slug"
          hint={
            zh
              ? "小写字母、数字与连字符，例如 annual-forum-2026"
              : "lowercase-hyphen, e.g. annual-forum-2026"
          }
        >
          <TextInput
            id="news-slug"
            name="slug"
            type="text"
            required
            defaultValue={initial?.slug ?? ""}
            pattern="[a-z0-9]+(-[a-z0-9]+)*"
          />
        </Field>

        <Field label={zh ? "分类" : "Category"} htmlFor="news-category">
          <Select
            id="news-category"
            name="category_id"
            defaultValue={initial?.category_id ? String(initial.category_id) : ""}
          >
            <option value="">{zh ? "无分类" : "Uncategorised"}</option>
            {categories.map((category) => (
              <option key={category.id} value={String(category.id)}>
                {category.name}
              </option>
            ))}
          </Select>
        </Field>

        <Field label={zh ? "标题 中文" : "Title 中文"} htmlFor="news-title-zh">
          <TextInput
            id="news-title-zh"
            name="title_zh"
            type="text"
            defaultValue={initial?.title_zh ?? ""}
          />
        </Field>

        <Field label={zh ? "标题 EN" : "Title EN"} htmlFor="news-title-en">
          <TextInput
            id="news-title-en"
            name="title_en"
            type="text"
            defaultValue={initial?.title_en ?? ""}
          />
        </Field>

        <Field label={zh ? "摘要 中文" : "Summary 中文"} htmlFor="news-summary-zh">
          <TextArea
            id="news-summary-zh"
            name="summary_zh"
            rows={3}
            defaultValue={initial?.summary_zh ?? ""}
          />
        </Field>

        <Field label={zh ? "摘要 EN" : "Summary EN"} htmlFor="news-summary-en">
          <TextArea
            id="news-summary-en"
            name="summary_en"
            rows={3}
            defaultValue={initial?.summary_en ?? ""}
          />
        </Field>

        <Field
          label={zh ? "正文 中文" : "Body 中文"}
          htmlFor="news-body-zh"
          hint={zh ? "支持 Markdown 格式" : "Markdown supported"}
        >
          <TextArea
            id="news-body-zh"
            name="body_zh"
            rows={14}
            defaultValue={initial?.body_zh ?? ""}
          />
        </Field>

        <Field
          label={zh ? "正文 EN" : "Body EN"}
          htmlFor="news-body-en"
          hint={zh ? "支持 Markdown 格式" : "Markdown supported"}
        >
          <TextArea
            id="news-body-en"
            name="body_en"
            rows={14}
            defaultValue={initial?.body_en ?? ""}
          />
        </Field>

        <Field label={zh ? "作者" : "Author"} htmlFor="news-author">
          <TextInput
            id="news-author"
            name="author_name"
            type="text"
            defaultValue={initial?.author_name ?? ""}
          />
        </Field>

        <Field
          label={zh ? "来源链接" : "Source URL"}
          htmlFor="news-source-url"
          hint={zh ? "https:// 开头" : "starts with https://"}
        >
          <TextInput
            id="news-source-url"
            name="source_url"
            type="url"
            defaultValue={initial?.source_url ?? ""}
          />
        </Field>

        <Field label={zh ? "状态" : "Status"} htmlFor="news-status">
          <Select
            id="news-status"
            name="status"
            defaultValue={initial?.status ?? "draft"}
          >
            <option value="draft">{zh ? "草稿" : "Draft"}</option>
            <option value="published">{zh ? "已发布" : "Published"}</option>
            <option value="archived">{zh ? "已归档" : "Archived"}</option>
          </Select>
        </Field>

        <Field label={zh ? "发布时间" : "Published at"} htmlFor="news-published-at">
          <TextInput
            id="news-published-at"
            name="published_at"
            type="datetime-local"
            defaultValue={toDatetimeLocal(initial?.published_at ?? null)}
          />
        </Field>

        <div className="md:col-span-2">
          <label className="flex items-center gap-2 text-small font-medium text-ink">
            <input
              type="checkbox"
              name="is_featured"
              defaultChecked={initial?.is_featured ?? false}
              className="h-4 w-4 rounded border-grey-300 accent-navy-900"
            />
            {zh ? "设为焦点新闻" : "Featured article"}
          </label>
        </div>

        <div className="md:col-span-2">
          <Field label={zh ? "封面图片" : "Cover image"} htmlFor="news-cover-image">
            <input
              id="news-cover-image"
              name="cover_image"
              type="file"
              accept="image/*"
              className="block w-full text-small text-grey-600 file:mr-3 file:h-9 file:rounded-md file:border file:border-grey-300 file:bg-white file:px-4 file:text-small file:font-medium file:text-navy-900 file:transition-colors hover:file:bg-grey-50"
            />
          </Field>
          {initial?.cover_image_path && (
            <p className="mt-1.5 text-caption text-grey-500">
              {zh ? "当前封面：" : "Current cover: "}
              {initial.cover_image_path}
            </p>
          )}
        </div>

        <div className="md:col-span-2">
          <AdminButton type="submit" disabled={pending}>
            {pending
              ? zh
                ? "保存中…"
                : "Saving…"
              : initial
                ? zh
                  ? "保存修改"
                  : "Save changes"
                : zh
                  ? "创建新闻"
                  : "Create article"}
          </AdminButton>
          {state.status === "error" && (
            <p className="mt-3 text-small text-red-700">{state.message}</p>
          )}
        </div>
      </form>

      {initial && (
        <form
          action={deleteNews}
          onSubmit={(event) => {
            if (
              !confirm(
                zh
                  ? "确定删除这篇新闻？此操作不可撤销。"
                  : "Delete this article? This cannot be undone.",
              )
            ) {
              event.preventDefault();
            }
          }}
          className="mt-10 border-t border-grey-300 pt-6"
        >
          <input type="hidden" name="locale" value={locale} />
          <input type="hidden" name="id" value={initial.id} />
          <AdminButton type="submit" variant="danger">
            {zh ? "删除新闻" : "Delete article"}
          </AdminButton>
        </form>
      )}
    </>
  );
}
