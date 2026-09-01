import { setRequestLocale } from "next-intl/server";
import Link from "next/link";
import { requireStaff } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { cn } from "@/lib/utils/cn";

const STATUS_LABELS: Record<string, { zh: string; en: string; className: string }> = {
  draft: { zh: "草稿", en: "Draft", className: "text-amber-700" },
  published: { zh: "已发布", en: "Published", className: "text-green-700" },
  archived: { zh: "已归档", en: "Archived", className: "text-grey-500" },
};

export default async function AdminNewsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  await requireStaff(locale);
  const zh = locale === "zh";

  const supabase = await createClient();
  const { data: rows } = await supabase
    .from("news")
    .select(
      "id, slug, title_zh, title_en, status, published_at, is_featured, category:news_categories(name_zh, name_en)",
    )
    .order("created_at", { ascending: false });

  return (
    <>
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-h3 font-semibold text-ink">
          {zh ? "新闻资讯" : "News"}
        </h1>
        <Link
          href={`/${locale}/admin/news/new`}
          className="inline-flex h-10 items-center justify-center rounded-md bg-sea-900 px-4 text-small font-medium text-white transition-colors duration-200 hover:bg-sea-800"
        >
          {zh ? "新建" : "New"}
        </Link>
      </div>

      <div className="mt-8 rounded-lg border border-grey-300 bg-white">
        {!rows || rows.length === 0 ? (
          <p className="px-5 py-8 text-small text-grey-500">
            {zh ? "暂无新闻。" : "No news articles yet."}
          </p>
        ) : (
          <div className="divide-y divide-grey-100">
            {rows.map((row) => {
              const status = STATUS_LABELS[row.status] ?? {
                zh: row.status,
                en: row.status,
                className: "text-grey-500",
              };
              return (
                <Link
                  key={row.id}
                  href={`/${locale}/admin/news/${row.id}`}
                  className="flex items-center gap-4 px-5 py-4 transition-colors hover:bg-grey-50"
                >
                  <span
                    aria-hidden
                    title={row.is_featured ? (zh ? "焦点" : "Featured") : undefined}
                    className={cn(
                      "h-2 w-2 shrink-0 rounded-full",
                      row.is_featured ? "bg-sea-800" : "bg-grey-100",
                    )}
                  />
                  <span className="min-w-0 flex-1 truncate text-small font-medium text-ink">
                    {row.title_zh || row.title_en || row.slug}
                  </span>
                  <span className="hidden shrink-0 text-caption text-grey-500 sm:block">
                    {row.category
                      ? zh
                        ? row.category.name_zh
                        : row.category.name_en
                      : zh
                        ? "无分类"
                        : "Uncategorised"}
                  </span>
                  <span className={cn("shrink-0 text-caption", status.className)}>
                    {zh ? status.zh : status.en}
                  </span>
                  <span className="hidden w-24 shrink-0 text-right text-caption text-grey-500 md:block">
                    {row.published_at
                      ? new Date(row.published_at).toLocaleDateString(
                          zh ? "zh-CN" : "en-GB",
                          { year: "numeric", month: "short", day: "numeric" },
                        )
                      : "—"}
                  </span>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
