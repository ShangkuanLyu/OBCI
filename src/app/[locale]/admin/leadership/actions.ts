"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { assertRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export type ActionState = { status: "idle" | "error"; message?: string };

const GROUP_KEYS = [
  "president",
  "honorary_chairman",
  "vice_chair",
  "advisor",
  "secretariat",
] as const;

const leadershipSchema = z.object({
  name_zh: z.string().trim().min(1).max(200),
  name_en: z.string().trim().min(1).max(200),
  title_zh: z.string().trim().min(1).max(200),
  title_en: z.string().trim().min(1).max(200),
  bio_zh: z.string().trim().max(5000),
  bio_en: z.string().trim().max(5000),
  group_key: z.enum(GROUP_KEYS),
  display_order: z.coerce.number().int().min(0).max(9999),
});

const idSchema = z.coerce.number().int().positive();

const MAX_PORTRAIT_BYTES = 5 * 1024 * 1024;

function getLocale(formData: FormData): "zh" | "en" {
  return formData.get("locale") === "en" ? "en" : "zh";
}

function parseFields(formData: FormData) {
  return leadershipSchema.safeParse({
    name_zh: formData.get("name_zh"),
    name_en: formData.get("name_en"),
    title_zh: formData.get("title_zh"),
    title_en: formData.get("title_en"),
    bio_zh: formData.get("bio_zh") ?? "",
    bio_en: formData.get("bio_en") ?? "",
    group_key: formData.get("group_key"),
    display_order: formData.get("display_order") || 0,
  });
}

async function uploadPortrait(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  file: File,
): Promise<{ path: string } | { error: true }> {
  if (!file.type.startsWith("image/") || file.size > MAX_PORTRAIT_BYTES) {
    return { error: true };
  }
  const safeName = file.name.replace(/[^\w.\-一-鿿]/g, "_").slice(-80);
  const path = `leadership/${crypto.randomUUID()}-${safeName}`;
  const { error: uploadError } = await supabase.storage
    .from("media")
    .upload(path, file, { contentType: file.type });
  if (uploadError) return { error: true };
  const { error: mediaError } = await supabase.from("media").insert({
    bucket: "media",
    storage_path: path,
    file_name: file.name.slice(0, 200),
    mime_type: file.type,
    created_by: userId,
  });
  if (mediaError) return { error: true };
  return { path };
}

export async function createLeadership(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await assertRole(["admin", "editor"]);
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

  let portraitPath: string | null = null;
  const portrait = formData.get("portrait");
  if (portrait instanceof File && portrait.size > 0) {
    const uploaded = await uploadPortrait(supabase, session.userId, portrait);
    if ("error" in uploaded) {
      return {
        status: "error",
        message: zh
          ? "肖像上传失败，请使用 5MB 以内的图片。"
          : "Portrait upload failed — use an image under 5MB.",
      };
    }
    portraitPath = uploaded.path;
  }

  const d = parsed.data;
  const { error } = await supabase.from("leadership").insert({
    name_zh: d.name_zh,
    name_en: d.name_en,
    title_zh: d.title_zh,
    title_en: d.title_en,
    bio_zh: d.bio_zh || null,
    bio_en: d.bio_en || null,
    group_key: d.group_key,
    display_order: d.display_order,
    is_active: formData.get("is_active") === "on",
    portrait_path: portraitPath,
  });
  if (error) {
    return {
      status: "error",
      message: zh ? "保存失败，请稍后再试。" : "Save failed. Please try again.",
    };
  }

  revalidatePath("/", "layout");
  redirect(`/${locale}/admin/leadership`);
}

export async function updateLeadership(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const session = await assertRole(["admin", "editor"]);
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

  let portraitPath: string | null = null;
  const portrait = formData.get("portrait");
  if (portrait instanceof File && portrait.size > 0) {
    const uploaded = await uploadPortrait(supabase, session.userId, portrait);
    if ("error" in uploaded) {
      return {
        status: "error",
        message: zh
          ? "肖像上传失败，请使用 5MB 以内的图片。"
          : "Portrait upload failed — use an image under 5MB.",
      };
    }
    portraitPath = uploaded.path;
  }

  const d = parsed.data;
  const { error } = await supabase
    .from("leadership")
    .update({
      name_zh: d.name_zh,
      name_en: d.name_en,
      title_zh: d.title_zh,
      title_en: d.title_en,
      bio_zh: d.bio_zh || null,
      bio_en: d.bio_en || null,
      group_key: d.group_key,
      display_order: d.display_order,
      is_active: formData.get("is_active") === "on",
      ...(portraitPath ? { portrait_path: portraitPath } : {}),
    })
    .eq("id", id.data);
  if (error) {
    return {
      status: "error",
      message: zh ? "保存失败，请稍后再试。" : "Save failed. Please try again.",
    };
  }

  revalidatePath("/", "layout");
  redirect(`/${locale}/admin/leadership`);
}

export async function deleteLeadership(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await assertRole(["admin", "editor"]);
  const locale = getLocale(formData);
  const zh = locale === "zh";

  const id = idSchema.safeParse(formData.get("id"));
  if (!id.success) {
    return {
      status: "error",
      message: zh ? "删除失败。" : "Delete failed.",
    };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("leadership").delete().eq("id", id.data);
  if (error) {
    return {
      status: "error",
      message: zh ? "删除失败，请稍后再试。" : "Delete failed. Please try again.",
    };
  }

  revalidatePath("/", "layout");
  redirect(`/${locale}/admin/leadership`);
}
