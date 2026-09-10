"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { assertRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export type ActionState = { status: "idle" | "error"; message?: string };

const chapterSchema = z.object({
  slug: z
    .string()
    .trim()
    .min(1)
    .max(100)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  name_zh: z.string().trim().min(1).max(200),
  name_en: z.string().trim().min(1).max(200),
  tagline_zh: z.string().trim().max(300),
  tagline_en: z.string().trim().max(300),
  description_zh: z.string().trim().max(5000),
  description_en: z.string().trim().max(5000),
  resources_zh: z.string().trim().max(3000),
  resources_en: z.string().trim().max(3000),
  experts_zh: z.string().trim().max(3000),
  experts_en: z.string().trim().max(3000),
  certifications_zh: z.string().trim().max(3000),
  certifications_en: z.string().trim().max(3000),
  services_zh: z.string().trim().max(3000),
  services_en: z.string().trim().max(3000),
  secretary_general: z.string().trim().max(200),
  deputy_secretary_general: z.string().trim().max(200),
  contact_email: z.string().trim().email().max(320).optional().or(z.literal("")),
  display_order: z.coerce.number().int().min(0).max(9999),
});

/** Textarea → one list item per non-empty line. */
function toLines(value: string): string[] {
  return value
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
}

const idSchema = z.coerce.number().int().positive();

function getLocale(formData: FormData): "zh" | "en" {
  return formData.get("locale") === "en" ? "en" : "zh";
}

function parseFields(formData: FormData) {
  return chapterSchema.safeParse({
    slug: formData.get("slug"),
    name_zh: formData.get("name_zh"),
    name_en: formData.get("name_en"),
    tagline_zh: formData.get("tagline_zh") ?? "",
    tagline_en: formData.get("tagline_en") ?? "",
    description_zh: formData.get("description_zh") ?? "",
    description_en: formData.get("description_en") ?? "",
    resources_zh: formData.get("resources_zh") ?? "",
    resources_en: formData.get("resources_en") ?? "",
    experts_zh: formData.get("experts_zh") ?? "",
    experts_en: formData.get("experts_en") ?? "",
    certifications_zh: formData.get("certifications_zh") ?? "",
    certifications_en: formData.get("certifications_en") ?? "",
    services_zh: formData.get("services_zh") ?? "",
    services_en: formData.get("services_en") ?? "",
    secretary_general: formData.get("secretary_general") ?? "",
    deputy_secretary_general: formData.get("deputy_secretary_general") ?? "",
    contact_email: formData.get("contact_email") ?? "",
    display_order: formData.get("display_order") || 0,
  });
}

function toRecord(
  d: z.infer<typeof chapterSchema>,
  isActive: boolean,
) {
  return {
    slug: d.slug,
    name_zh: d.name_zh,
    name_en: d.name_en,
    tagline_zh: d.tagline_zh || null,
    tagline_en: d.tagline_en || null,
    description_zh: d.description_zh || null,
    description_en: d.description_en || null,
    resources_zh: toLines(d.resources_zh),
    resources_en: toLines(d.resources_en),
    experts_zh: toLines(d.experts_zh),
    experts_en: toLines(d.experts_en),
    certifications_zh: toLines(d.certifications_zh),
    certifications_en: toLines(d.certifications_en),
    services_zh: toLines(d.services_zh),
    services_en: toLines(d.services_en),
    secretary_general: d.secretary_general || null,
    deputy_secretary_general: d.deputy_secretary_general || null,
    contact_email: d.contact_email ? d.contact_email.toLowerCase() : null,
    display_order: d.display_order,
    is_active: isActive,
  };
}

type ChapterRecord = ReturnType<typeof toRecord>;

/** Columns added by supabase/migrations/20260902120000_application_form_v2.sql,
 *  which is not applied to production yet; they are absent from the
 *  generated types, hence the casts below. */
const PENDING_COLUMNS = [
  "experts_zh",
  "experts_en",
  "certifications_zh",
  "certifications_en",
  "deputy_secretary_general",
] as const;

type PendingColumn = (typeof PENDING_COLUMNS)[number];
type BaseRecord = Omit<ChapterRecord, PendingColumn>;

function withoutPendingColumns(record: ChapterRecord): BaseRecord {
  const copy: Partial<ChapterRecord> = { ...record };
  for (const key of PENDING_COLUMNS) delete copy[key];
  return copy as BaseRecord;
}

/** PostgREST rejects unknown payload keys with PGRST204 (schema cache);
 *  Postgres itself reports a missing column as 42703. */
function isUndefinedColumn(code: string | undefined): boolean {
  return code === "42703" || code === "PGRST204";
}

/**
 * Pre-migration fallback: production still lacks the experts_* /
 * certifications_* / deputy_secretary_general columns. The full record is written first; if the
 * database rejects it for an undefined column, the write is retried once
 * without those keys so editors can keep saving every other field. Once
 * the migration is applied the first attempt succeeds and nothing is lost.
 */
async function writeChapter(
  supabase: Awaited<ReturnType<typeof createClient>>,
  record: ChapterRecord,
  id?: number,
) {
  const run = async (values: BaseRecord) => {
    const query =
      id === undefined
        ? supabase.from("industry_chapters").insert(values)
        : supabase.from("industry_chapters").update(values).eq("id", id);
    const { error } = await query;
    return error;
  };
  const error = await run(record as BaseRecord);
  if (error && isUndefinedColumn(error.code)) {
    return run(withoutPendingColumns(record));
  }
  return error;
}

function saveErrorMessage(zh: boolean, code?: string) {
  if (code === "23505") {
    return zh ? "该 slug 已存在。" : "This slug is already in use.";
  }
  return zh ? "保存失败，请稍后再试。" : "Save failed. Please try again.";
}

export async function createChapter(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await assertRole(["admin", "editor"]);
  const locale = getLocale(formData);
  const zh = locale === "zh";

  const parsed = parseFields(formData);
  if (!parsed.success) {
    return {
      status: "error",
      message: zh ? "请检查表单内容。" : "Please check the form fields.",
    };
  }

  const supabase = await createClient();
  const error = await writeChapter(
    supabase,
    toRecord(parsed.data, formData.get("is_active") === "on"),
  );
  if (error) {
    return { status: "error", message: saveErrorMessage(zh, error.code) };
  }

  revalidatePath("/", "layout");
  redirect(`/${locale}/admin/chapters`);
}

export async function updateChapter(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await assertRole(["admin", "editor"]);
  const locale = getLocale(formData);
  const zh = locale === "zh";

  const id = idSchema.safeParse(formData.get("id"));
  const parsed = parseFields(formData);
  if (!id.success || !parsed.success) {
    return {
      status: "error",
      message: zh ? "请检查表单内容。" : "Please check the form fields.",
    };
  }

  const supabase = await createClient();
  const error = await writeChapter(
    supabase,
    toRecord(parsed.data, formData.get("is_active") === "on"),
    id.data,
  );
  if (error) {
    return { status: "error", message: saveErrorMessage(zh, error.code) };
  }

  revalidatePath("/", "layout");
  redirect(`/${locale}/admin/chapters`);
}

export async function deleteChapter(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await assertRole(["admin", "editor"]);
  const locale = getLocale(formData);
  const zh = locale === "zh";

  const id = idSchema.safeParse(formData.get("id"));
  if (!id.success) {
    return { status: "error", message: zh ? "删除失败。" : "Delete failed." };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("industry_chapters")
    .delete()
    .eq("id", id.data);
  if (error) {
    return {
      status: "error",
      message: zh ? "删除失败，请稍后再试。" : "Delete failed. Please try again.",
    };
  }

  revalidatePath("/", "layout");
  redirect(`/${locale}/admin/chapters`);
}
