"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { assertRole, type AppRole } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import type { TablesInsert, TablesUpdate } from "@/types/database.types";

export type NewsActionState = {
  status: "idle" | "error";
  message?: string;
};

const NEWS_ROLES: AppRole[] = ["admin", "editor"];

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .transform((v) => (v ? v : null));

const newsSchema = z.object({
  locale: z.enum(["zh", "en"]).catch("zh"),
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .min(1)
    .max(200)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  category_id: z
    .string()
    .trim()
    .transform((v) => (v ? Number(v) : null))
    .refine((v) => v === null || (Number.isInteger(v) && v > 0)),
  title_zh: optionalText(300),
  title_en: optionalText(300),
  summary_zh: optionalText(2000),
  summary_en: optionalText(2000),
  body_zh: optionalText(100000),
  body_en: optionalText(100000),
  author_name: optionalText(200),
  source_url: optionalText(1000).refine(
    (v) => v === null || /^https?:\/\/\S+$/.test(v),
  ),
  status: z.enum(["draft", "published", "archived"]),
  published_at: z
    .string()
    .trim()
    .transform((v) => {
      if (!v) return null;
      const d = new Date(v);
      return Number.isNaN(d.getTime()) ? null : d.toISOString();
    }),
  is_featured: z.boolean(),
});

function readFields(formData: FormData) {
  const text = (name: string) => {
    const value = formData.get(name);
    return typeof value === "string" ? value : "";
  };
  return {
    locale: text("locale") || "zh",
    slug: text("slug"),
    category_id: text("category_id"),
    title_zh: text("title_zh"),
    title_en: text("title_en"),
    summary_zh: text("summary_zh"),
    summary_en: text("summary_en"),
    body_zh: text("body_zh"),
    body_en: text("body_en"),
    author_name: text("author_name"),
    source_url: text("source_url"),
    status: text("status"),
    published_at: text("published_at"),
    is_featured: formData.get("is_featured") === "on",
  };
}

function invalidMessage(zh: boolean, field?: string): string {
  const suffix = field ? `: ${field}` : "";
  return zh ? `表单内容无效${suffix}` : `Invalid form data${suffix}`;
}

/**
 * Uploads a cover image to the 'media' bucket and records it in the media
 * table. Returns the storage path, or null when the upload failed.
 */
async function uploadCover(
  supabase: Awaited<ReturnType<typeof createClient>>,
  file: File,
  userId: string,
): Promise<string | null> {
  const safeName = (file.name || "image")
    .replace(/[^a-zA-Z0-9._-]+/g, "-")
    .slice(-100);
  const path = `news/${crypto.randomUUID()}-${safeName}`;
  const { error: uploadError } = await supabase.storage
    .from("media")
    .upload(path, file, { contentType: file.type || undefined });
  if (uploadError) return null;
  await supabase.from("media").insert({
    bucket: "media",
    storage_path: path,
    file_name: file.name || safeName,
    mime_type: file.type || null,
    created_by: userId,
  });
  return path;
}

function getCoverFile(formData: FormData): File | null {
  const file = formData.get("cover_image");
  if (file instanceof File && file.size > 0) return file;
  return null;
}

export async function createNews(
  _prev: NewsActionState,
  formData: FormData,
): Promise<NewsActionState> {
  const session = await assertRole(NEWS_ROLES);
  const raw = readFields(formData);
  const zh = raw.locale !== "en";

  const parsed = newsSchema.safeParse(raw);
  if (!parsed.success) {
    const field = parsed.error.issues[0]?.path.join(".");
    return { status: "error", message: invalidMessage(zh, field) };
  }
  const data = parsed.data;

  const supabase = await createClient();

  let coverImagePath: string | null = null;
  const cover = getCoverFile(formData);
  if (cover) {
    if (!cover.type.startsWith("image/")) {
      return {
        status: "error",
        message: zh ? "封面必须是图片文件" : "Cover must be an image file",
      };
    }
    coverImagePath = await uploadCover(supabase, cover, session.userId);
    if (!coverImagePath) {
      return {
        status: "error",
        message: zh ? "封面图片上传失败" : "Cover image upload failed",
      };
    }
  }

  const payload: TablesInsert<"news"> = {
    slug: data.slug,
    category_id: data.category_id,
    title_zh: data.title_zh,
    title_en: data.title_en,
    summary_zh: data.summary_zh,
    summary_en: data.summary_en,
    body_zh: data.body_zh,
    body_en: data.body_en,
    author_name: data.author_name,
    source_url: data.source_url,
    status: data.status,
    published_at: data.published_at,
    is_featured: data.is_featured,
    cover_image_path: coverImagePath,
    created_by: session.userId,
  };

  const { error } = await supabase.from("news").insert(payload);
  if (error) {
    if (error.code === "23505") {
      return {
        status: "error",
        message: zh ? "该 slug 已存在" : "This slug already exists",
      };
    }
    return {
      status: "error",
      message: zh ? "保存失败，请重试" : "Save failed, please try again",
    };
  }

  revalidatePath("/", "layout");
  redirect(`/${data.locale}/admin/news`);
}

export async function updateNews(
  _prev: NewsActionState,
  formData: FormData,
): Promise<NewsActionState> {
  const session = await assertRole(NEWS_ROLES);
  const raw = readFields(formData);
  const zh = raw.locale !== "en";

  const id = Number(formData.get("id"));
  if (!Number.isInteger(id) || id <= 0) {
    return { status: "error", message: invalidMessage(zh, "id") };
  }

  const parsed = newsSchema.safeParse(raw);
  if (!parsed.success) {
    const field = parsed.error.issues[0]?.path.join(".");
    return { status: "error", message: invalidMessage(zh, field) };
  }
  const data = parsed.data;

  const supabase = await createClient();

  const payload: TablesUpdate<"news"> = {
    slug: data.slug,
    category_id: data.category_id,
    title_zh: data.title_zh,
    title_en: data.title_en,
    summary_zh: data.summary_zh,
    summary_en: data.summary_en,
    body_zh: data.body_zh,
    body_en: data.body_en,
    author_name: data.author_name,
    source_url: data.source_url,
    status: data.status,
    published_at: data.published_at,
    is_featured: data.is_featured,
    updated_at: new Date().toISOString(),
  };

  const cover = getCoverFile(formData);
  if (cover) {
    if (!cover.type.startsWith("image/")) {
      return {
        status: "error",
        message: zh ? "封面必须是图片文件" : "Cover must be an image file",
      };
    }
    const uploaded = await uploadCover(supabase, cover, session.userId);
    if (!uploaded) {
      return {
        status: "error",
        message: zh ? "封面图片上传失败" : "Cover image upload failed",
      };
    }
    payload.cover_image_path = uploaded;
  }

  const { error } = await supabase.from("news").update(payload).eq("id", id);
  if (error) {
    if (error.code === "23505") {
      return {
        status: "error",
        message: zh ? "该 slug 已存在" : "This slug already exists",
      };
    }
    return {
      status: "error",
      message: zh ? "保存失败，请重试" : "Save failed, please try again",
    };
  }

  revalidatePath("/", "layout");
  redirect(`/${data.locale}/admin/news`);
}

export async function deleteNews(formData: FormData): Promise<void> {
  await assertRole(NEWS_ROLES);
  const locale = formData.get("locale") === "en" ? "en" : "zh";
  const id = Number(formData.get("id"));
  if (!Number.isInteger(id) || id <= 0) {
    redirect(`/${locale}/admin/news`);
  }

  const supabase = await createClient();
  await supabase.from("news").delete().eq("id", id);

  revalidatePath("/", "layout");
  redirect(`/${locale}/admin/news`);
}
