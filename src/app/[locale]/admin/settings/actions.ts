"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { assertRole } from "@/lib/auth";
import { CONTACT_FIELDS } from "@/lib/review";
import { createClient } from "@/lib/supabase/server";
import type { Json } from "@/types/database.types";

export type SettingsActionState = {
  status: "idle" | "success" | "error";
  message?: string;
};

/* A "use server" module may only export async functions, so the option
   lists below are mirrored (not imported) by SettingsForm — keep them in
   step. Contact fields come from lib/review.ts (CONTACT_FIELDS). */

/** Modules gated by site_settings.review.confirmed_modules. */
const REVIEW_MODULES = ["partners"] as const;

const ORG_UNIT_KINDS = [
  "leadership",
  "committee",
  "chapters",
  "secretariat",
  "other",
] as const;

const CORE_VALUE_SLOTS = 4;
const ORG_UNIT_SLOTS = 6;
const GALLERY_SLOTS = 8;

const slug = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .regex(/^[a-z0-9-]*$/);

/* Contact values may legitimately be empty (a chamber need not publish
   every channel); "" is stored as "" so the merged row keeps its keys. */
const address = z.string().trim().max(500);
const label = z.string().trim().max(200);
const phoneNumber = z.string().trim().max(50);

const settingsSchema = z.object({
  locale: z.enum(["zh", "en"]).default("zh"),
  // contact
  address_label_zh: label,
  address_label_en: label,
  address_zh: address,
  address_en: address,
  address2_label_zh: label,
  address2_label_en: label,
  address2_zh: address,
  address2_en: address,
  phone: phoneNumber,
  fax: phoneNumber,
  mobile: phoneNumber,
  email: z
    .string()
    .trim()
    .max(320)
    .refine((value) => value === "" || z.regexes.email.test(value)),
  wechat_zh: label,
  wechat_en: label,
  membership_contact_name: label,
  membership_contact_phone: phoneNumber,
  contact_confirmed: z.array(z.enum(CONTACT_FIELDS)),
  // identity
  name_zh: z.string().trim().min(1).max(200),
  name_en: z.string().trim().min(1).max(200),
  acronym: z.string().trim().min(1).max(20),
  tagline_zh: z.string().trim().min(1).max(300),
  tagline_en: z.string().trim().min(1).max(300),
  // membership
  review_days: z.coerce.number().int().min(0).max(365),
  fees_published: z.boolean(),
  validity_note_zh: z.string().trim().max(500),
  validity_note_en: z.string().trim().max(500),
  // vision / mission
  vision_zh: z.string().trim().max(1000),
  vision_en: z.string().trim().max(1000),
  mission_zh: z.string().trim().max(1000),
  mission_en: z.string().trim().max(1000),
  // revenue note
  revenue_note_zh: z.string().trim().max(1000),
  revenue_note_en: z.string().trim().max(1000),
  // member benefits (textareas, one item per line)
  member_benefits_zh: z.string().max(5000),
  member_benefits_en: z.string().max(5000),
  // strategy committee / secretariat descriptions
  strategy_committee_zh: z.string().trim().max(2000),
  strategy_committee_en: z.string().trim().max(2000),
  secretariat_zh: z.string().trim().max(2000),
  secretariat_en: z.string().trim().max(2000),
  // review gates
  review_confirmed: z.array(z.enum(REVIEW_MODULES)),
  // approved legal-text versions (empty = not approved)
  constitution_version: z.string().trim().max(50),
  terms_version: z.string().trim().max(50),
  privacy_version: z.string().trim().max(50),
});

const benefitItemSchema = z.object({
  text_zh: z.string().max(1000),
  text_en: z.string().max(1000),
});

const titledItemSchema = z.object({
  title_zh: z.string().trim().max(200),
  title_en: z.string().trim().max(200),
  text_zh: z.string().trim().max(1000),
  text_en: z.string().trim().max(1000),
});

const orgUnitSchema = z.object({
  key: slug(50),
  kind: z.enum(ORG_UNIT_KINDS),
  name_zh: z.string().trim().max(200),
  name_en: z.string().trim().max(200),
  note_zh: z.string().trim().max(500),
  note_en: z.string().trim().max(500),
});

const galleryItemSchema = z.object({
  image_path: z.string().trim().max(300),
  news_slug: slug(200),
  event_slug: slug(200),
  caption_zh: z.string().trim().max(300),
  caption_en: z.string().trim().max(300),
});

const bannerSchema = z.object({
  key: slug(50),
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

function stringList(formData: FormData, name: string): string[] {
  return formData
    .getAll(name)
    .filter((entry): entry is string => typeof entry === "string");
}

function slots(count: number): number[] {
  return Array.from({ length: count }, (_, index) => index + 1);
}

function asRecord(value: Json | undefined): Record<string, Json | undefined> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, Json | undefined>)
    : {};
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
    address_label_zh: field(formData, "address_label_zh"),
    address_label_en: field(formData, "address_label_en"),
    address_zh: field(formData, "address_zh"),
    address_en: field(formData, "address_en"),
    address2_label_zh: field(formData, "address2_label_zh"),
    address2_label_en: field(formData, "address2_label_en"),
    address2_zh: field(formData, "address2_zh"),
    address2_en: field(formData, "address2_en"),
    phone: field(formData, "phone"),
    fax: field(formData, "fax"),
    mobile: field(formData, "mobile"),
    email: field(formData, "email"),
    wechat_zh: field(formData, "wechat_zh"),
    wechat_en: field(formData, "wechat_en"),
    membership_contact_name: field(formData, "membership_contact_name"),
    membership_contact_phone: field(formData, "membership_contact_phone"),
    contact_confirmed: stringList(formData, "contact_confirmed"),
    name_zh: formData.get("name_zh"),
    name_en: formData.get("name_en"),
    acronym: formData.get("acronym"),
    tagline_zh: formData.get("tagline_zh"),
    tagline_en: formData.get("tagline_en"),
    review_days: formData.get("review_days"),
    fees_published: formData.get("fees_published") === "on",
    validity_note_zh: field(formData, "validity_note_zh"),
    validity_note_en: field(formData, "validity_note_en"),
    vision_zh: field(formData, "vision_zh"),
    vision_en: field(formData, "vision_en"),
    mission_zh: field(formData, "mission_zh"),
    mission_en: field(formData, "mission_en"),
    revenue_note_zh: field(formData, "revenue_note_zh"),
    revenue_note_en: field(formData, "revenue_note_en"),
    member_benefits_zh: field(formData, "member_benefits_zh"),
    member_benefits_en: field(formData, "member_benefits_en"),
    strategy_committee_zh: field(formData, "strategy_committee_zh"),
    strategy_committee_en: field(formData, "strategy_committee_en"),
    secretariat_zh: field(formData, "secretariat_zh"),
    secretariat_en: field(formData, "secretariat_en"),
    review_confirmed: stringList(formData, "review_confirmed"),
    constitution_version: field(formData, "constitution_version"),
    terms_version: field(formData, "terms_version"),
    privacy_version: field(formData, "privacy_version"),
  });
  const pillars = z
    .array(titledItemSchema)
    .length(4)
    .safeParse(
      slots(4).map((index) => ({
        title_zh: field(formData, `pillar_${index}_title_zh`),
        title_en: field(formData, `pillar_${index}_title_en`),
        text_zh: field(formData, `pillar_${index}_text_zh`),
        text_en: field(formData, `pillar_${index}_text_en`),
      })),
    );
  const coreValues = z
    .array(titledItemSchema)
    .length(CORE_VALUE_SLOTS)
    .safeParse(
      slots(CORE_VALUE_SLOTS).map((index) => ({
        title_zh: field(formData, `value_${index}_title_zh`),
        title_en: field(formData, `value_${index}_title_en`),
        text_zh: field(formData, `value_${index}_text_zh`),
        text_en: field(formData, `value_${index}_text_en`),
      })),
    );
  const orgUnits = z
    .array(orgUnitSchema)
    .length(ORG_UNIT_SLOTS)
    .safeParse(
      slots(ORG_UNIT_SLOTS).map((index) => ({
        key: field(formData, `org_${index}_key`),
        kind: formData.get(`org_${index}_kind`) ?? "other",
        name_zh: field(formData, `org_${index}_name_zh`),
        name_en: field(formData, `org_${index}_name_en`),
        note_zh: field(formData, `org_${index}_note_zh`),
        note_en: field(formData, `org_${index}_note_en`),
      })),
    );
  const gallery = z
    .array(galleryItemSchema)
    .length(GALLERY_SLOTS)
    .safeParse(
      slots(GALLERY_SLOTS).map((index) => ({
        image_path: field(formData, `gallery_${index}_image_path`),
        news_slug: field(formData, `gallery_${index}_news_slug`),
        event_slug: field(formData, `gallery_${index}_event_slug`),
        caption_zh: field(formData, `gallery_${index}_caption_zh`),
        caption_en: field(formData, `gallery_${index}_caption_en`),
      })),
    );
  const banners = z
    .array(bannerSchema)
    .length(3)
    .safeParse(
      slots(3).map((index) => ({
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
    !coreValues.success ||
    !orgUnits.success ||
    !gallery.success ||
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

  // contact / identity / membership may carry keys this form does not edit
  // (abn, legacy flags, …): merge onto the stored objects so a save never
  // wipes them.
  const { data: existingRows, error: readError } = await supabase
    .from("site_settings")
    .select("key, value")
    .in("key", ["contact", "identity", "membership"]);
  if (readError) {
    return {
      status: "error",
      message: zh
        ? `读取现有设置失败：${readError.message}`
        : `Could not read existing settings: ${readError.message}`,
    };
  }
  const existing = (key: string) =>
    asRecord(existingRows?.find((row) => row.key === key)?.value);

  const confirmedFields = [...new Set(v.contact_confirmed)];
  const confirmedModules = [...new Set(v.review_confirmed)];

  const { error } = await supabase.from("site_settings").upsert(
    [
      {
        key: "contact",
        value: {
          ...existing("contact"),
          address_label_zh: v.address_label_zh,
          address_label_en: v.address_label_en,
          address_zh: v.address_zh,
          address_en: v.address_en,
          address2_label_zh: v.address2_label_zh,
          address2_label_en: v.address2_label_en,
          address2_zh: v.address2_zh,
          address2_en: v.address2_en,
          phone: v.phone,
          fax: v.fax,
          mobile: v.mobile,
          email: v.email,
          wechat_zh: v.wechat_zh,
          wechat_en: v.wechat_en,
          membership_contact_name: v.membership_contact_name,
          membership_contact_phone: v.membership_contact_phone,
          confirmed_fields: confirmedFields,
        },
      },
      {
        key: "identity",
        value: {
          ...existing("identity"),
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
          ...existing("membership"),
          review_days: v.review_days,
          fees_published: v.fees_published,
          validity_note_zh: v.validity_note_zh,
          validity_note_en: v.validity_note_en,
        },
      },
      {
        key: "vision",
        value: { text_zh: v.vision_zh, text_en: v.vision_en },
      },
      {
        key: "mission",
        value: { text_zh: v.mission_zh, text_en: v.mission_en },
      },
      {
        key: "core_values",
        value: { items: coreValues.data },
      },
      {
        key: "revenue_note",
        value: { text_zh: v.revenue_note_zh, text_en: v.revenue_note_en },
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
      {
        key: "org_structure",
        value: { items: orgUnits.data },
      },
      {
        key: "strategy_committee",
        value: {
          text_zh: v.strategy_committee_zh,
          text_en: v.strategy_committee_en,
        },
      },
      {
        key: "secretariat",
        value: { text_zh: v.secretariat_zh, text_en: v.secretariat_en },
      },
      {
        key: "gallery",
        value: { items: gallery.data },
      },
      {
        key: "review",
        value: { confirmed_modules: confirmedModules },
      },
      {
        key: "legal",
        value: {
          constitution_version: v.constitution_version,
          terms_version: v.terms_version,
          privacy_version: v.privacy_version,
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
