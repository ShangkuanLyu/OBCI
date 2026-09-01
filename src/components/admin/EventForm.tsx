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
  createEvent,
  updateEvent,
  deleteEvent,
  type EventActionState,
} from "@/app/[locale]/admin/events/actions";
import type { Tables } from "@/types/database.types";

const initialState: EventActionState = { status: "idle" };

/** Convert a DB timestamp to the value a datetime-local input expects. */
function toDatetimeLocal(value: string | null): string {
  if (!value) return "";
  return value.slice(0, 16);
}

export function EventForm({
  locale,
  event,
}: {
  locale: string;
  event?: Tables<"events">;
}) {
  const zh = locale === "zh";
  const [state, formAction, pending] = useActionState(
    event ? updateEvent : createEvent,
    initialState,
  );
  const [deleteState, deleteAction, deletePending] = useActionState(
    deleteEvent,
    initialState,
  );

  return (
    <>
      <form action={formAction}>
        <input type="hidden" name="locale" value={locale} />
        {event && <input type="hidden" name="id" value={event.id} />}

        <div className="space-y-5">
          <Field
            label="Slug"
            htmlFor="event-slug"
            hint={
              zh
                ? "仅限小写字母、数字与连字符，如 spring-gala-2026"
                : "Lowercase letters, numbers and hyphens, e.g. spring-gala-2026"
            }
          >
            <TextInput
              id="event-slug"
              name="slug"
              required
              pattern="[a-z0-9]+(-[a-z0-9]+)*"
              defaultValue={event?.slug ?? ""}
            />
          </Field>

          <div className="grid gap-5 md:grid-cols-2">
            <Field label={zh ? "标题 中文" : "Title 中文"} htmlFor="event-title-zh">
              <TextInput
                id="event-title-zh"
                name="title_zh"
                required
                defaultValue={event?.title_zh ?? ""}
              />
            </Field>
            <Field label={zh ? "标题 EN" : "Title EN"} htmlFor="event-title-en">
              <TextInput
                id="event-title-en"
                name="title_en"
                defaultValue={event?.title_en ?? ""}
              />
            </Field>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <Field label={zh ? "摘要 中文" : "Summary 中文"} htmlFor="event-summary-zh">
              <TextArea
                id="event-summary-zh"
                name="summary_zh"
                rows={3}
                defaultValue={event?.summary_zh ?? ""}
              />
            </Field>
            <Field label={zh ? "摘要 EN" : "Summary EN"} htmlFor="event-summary-en">
              <TextArea
                id="event-summary-en"
                name="summary_en"
                rows={3}
                defaultValue={event?.summary_en ?? ""}
              />
            </Field>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <Field
              label={zh ? "正文 中文" : "Body 中文"}
              htmlFor="event-body-zh"
              hint={zh ? "支持 Markdown 格式" : "Supports Markdown formatting"}
            >
              <TextArea
                id="event-body-zh"
                name="body_zh"
                rows={12}
                defaultValue={event?.body_zh ?? ""}
              />
            </Field>
            <Field
              label={zh ? "正文 EN" : "Body EN"}
              htmlFor="event-body-en"
              hint={zh ? "支持 Markdown 格式" : "Supports Markdown formatting"}
            >
              <TextArea
                id="event-body-en"
                name="body_en"
                rows={12}
                defaultValue={event?.body_en ?? ""}
              />
            </Field>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <Field label={zh ? "地点 中文" : "Location 中文"} htmlFor="event-location-zh">
              <TextInput
                id="event-location-zh"
                name="location_zh"
                defaultValue={event?.location_zh ?? ""}
              />
            </Field>
            <Field label={zh ? "地点 EN" : "Location EN"} htmlFor="event-location-en">
              <TextInput
                id="event-location-en"
                name="location_en"
                defaultValue={event?.location_en ?? ""}
              />
            </Field>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <Field label={zh ? "开始时间" : "Starts at"} htmlFor="event-starts-at">
              <TextInput
                id="event-starts-at"
                name="starts_at"
                type="datetime-local"
                required
                defaultValue={toDatetimeLocal(event?.starts_at ?? null)}
              />
            </Field>
            <Field
              label={zh ? "结束时间" : "Ends at"}
              htmlFor="event-ends-at"
              hint={zh ? "可留空" : "Optional"}
            >
              <TextInput
                id="event-ends-at"
                name="ends_at"
                type="datetime-local"
                defaultValue={toDatetimeLocal(event?.ends_at ?? null)}
              />
            </Field>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            <Field label={zh ? "状态" : "Status"} htmlFor="event-status">
              <Select
                id="event-status"
                name="status"
                defaultValue={event?.status ?? "draft"}
              >
                <option value="draft">{zh ? "草稿" : "Draft"}</option>
                <option value="published">{zh ? "已发布" : "Published"}</option>
                <option value="archived">{zh ? "已归档" : "Archived"}</option>
              </Select>
            </Field>
            <Field
              label={zh ? "名额" : "Capacity"}
              htmlFor="event-capacity"
              hint={zh ? "可留空" : "Optional"}
            >
              <TextInput
                id="event-capacity"
                name="capacity"
                type="number"
                min={1}
                step={1}
                defaultValue={event?.capacity ?? ""}
              />
            </Field>
          </div>

          <div className="flex flex-wrap gap-6 pt-1">
            <label className="flex items-center gap-2 text-small text-ink">
              <input
                type="checkbox"
                name="is_featured"
                defaultChecked={event?.is_featured ?? false}
                className="h-4 w-4 accent-sea-900"
              />
              {zh ? "焦点活动" : "Featured"}
            </label>
            <label className="flex items-center gap-2 text-small text-ink">
              <input
                type="checkbox"
                name="registration_open"
                defaultChecked={event?.registration_open ?? false}
                className="h-4 w-4 accent-sea-900"
              />
              {zh ? "开放报名" : "Registration open"}
            </label>
          </div>

          <Field
            label={zh ? "报名链接" : "Registration URL"}
            htmlFor="event-registration-url"
            hint={zh ? "可留空，需以 http(s):// 开头" : "Optional, must start with http(s)://"}
          >
            <TextInput
              id="event-registration-url"
              name="registration_url"
              type="url"
              placeholder="https://"
              defaultValue={event?.registration_url ?? ""}
            />
          </Field>

          <Field
            label={zh ? "封面图片" : "Cover image"}
            htmlFor="event-cover-image"
            hint={
              event?.cover_image_path
                ? (zh ? "当前：" : "Current: ") + event.cover_image_path
                : zh
                  ? "JPG/PNG/WebP/GIF，不超过 10MB"
                  : "JPG/PNG/WebP/GIF, up to 10MB"
            }
          >
            <input
              id="event-cover-image"
              name="cover_image"
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              className="block w-full text-small text-grey-600 file:mr-3 file:h-9 file:cursor-pointer file:rounded-md file:border-0 file:bg-grey-100 file:px-3 file:text-small file:font-medium file:text-ink hover:file:bg-grey-50"
            />
          </Field>
        </div>

        <div className="mt-8">
          <AdminButton type="submit" disabled={pending}>
            {pending
              ? zh
                ? "保存中…"
                : "Saving…"
              : event
                ? zh
                  ? "保存修改"
                  : "Save changes"
                : zh
                  ? "创建活动"
                  : "Create event"}
          </AdminButton>
          {state.status === "error" && (
            <p className="mt-3 text-small text-red-700">{state.message}</p>
          )}
        </div>
      </form>

      {event && (
        <form
          action={deleteAction}
          onSubmit={(e) => {
            if (
              !confirm(
                zh
                  ? "确定要删除该活动吗？此操作不可撤销。"
                  : "Delete this event? This cannot be undone.",
              )
            ) {
              e.preventDefault();
            }
          }}
          className="mt-10 border-t border-grey-300 pt-6"
        >
          <input type="hidden" name="id" value={event.id} />
          <input type="hidden" name="locale" value={locale} />
          <AdminButton type="submit" variant="danger" disabled={deletePending}>
            {zh ? "删除活动" : "Delete event"}
          </AdminButton>
          {deleteState.status === "error" && (
            <p className="mt-3 text-small text-red-700">{deleteState.message}</p>
          )}
        </form>
      )}
    </>
  );
}
