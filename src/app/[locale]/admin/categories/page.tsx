import { setRequestLocale } from "next-intl/server";
import Link from "next/link";
import { requireStaff } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export default async function AdminCategoriesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  await requireStaff(locale);

  const supabase = await createClient();
  const { data } = await supabase
    .from("news_categories")
    // "*" rather than naming is_active: the column arrives with migration
    // 20260902122000, and a named missing column would fail the whole query.
    .select("*")
    .order("display_order", { ascending: true });

  const zh = locale === "zh";
  const rows = data ?? [];

  return (
    <>
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-h3 font-semibold text-ink">
          {zh ? "资讯分类" : "Categories"}
        </h1>
        <Link
          href={`/${locale}/admin/categories/new`}
          className="inline-flex h-10 items-center justify-center rounded-md bg-sea-900 px-4 text-small font-medium text-white transition-colors duration-200 hover:bg-sea-800"
        >
          {zh ? "新增" : "New"}
        </Link>
      </div>

      <div className="mt-6 rounded-lg border border-grey-300 bg-white">
        {rows.length === 0 ? (
          <p className="p-6 text-small text-grey-500">
            {zh ? "暂无记录。" : "No entries yet."}
          </p>
        ) : (
          <div className="divide-y divide-grey-100">
            {rows.map((row) => (
              <Link
                key={row.id}
                href={`/${locale}/admin/categories/${row.id}`}
                className="flex items-center justify-between gap-4 px-5 py-4 transition-colors hover:bg-grey-50"
              >
                <div className="min-w-0">
                  <p className="truncate text-small font-medium text-ink">
                    {zh ? row.name_zh : row.name_en}
                  </p>
                  <p className="mt-0.5 truncate text-caption text-grey-500">
                    {row.slug}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-3 text-caption text-grey-500">
                  {row.is_active === false && (
                    <span className="rounded-full border border-dashed border-grey-300 px-2 py-0.5">
                      {zh ? "历史分类" : "Legacy"}
                    </span>
                  )}
                  <span>#{row.display_order}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
