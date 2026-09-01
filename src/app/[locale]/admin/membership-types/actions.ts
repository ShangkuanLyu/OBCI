"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { assertRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export type ActionState = { status: "idle" | "error"; message?: string };

const membershipTypeSchema = z.object({
  code: z
    .string()
    .trim()
    .min(1)
    .max(100)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  name_zh: z.string().trim().min(1).max(200),
  name_en: z.string().trim().min(1).max(200),
  turnover_zh: z.string().trim().max(300),
  turnover_en: z.string().trim().max(300),
  description_zh: z.string().trim().max(2000),
  description_en: z.string().trim().max(2000),
  benefits_zh: z.string().trim().max(5000),
  benefits_en: z.string().trim().max(5000),
  price_annual: z
    .literal("")
    .transform(() => null)
    .or(z.coerce.number().min(0).multipleOf(0.01)),
  currency: z
    .string()
    .trim()
    .regex(/^[A-Za-z]{3}$/)
    .transform((value) => value.toUpperCase()),
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
  return membershipTypeSchema.safeParse({
    code: formData.get("code"),
    name_zh: formData.get("name_zh"),
    name_en: formData.get("name_en"),
    turnover_zh: formData.get("turnover_zh") ?? "",
    turnover_en: formData.get("turnover_en") ?? "",
    description_zh: formData.get("description_zh") ?? "",
    description_en: formData.get("description_en") ?? "",
    benefits_zh: formData.get("benefits_zh") ?? "",
    benefits_en: formData.get("benefits_en") ?? "",
    price_annual: formData.get("price_annual") ?? "",
    currency: formData.get("currency") || "AUD",
    display_order: formData.get("display_order") || 0,
  });
}

function toRecord(
  d: z.infer<typeof membershipTypeSchema>,
  isPopular: boolean,
  isActive: boolean,
) {
  return {
    code: d.code,
    name_zh: d.name_zh,
    name_en: d.name_en,
    turnover_zh: d.turnover_zh || null,
    turnover_en: d.turnover_en || null,
    description_zh: d.description_zh || null,
    description_en: d.description_en || null,
    benefits_zh: toLines(d.benefits_zh),
    benefits_en: toLines(d.benefits_en),
    price_annual: d.price_annual,
    currency: d.currency,
    display_order: d.display_order,
    is_popular: isPopular,
    is_active: isActive,
  };
}

function saveErrorMessage(zh: boolean, code?: string) {
  if (code === "23505") {
    return zh ? "该代码已存在。" : "This code is already in use.";
  }
  return zh ? "保存失败，请稍后再试。" : "Save failed. Please try again.";
}

export async function createMembershipType(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await assertRole(["admin", "membership_manager"]);
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
  const { error } = await supabase.from("membership_types").insert(
    toRecord(
      parsed.data,
      formData.get("is_popular") === "on",
      formData.get("is_active") === "on",
    ),
  );
  if (error) {
    return { status: "error", message: saveErrorMessage(zh, error.code) };
  }

  revalidatePath("/", "layout");
  redirect(`/${locale}/admin/membership-types`);
}

export async function updateMembershipType(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  await assertRole(["admin", "membership_manager"]);
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
    .from("membership_types")
    .update(
      toRecord(
        parsed.data,
        formData.get("is_popular") === "on",
        formData.get("is_active") === "on",
      ),
    )
    .eq("id", id.data);
  if (error) {
    return { status: "error", message: saveErrorMessage(zh, error.code) };
  }

  revalidatePath("/", "layout");
  redirect(`/${locale}/admin/membership-types`);
}
