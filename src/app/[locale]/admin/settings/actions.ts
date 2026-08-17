"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { assertRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export type SettingsActionState = {
  status: "idle" | "success" | "error";
  message?: string;
};

const settingsSchema = z.object({
  locale: z.enum(["zh", "en"]).default("zh"),
  // contact
  address_zh: z.string().trim().min(1).max(500),
  address_en: z.string().trim().min(1).max(500),
  phone: z.string().trim().min(1).max(50),
  email: z.string().trim().email().max(320),
  email_confirmed: z.boolean(),
  // identity
  name_zh: z.string().trim().min(1).max(200),
  name_en: z.string().trim().min(1).max(200),
  acronym: z.string().trim().min(1).max(20),
  tagline_zh: z.string().trim().min(1).max(300),
  tagline_en: z.string().trim().min(1).max(300),
  // membership
  review_days: z.coerce.number().int().min(0).max(365),
  fees_published: z.boolean(),
});

export async function saveSettings(
  _prev: SettingsActionState,
  formData: FormData,
): Promise<SettingsActionState> {
  await assertRole(["admin"]);

  const zh = (formData.get("locale") ?? "zh") === "zh";
  const parsed = settingsSchema.safeParse({
    locale: formData.get("locale") ?? "zh",
    address_zh: formData.get("address_zh"),
    address_en: formData.get("address_en"),
    phone: formData.get("phone"),
    email: formData.get("email"),
    email_confirmed: formData.get("email_confirmed") === "on",
    name_zh: formData.get("name_zh"),
    name_en: formData.get("name_en"),
    acronym: formData.get("acronym"),
    tagline_zh: formData.get("tagline_zh"),
    tagline_en: formData.get("tagline_en"),
    review_days: formData.get("review_days"),
    fees_published: formData.get("fees_published") === "on",
  });
  if (!parsed.success) {
    return {
      status: "error",
      message: zh
        ? "请检查填写内容后重试。"
        : "Please check the form values and try again.",
    };
  }

  const v = parsed.data;
  const supabase = await createClient();
  const { error } = await supabase.from("site_settings").upsert(
    [
      {
        key: "contact",
        value: {
          address_zh: v.address_zh,
          address_en: v.address_en,
          phone: v.phone,
          email: v.email,
          email_confirmed: v.email_confirmed,
        },
      },
      {
        key: "identity",
        value: {
          name_zh: v.name_zh,
          name_en: v.name_en,
          acronym: v.acronym,
          tagline_zh: v.tagline_zh,
          tagline_en: v.tagline_en,
        },
      },
      {
        key: "membership",
        value: {
          review_days: v.review_days,
          fees_published: v.fees_published,
        },
      },
    ],
    { onConflict: "key" },
  );
  if (error) {
    return {
      status: "error",
      message: zh ? `保存失败：${error.message}` : `Save failed: ${error.message}`,
    };
  }

  revalidatePath("/", "layout");
  return {
    status: "success",
    message: zh ? "设置已保存。" : "Settings saved.",
  };
}
