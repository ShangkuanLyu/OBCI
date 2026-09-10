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

/** Industry tags are chapter slugs (news.tags contains the chapter slug). */
const tagSchema = z
  .array(
    z
      .string()
      .trim()
      .toLowerCase()
      .regex(/^[a-z0-9-]+$/),
  )
  .max(50)
  .transform((tags) => Array.from(new Set(tags)));

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
  tags: tagSchema,
  tags_editable: z.boolean(),
});

function readFields(formData: FormData) {
  const text = (name: string) => {
    const value = formData.get(name);
    return typeof value === "string" ? value : "";
  };
  return {
    tags: formData
      .getAll("tags")
      .filter((value): value is string => typeof value === "string"),
    tags_editable: formData.get("tags_editable") === "1",
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

type Supabase = Awaited<ReturnType<typeof createClient>>;

/**
 * Raster formats the article renderer accepts (markdown-parse.mjs), mapped to
 * the file extension the stored object must carry: the renderer only resolves
 * image sources ending in one of these, so the extension is derived from the
 * validated MIME type rather than trusted from the uploaded file name (a
 * `.jfif` or extension-less photo would otherwise upload fine and then render
 * as literal text in the article body).
 */
const IMAGE_EXTENSIONS = new Map([
  ["image/jpeg", "jpg"],
  ["image/png", "png"],
  ["image/webp", "webp"],
  ["image/avif", "avif"],
]);
const IMAGE_MIME_TYPES = new Set(IMAGE_EXTENSIONS.keys());
const MAX_IMAGE_BYTES = 10 * 1024 * 1024;

/**
 * MIME whitelist and size limit shared by covers and body images. Returns a
 * localized error message, or null when the file is acceptable.
 */
function imageFileError(
  file: File,
  zh: boolean,
  kind: "cover" | "body",
): string | null {
  const label =
    kind === "cover" ? (zh ? "封面" : "Cover") : zh ? "正文图片" : "Body image";
  const name = kind === "body" ? (zh ? `：${file.name}` : `: ${file.name}`) : "";
  if (!IMAGE_MIME_TYPES.has(file.type)) {
    return zh
      ? `${label}必须是 JPEG、PNG、WebP 或 AVIF 图片${name}`
      : `${label} must be a JPEG, PNG, WebP or AVIF image${name}`;
  }
  if (file.size > MAX_IMAGE_BYTES) {
    return zh
      ? `${label}不能超过 10 MiB${name}`
      : `${label} must be 10 MiB or smaller${name}`;
  }
  return null;
}

function safeFileName(name: string): string {
  return (name || "image").replace(/[^a-zA-Z0-9._-]+/g, "-").slice(-100);
}

/**
 * File name for a stored image: the sanitised base name plus the extension
 * that matches the validated MIME type, so every object the "article images"
 * panel offers is one the body renderer will actually resolve.
 */
function storedImageName(file: File): string {
  const extension = IMAGE_EXTENSIONS.get(file.type) ?? "jpg";
  const base = safeFileName(file.name).replace(/\.[^./]*$/, "") || "image";
  return `${base}.${extension}`;
}

/**
 * Uploads a cover image to the 'media' bucket and records it in the media
 * table. Returns the storage path, or null when the upload failed.
 */
async function uploadCover(
  supabase: Supabase,
  file: File,
  userId: string,
): Promise<string | null> {
  const safeName = storedImageName(file);
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

function getBodyImageFiles(formData: FormData): File[] {
  return formData
    .getAll("body_images")
    .filter((file): file is File => file instanceof File && file.size > 0);
}

/**
 * Next running index for `news/<slug>/`: one past the objects already in
 * the folder (or past the highest `NN-` prefix, whichever is larger, so a
 * gap never produces a name that collides in sort order). Null when the
 * folder cannot be listed.
 */
async function nextBodyImageIndex(
  supabase: Supabase,
  folder: string,
): Promise<number | null> {
  const { data, error } = await supabase.storage
    .from("media")
    .list(folder, { limit: 1000 });
  if (error) return null;
  const files = data.filter(
    (object) => object.id !== null && !object.name.startsWith("."),
  );
  let highest = 0;
  for (const file of files) {
    const match = /^(\d+)-/.exec(file.name);
    if (match) highest = Math.max(highest, Number(match[1]));
  }
  return Math.max(files.length, highest) + 1;
}

/**
 * Uploads body images to `news/<slug>/<NN>-<safeName>` (NN continues after
 * the folder's existing objects) and registers a media row per object.
 * Stops at the first failure and names the file so the editor can retry.
 */
async function uploadBodyImages(
  supabase: Supabase,
  files: File[],
  slug: string,
  userId: string,
): Promise<{ paths: string[] } | { failed: string }> {
  if (files.length === 0) return { paths: [] };
  const folder = `news/${slug}`;
  const start = await nextBodyImageIndex(supabase, folder);
  if (start === null) return { failed: files[0].name };
  const paths: string[] = [];
  for (const [i, file] of files.entries()) {
    const index = String(start + i).padStart(2, "0");
    const path = `${folder}/${index}-${storedImageName(file)}`;
    const { error: uploadError } = await supabase.storage
      .from("media")
      .upload(path, file, { contentType: file.type });
    if (uploadError) return { failed: file.name };
    await supabase.from("media").insert({
      bucket: "media",
      storage_path: path,
      file_name: file.name || safeFileName(file.name),
      mime_type: file.type,
      created_by: userId,
    });
    paths.push(path);
  }
  return { paths };
}

function bodyImageFailedMessage(zh: boolean, name: string): string {
  return zh ? `正文图片上传失败：${name}` : `Body image upload failed: ${name}`;
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

  // Validate every file before anything is uploaded.
  const cover = getCoverFile(formData);
  const coverError = cover ? imageFileError(cover, zh, "cover") : null;
  if (coverError) return { status: "error", message: coverError };
  const bodyImages = getBodyImageFiles(formData);
  for (const file of bodyImages) {
    const bodyError = imageFileError(file, zh, "body");
    if (bodyError) return { status: "error", message: bodyError };
  }

  // Body images live under news/<slug>/, so a slug that already belongs to
  // another article must be caught before objects land in its folder.
  if (bodyImages.length > 0) {
    const { data: existing } = await supabase
      .from("news")
      .select("id")
      .eq("slug", data.slug)
      .maybeSingle();
    if (existing) {
      return {
        status: "error",
        message: zh ? "该 slug 已存在" : "This slug already exists",
      };
    }
  }

  let coverImagePath: string | null = null;
  if (cover) {
    coverImagePath = await uploadCover(supabase, cover, session.userId);
    if (!coverImagePath) {
      return {
        status: "error",
        message: zh ? "封面图片上传失败" : "Cover image upload failed",
      };
    }
  }

  const uploadedBody = await uploadBodyImages(
    supabase,
    bodyImages,
    data.slug,
    session.userId,
  );
  if ("failed" in uploadedBody) {
    return {
      status: "error",
      message: bodyImageFailedMessage(zh, uploadedBody.failed),
    };
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
    ...(data.tags_editable ? { tags: data.tags } : {}),
    cover_image_path: coverImagePath,
    created_by: session.userId,
  };

  const { data: inserted, error } = await supabase
    .from("news")
    .insert(payload)
    .select("id")
    .single();
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
  // With body images just uploaded, land on the edit page where the
  // "Article images" panel offers the snippets to paste into the body.
  if (uploadedBody.paths.length > 0 && inserted) {
    redirect(`/${data.locale}/admin/news/${inserted.id}`);
  }
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
    // Only written when the form rendered the tag checkboxes, so a save
    // from a form without chapters never wipes existing tags.
    ...(data.tags_editable ? { tags: data.tags } : {}),
    updated_at: new Date().toISOString(),
  };

  // Validate every file before anything is uploaded.
  const cover = getCoverFile(formData);
  const coverError = cover ? imageFileError(cover, zh, "cover") : null;
  if (coverError) return { status: "error", message: coverError };
  const bodyImages = getBodyImageFiles(formData);
  for (const file of bodyImages) {
    const bodyError = imageFileError(file, zh, "body");
    if (bodyError) return { status: "error", message: bodyError };
  }

  if (cover) {
    const uploaded = await uploadCover(supabase, cover, session.userId);
    if (!uploaded) {
      return {
        status: "error",
        message: zh ? "封面图片上传失败" : "Cover image upload failed",
      };
    }
    payload.cover_image_path = uploaded;
  }

  const uploadedBody = await uploadBodyImages(
    supabase,
    bodyImages,
    data.slug,
    session.userId,
  );
  if ("failed" in uploadedBody) {
    return {
      status: "error",
      message: bodyImageFailedMessage(zh, uploadedBody.failed),
    };
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
  // With body images just uploaded, return to the edit page where the
  // "Article images" panel offers the snippets to paste into the body.
  if (uploadedBody.paths.length > 0) {
    redirect(`/${data.locale}/admin/news/${id}`);
  }
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
