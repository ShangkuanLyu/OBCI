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
  description_zh: z.string().trim().max(5000),
  description_en: z.string().trim().max(5000),
  secretary_general: z.string().trim().max(200),
  contact_email: z.string().trim().email().max(320).optional().or(z.literal("")),
  display_order: z.coerce.number().int().min(0).max(9999),
});

const idSchema = z.coerce.number().int().positive();

function getLocale(formData: FormData): "zh" | "en" {
  return formData.get("locale") === "en" ? "en" : "zh";
}

function parseFields(formData: FormData) {
  return chapterSchema.safeParse({
    slug: formData.get("slug"),
    name_zh: formData.get("name_zh"),
    name_en: formData.get("name_en"),
    description_zh: formData.get("description_zh") ?? "",
    description_en: formData.get("description_en") ?? "",
    secretary_general: formData.get("secretary_general") ?? "",
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
    description_zh: d.description_zh || null,
    description_en: d.description_en || null,
    secretary_general: d.secretary_general || null,
    contact_email: d.contact_email ? d.contact_email.toLowerCase() : null,
    display_order: d.display_order,
    is_active: isActive,
  };
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
  const { error } = await supabase
    .from("industry_chapters")
    .insert(toRecord(parsed.data, formData.get("is_active") === "on"));
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
  const { error } = await supabase
    .from("industry_chapters")
    .update(toRecord(parsed.data, formData.get("is_active") === "on"))
    .eq("id", id.data);
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
