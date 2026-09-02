"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { assertRole, type AppRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

const EVENT_ROLES: AppRole[] = ["admin", "editor", "event_manager"];

export type EventActionState = {
  status: "idle" | "error";
  message?: string;
};

// datetime-local values: YYYY-MM-DDTHH:mm (some browsers append :ss)
const DATETIME_LOCAL = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2})?$/;
const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const eventSchema = z
  .object({
    locale: z.enum(["zh", "en"]),
    slug: z.string().trim().min(1).max(200).regex(SLUG_PATTERN),
    title_zh: z.string().trim().min(1).max(300),
    title_en: z.string().trim().max(300),
    summary_zh: z.string().trim().max(2000),
    summary_en: z.string().trim().max(2000),
    body_zh: z.string().trim().max(50000),
    body_en: z.string().trim().max(50000),
    location_zh: z.string().trim().max(300),
    location_en: z.string().trim().max(300),
    starts_at: z.string().regex(DATETIME_LOCAL),
    ends_at: z.string().regex(DATETIME_LOCAL).optional().or(z.literal("")),
    status: z.enum(["draft", "published", "archived"]),
    is_featured: z.boolean(),
    registration_open: z.boolean(),
    registration_url: z
      .string()
      .trim()
      .max(500)
      .refine((v) => v === "" || /^https?:\/\/\S+$/i.test(v)),
    capacity: z.coerce.number().int().min(1).max(1000000).optional(),
    // Industry chapter slugs (events.tags); the checkbox values come from
    // the active chapters, so only the slug shape is validated here.
    tags: z.array(z.string().trim().min(1).max(100).regex(SLUG_PATTERN)).max(20),
    tags_editable: z.boolean(),
  })
  .refine(
    (d) =>
      !d.ends_at || Date.parse(d.ends_at) >= Date.parse(d.starts_at),
    { path: ["ends_at"] },
  );

function readEventFields(formData: FormData) {
  const str = (name: string) => {
    const value = formData.get(name);
    return typeof value === "string" ? value : "";
  };
  return {
    locale: str("locale") === "en" ? "en" : "zh",
    slug: str("slug"),
    title_zh: str("title_zh"),
    title_en: str("title_en"),
    summary_zh: str("summary_zh"),
    summary_en: str("summary_en"),
    body_zh: str("body_zh"),
    body_en: str("body_en"),
    location_zh: str("location_zh"),
    location_en: str("location_en"),
    starts_at: str("starts_at"),
    ends_at: str("ends_at"),
    status: str("status"),
    is_featured: formData.get("is_featured") === "on",
    registration_open: formData.get("registration_open") === "on",
    registration_url: str("registration_url"),
    capacity: str("capacity") || undefined,
    tags: formData
      .getAll("tags")
      .filter((value): value is string => typeof value === "string"),
    tags_editable: formData.get("tags_editable") === "1",
  };
}

function validationMessage(error: z.ZodError, zh: boolean): string {
  const path = error.issues[0]?.path[0];
  if (path === "ends_at") {
    return zh
      ? "结束时间不能早于开始时间"
      : "End time must not be before start time";
  }
  if (path === "slug") {
    return zh
      ? "链接别名仅限小写字母、数字与连字符"
      : "Slug may only contain lowercase letters, numbers and hyphens";
  }
  if (path === "title_zh") {
    return zh ? "请填写中文标题" : "Chinese title is required";
  }
  if (path === "starts_at") {
    return zh ? "请填写开始时间" : "Start time is required";
  }
  if (path === "registration_url") {
    return zh
      ? "报名链接需以 http(s):// 开头"
      : "Registration URL must start with http(s)://";
  }
  if (path === "capacity") {
    return zh ? "名额需为正整数" : "Capacity must be a positive whole number";
  }
  if (path === "tags") {
    return zh ? "行业分会标签无效" : "Invalid industry chapter tag";
  }
  return zh
    ? "请检查表单内容后重试"
    : "Please check the form fields and try again";
}

function dbMessage(code: string | undefined, zh: boolean): string {
  if (code === "23505") {
    return zh ? "该链接别名已被使用" : "This slug is already in use";
  }
  if (code === "23503") {
    return zh
      ? "该活动已有关联记录（如报名），无法删除"
      : "Cannot delete: the event has linked records (e.g. registrations)";
  }
  return zh ? "保存失败，请重试" : "Save failed, please try again";
}

/** PostgREST rejects unknown payload keys with PGRST204 (schema cache);
 *  Postgres itself reports a missing column as 42703. */
function isUndefinedColumn(code: string | undefined): boolean {
  return code === "42703" || code === "PGRST204";
}

type WriteResult = PromiseLike<{
  error: { code: string; message: string } | null;
}>;

/**
 * Pre-migration fallback for `events.tags`: the column is added by
 * supabase/migrations/20260902120000_application_form_v2.sql, which is not
 * applied to production yet (and is absent from the generated types, hence
 * the cast). The write is attempted with tags first; if the database
 * rejects it for an undefined column it is retried once without them so
 * the rest of the event still saves. `tags` is undefined when the form was
 * rendered without the chapter checkboxes, in which case existing tags are
 * left untouched.
 */
async function writeWithTags<T extends object>(
  run: (values: T) => WriteResult,
  values: T,
  tags: string[] | undefined,
) {
  const { error } = await run(tags ? ({ ...values, tags } as T) : values);
  if (error && tags && isUndefinedColumn(error.code)) {
    return (await run(values)).error;
  }
  return error;
}

const ALLOWED_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);
const MAX_IMAGE_BYTES = 10 * 1024 * 1024;

async function uploadCover(
  supabase: Awaited<ReturnType<typeof createClient>>,
  formData: FormData,
  userId: string,
  zh: boolean,
): Promise<{ path: string | null; errorMessage?: string }> {
  const file = formData.get("cover_image");
  if (!(file instanceof File) || file.size === 0) return { path: null };
  if (file.size > MAX_IMAGE_BYTES || !ALLOWED_IMAGE_TYPES.has(file.type)) {
    return {
      path: null,
      errorMessage: zh
        ? "封面图片需为 JPG/PNG/WebP/GIF 且不超过 10MB"
        : "Cover image must be JPG/PNG/WebP/GIF and at most 10MB",
    };
  }
  const safeName = file.name.replace(/[^\w.\-一-鿿]/g, "_").slice(-100);
  const path = `events/${crypto.randomUUID()}-${safeName}`;
  const { error: uploadError } = await supabase.storage
    .from("media")
    .upload(path, file, { contentType: file.type });
  if (uploadError) {
    return {
      path: null,
      errorMessage: zh
        ? "封面图片上传失败，请重试"
        : "Cover image upload failed, please try again",
    };
  }
  await supabase.from("media").insert({
    bucket: "media",
    storage_path: path,
    file_name: file.name.slice(0, 200),
    mime_type: file.type,
    created_by: userId,
  });
  return { path };
}

export async function createEvent(
  _prev: EventActionState,
  formData: FormData,
): Promise<EventActionState> {
  const session = await assertRole(EVENT_ROLES);
  const raw = readEventFields(formData);
  const zh = raw.locale === "zh";
  const parsed = eventSchema.safeParse(raw);
  if (!parsed.success) {
    return { status: "error", message: validationMessage(parsed.error, zh) };
  }
  const d = parsed.data;

  const supabase = await createClient();
  const cover = await uploadCover(supabase, formData, session.userId, zh);
  if (cover.errorMessage) {
    return { status: "error", message: cover.errorMessage };
  }

  const error = await writeWithTags(
    (values) => supabase.from("events").insert(values),
    {
      slug: d.slug,
      title_zh: d.title_zh,
      title_en: d.title_en || null,
      summary_zh: d.summary_zh || null,
      summary_en: d.summary_en || null,
      body_zh: d.body_zh || null,
      body_en: d.body_en || null,
      location_zh: d.location_zh || null,
      location_en: d.location_en || null,
      starts_at: d.starts_at,
      ends_at: d.ends_at || null,
      status: d.status,
      is_featured: d.is_featured,
      registration_open: d.registration_open,
      registration_url: d.registration_url || null,
      capacity: d.capacity ?? null,
      cover_image_path: cover.path,
      created_by: session.userId,
    },
    d.tags_editable ? Array.from(new Set(d.tags)) : undefined,
  );
  if (error) {
    return { status: "error", message: dbMessage(error.code, zh) };
  }

  revalidatePath("/", "layout");
  redirect(`/${d.locale}/admin/events`);
}

export async function updateEvent(
  _prev: EventActionState,
  formData: FormData,
): Promise<EventActionState> {
  const session = await assertRole(EVENT_ROLES);
  const raw = readEventFields(formData);
  const zh = raw.locale === "zh";

  const id = Number(formData.get("id"));
  if (!Number.isInteger(id) || id <= 0) {
    return { status: "error", message: dbMessage(undefined, zh) };
  }

  const parsed = eventSchema.safeParse(raw);
  if (!parsed.success) {
    return { status: "error", message: validationMessage(parsed.error, zh) };
  }
  const d = parsed.data;

  const supabase = await createClient();
  const cover = await uploadCover(supabase, formData, session.userId, zh);
  if (cover.errorMessage) {
    return { status: "error", message: cover.errorMessage };
  }

  const error = await writeWithTags(
    (values) => supabase.from("events").update(values).eq("id", id),
    {
      slug: d.slug,
      title_zh: d.title_zh,
      title_en: d.title_en || null,
      summary_zh: d.summary_zh || null,
      summary_en: d.summary_en || null,
      body_zh: d.body_zh || null,
      body_en: d.body_en || null,
      location_zh: d.location_zh || null,
      location_en: d.location_en || null,
      starts_at: d.starts_at,
      ends_at: d.ends_at || null,
      status: d.status,
      is_featured: d.is_featured,
      registration_open: d.registration_open,
      registration_url: d.registration_url || null,
      capacity: d.capacity ?? null,
      updated_at: new Date().toISOString(),
      ...(cover.path ? { cover_image_path: cover.path } : {}),
    },
    d.tags_editable ? Array.from(new Set(d.tags)) : undefined,
  );
  if (error) {
    return { status: "error", message: dbMessage(error.code, zh) };
  }

  revalidatePath("/", "layout");
  redirect(`/${d.locale}/admin/events`);
}

export async function deleteEvent(
  _prev: EventActionState,
  formData: FormData,
): Promise<EventActionState> {
  await assertRole(EVENT_ROLES);
  const locale = formData.get("locale") === "en" ? "en" : "zh";
  const zh = locale === "zh";

  const id = Number(formData.get("id"));
  if (!Number.isInteger(id) || id <= 0) {
    return { status: "error", message: dbMessage(undefined, zh) };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("events").delete().eq("id", id);
  if (error) {
    return { status: "error", message: dbMessage(error.code, zh) };
  }

  revalidatePath("/", "layout");
  redirect(`/${locale}/admin/events`);
}
