import { setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { requireStaff } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { NewsForm, type NewsBodyImage } from "@/components/admin/NewsForm";
import { mediaUrl } from "@/lib/utils/l10n";

export default async function AdminNewsEditPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  setRequestLocale(locale);
  await requireStaff(locale);
  const zh = locale === "zh";

  const newsId = Number(id);
  if (!Number.isInteger(newsId) || newsId <= 0) notFound();

  const supabase = await createClient();
  const [{ data: row }, { data: categories }, { data: chapters }] =
    await Promise.all([
      supabase.from("news").select("*").eq("id", newsId).maybeSingle(),
      supabase
        .from("news_categories")
        // "*": is_active only exists after migration 20260902122000.
        .select("*")
        .order("display_order", { ascending: true }),
      supabase
        .from("industry_chapters")
        .select("slug, name_zh, name_en")
        .eq("is_active", true)
        .order("display_order", { ascending: true }),
    ]);

  if (!row) notFound();

  // Body images uploaded through the form live under news/<slug>/; the
  // panel lists them with the snippet that references each one.
  const folder = `news/${row.slug}`;
  const { data: objects } = await supabase.storage
    .from("media")
    .list(folder, { limit: 1000, sortBy: { column: "name", order: "asc" } });
  const bodyImages: NewsBodyImage[] = (objects ?? [])
    .filter((object) => object.id !== null && !object.name.startsWith("."))
    .map((object) => {
      const path = `${folder}/${object.name}`;
      return { name: object.name, path, url: mediaUrl(path) ?? "" };
    })
    .filter((image) => image.url !== "");

  return (
    <>
      <h1 className="text-h3 font-semibold text-ink">
        {zh ? "编辑新闻" : "Edit article"}
      </h1>
      <p className="mt-1 text-caption text-grey-500">{row.slug}</p>
      <div className="mt-8 max-w-4xl rounded-lg border border-grey-300 bg-white p-6">
        <NewsForm
          categories={(categories ?? []).map((category) => ({
            id: category.id,
            name:
              (zh ? category.name_zh : category.name_en) +
              (category.is_active === false
                ? zh
                  ? "（历史分类）"
                  : " (legacy)"
                : ""),
          }))}
          chapters={(chapters ?? []).map((chapter) => ({
            slug: chapter.slug,
            name: zh ? chapter.name_zh : chapter.name_en,
          }))}
          initial={row}
          locale={locale}
          bodyImages={bodyImages}
        />
      </div>
    </>
  );
}
