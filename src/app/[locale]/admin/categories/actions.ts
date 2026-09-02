"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { assertRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export type ActionState = { status: "idle" | "error"; message?: string };

const categorySchema = z.object({
  slug: z
    .string()
    .trim()
    .min(1)
    .max(100)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  name_zh: z.string().trim().min(1).max(200),
  name_en: z.string().trim().min(1).max(200),
  display_order: z.coerce.number().int().min(0).max(9999),
  // false = legacy category: never a first-level tab; its articles stay
  // published, marked "历史分类待整理" (column from migration 20260902122000).
  is_active: z.boolean(),
});

const idSchema = z.coerce.number().int().positive();

function getLocale(formData: FormData): "zh" | "en" {
  return formData.get("locale") === "en" ? "en" : "zh";
}

function parseFields(formData: FormData) {
  return categorySchema.safeParse({
    slug: formData.get("slug"),
    name_zh: formData.get("name_zh"),
    name_en: formData.get("name_en"),
    display_order: formData.get("display_order") || 0,
    is_active: formData.get("is_active") === "on",
  });
}

function saveErrorMessage(zh: boolean, code?: string) {
  if (code === "23505") {
    return zh ? "该 slug 已存在。" : "This slug is already in use.";
  }
  return zh ? "保存失败，请稍后再试。" : "Save failed. Please try again.";
}

type CategoryFields = z.infer<typeof categorySchema>;
type WriteResult = { error: { code?: string; message: string } | null };

/**
 * Writes the row; if the project has not yet applied migration
 * 20260902122000 (no `is_active` column: Postgres 42703 undefined_column),
 * an active category is retried without the flag (the default), while
 * marking a category as legacy is refused with an explanatory message.
 */
async function writeCategory(
  zh: boolean,
  data: CategoryFields,
  write: (payload: Partial<CategoryFields>) => PromiseLike<WriteResult>,
): Promise<string | null> {
  const { error } = await write(data);
  if (!error) return null;
  const missingColumn =
    error.code === "42703" || /is_active/.test(error.message ?? "");
  if (!missingColumn) return saveErrorMessage(zh, error.code);
  if (!data.is_active) {
    return zh
      ? "「历史分类」功能需要先应用迁移 20260902122000（news_categories.is_active）。"
      : "Marking a category as legacy requires migration 20260902122000 (news_categories.is_active) to be applied first.";
  }
  const { is_active: _omitted, ...withoutFlag } = data;
  void _omitted;
  const retry = await write(withoutFlag);
  return retry.error ? saveErrorMessage(zh, retry.error.code) : null;
}

export async function createCategory(
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
  const message = await writeCategory(zh, parsed.data, (payload) =>
    supabase.from("news_categories").insert(payload as CategoryFields),
  );
  if (message) return { status: "error", message };

  revalidatePath("/", "layout");
  redirect(`/${locale}/admin/categories`);
}

export async function updateCategory(
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
  const message = await writeCategory(zh, parsed.data, (payload) =>
    supabase.from("news_categories").update(payload).eq("id", id.data),
  );
  if (message) return { status: "error", message };

  revalidatePath("/", "layout");
  redirect(`/${locale}/admin/categories`);
}

export async function deleteCategory(
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
    .from("news_categories")
    .delete()
    .eq("id", id.data);
  if (error) {
    return {
      status: "error",
      message: zh ? "删除失败，请稍后再试。" : "Delete failed. Please try again.",
    };
  }

  revalidatePath("/", "layout");
  redirect(`/${locale}/admin/categories`);
}
