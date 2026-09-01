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
  // vision
  vision_zh: z.string().trim().max(1000),
  vision_en: z.string().trim().max(1000),
  // revenue note
  revenue_note_zh: z.string().trim().max(1000),
  revenue_note_en: z.string().trim().max(1000),
  // member benefits (textareas, one item per line)
  member_benefits_zh: z.string().max(5000),
  member_benefits_en: z.string().max(5000),
});

const benefitItemSchema = z.object({
  text_zh: z.string().max(1000),
  text_en: z.string().max(1000),
});

const pillarSchema = z.object({
  title_zh: z.string().trim().max(200),
  title_en: z.string().trim().max(200),
  text_zh: z.string().trim().max(1000),
  text_en: z.string().trim().max(1000),
});

const bannerSchema = z.object({
  key: z
    .string()
    .trim()
    .max(50)
    .regex(/^[a-z0-9-]*$/),
  title_zh: z.string().trim().max(200),
  title_en: z.string().trim().max(200),
  text_zh: z.string().trim().max(1000),
  text_en: z.string().trim().max(1000),
  cta_label_zh: z.string().trim().max(200),
  cta_label_en: z.string().trim().max(200),
  cta_href: z.string().trim().max(300),
  image_path: z.string().trim().max(300),
  is_active: z.boolean(),
});

function field(formData: FormData, name: string): FormDataEntryValue {
  return formData.get(name) ?? "";
}

/**
 * Zip the zh/en benefit textareas into aligned items: one item per line,
 * matched by line index; the shorter side is padded with "".
 */
function zipBenefitItems(zhText: string, enText: string) {
  const toItemLines = (value: string) => {
    const lines = value.split(/\r?\n/).map((line) => line.trim());
    while (lines.length > 0 && lines[lines.length - 1] === "") lines.pop();
    return lines;
  };
  const zhLines = toItemLines(zhText);
  const enLines = toItemLines(enText);
  const count = Math.max(zhLines.length, enLines.length);
  const items: { text_zh: string; text_en: string }[] = [];
  for (let i = 0; i < count; i += 1) {
    const text_zh = zhLines[i] ?? "";
    const text_en = enLines[i] ?? "";
    if (text_zh || text_en) items.push({ text_zh, text_en });
  }
  return items;
}

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
    vision_zh: field(formData, "vision_zh"),
    vision_en: field(formData, "vision_en"),
    revenue_note_zh: field(formData, "revenue_note_zh"),
    revenue_note_en: field(formData, "revenue_note_en"),
    member_benefits_zh: field(formData, "member_benefits_zh"),
    member_benefits_en: field(formData, "member_benefits_en"),
  });
  const pillars = z
    .array(pillarSchema)
    .length(4)
    .safeParse(
      [1, 2, 3, 4].map((index) => ({
        title_zh: field(formData, `pillar_${index}_title_zh`),
        title_en: field(formData, `pillar_${index}_title_en`),
        text_zh: field(formData, `pillar_${index}_text_zh`),
        text_en: field(formData, `pillar_${index}_text_en`),
      })),
    );
  const banners = z
    .array(bannerSchema)
    .length(3)
    .safeParse(
      [1, 2, 3].map((index) => ({
        key: field(formData, `banner_${index}_key`),
        title_zh: field(formData, `banner_${index}_title_zh`),
        title_en: field(formData, `banner_${index}_title_en`),
        text_zh: field(formData, `banner_${index}_text_zh`),
        text_en: field(formData, `banner_${index}_text_en`),
        cta_label_zh: field(formData, `banner_${index}_cta_label_zh`),
        cta_label_en: field(formData, `banner_${index}_cta_label_en`),
        cta_href: field(formData, `banner_${index}_cta_href`),
        image_path: field(formData, `banner_${index}_image_path`),
        is_active: formData.get(`banner_${index}_is_active`) === "on",
      })),
    );
  const memberBenefits = parsed.success
    ? z
        .array(benefitItemSchema)
        .safeParse(
          zipBenefitItems(
            parsed.data.member_benefits_zh,
            parsed.data.member_benefits_en,
          ),
        )
    : undefined;
  if (
    !parsed.success ||
    !pillars.success ||
    !banners.success ||
    !memberBenefits?.success
  ) {
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
      {
        key: "vision",
        value: {
          text_zh: v.vision_zh,
          text_en: v.vision_en,
        },
      },
      {
        key: "revenue_note",
        value: {
          text_zh: v.revenue_note_zh,
          text_en: v.revenue_note_en,
        },
      },
      {
        key: "member_benefits",
        value: { items: memberBenefits.data },
      },
      {
        key: "pillars",
        value: { items: pillars.data },
      },
      {
        key: "banners",
        value: { items: banners.data },
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
