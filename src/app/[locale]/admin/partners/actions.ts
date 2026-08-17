"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { assertRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export type ActionState = { status: "idle" | "error"; message?: string };

const KINDS = [
  "government",
  "chamber",
  "enterprise",
  "provincial",
  "media",
] as const;

const partnerSchema = z.object({
  name_zh: z.string().trim().min(1).max(200),
  name_en: z.string().trim().min(1).max(200),
  kind: z.enum(KINDS),
  region: z.string().trim().max(200),
  website: z.string().trim().max(300),
  display_order: z.coerce.number().int().min(0).max(9999),
});

const idSchema = z.coerce.number().int().positive();

function getLocale(formData: FormData): "zh" | "en" {
  return formData.get("locale") === "en" ? "en" : "zh";
}

function parseFields(formData: FormData) {
  return partnerSchema.safeParse({
    name_zh: formData.get("name_zh"),
    name_en: formData.get("name_en"),
    kind: formData.get("kind"),
    region: formData.get("region") ?? "",
    website: formData.get("website") ?? "",
    display_order: formData.get("display_order") || 0,
  });
}

function toRecord(d: z.infer<typeof partnerSchema>, isActive: boolean) {
  return {
    name_zh: d.name_zh,
    name_en: d.name_en,
    kind: d.kind,
    region: d.region || null,
    website: d.website || null,
    display_order: d.display_order,
    is_active: isActive,
  };
}

export async function createPartner(
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
    .from("partners")
    .insert(toRecord(parsed.data, formData.get("is_active") === "on"));
  if (error) {
    return {
      status: "error",
      message: zh ? "保存失败，请稍后再试。" : "Save failed. Please try again.",
    };
  }

  revalidatePath("/", "layout");
  redirect(`/${locale}/admin/partners`);
}

export async function updatePartner(
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
    .from("partners")
    .update(toRecord(parsed.data, formData.get("is_active") === "on"))
    .eq("id", id.data);
  if (error) {
    return {
      status: "error",
      message: zh ? "保存失败，请稍后再试。" : "Save failed. Please try again.",
    };
  }

  revalidatePath("/", "layout");
  redirect(`/${locale}/admin/partners`);
}

export async function deletePartner(
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
  const { error } = await supabase.from("partners").delete().eq("id", id.data);
  if (error) {
    return {
      status: "error",
      message: zh ? "删除失败，请稍后再试。" : "Delete failed. Please try again.",
    };
  }

  revalidatePath("/", "layout");
  redirect(`/${locale}/admin/partners`);
}
