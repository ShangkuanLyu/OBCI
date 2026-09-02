import { setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { requireStaff } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { NewsForm } from "@/components/admin/NewsForm";

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
        .select("id, name_zh, name_en")
        .order("display_order", { ascending: true }),
      supabase
        .from("industry_chapters")
        .select("slug, name_zh, name_en")
        .eq("is_active", true)
        .order("display_order", { ascending: true }),
    ]);

  if (!row) notFound();

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
            name: zh ? category.name_zh : category.name_en,
          }))}
          chapters={(chapters ?? []).map((chapter) => ({
            slug: chapter.slug,
            name: zh ? chapter.name_zh : chapter.name_en,
          }))}
          initial={row}
          locale={locale}
        />
      </div>
    </>
  );
}
