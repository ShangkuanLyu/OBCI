import { setRequestLocale } from "next-intl/server";
import { requireStaff } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { NewsForm } from "@/components/admin/NewsForm";

export default async function AdminNewsNewPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  await requireStaff(locale);
  const zh = locale === "zh";

  const supabase = await createClient();
  const { data: categories } = await supabase
    .from("news_categories")
    .select("id, name_zh, name_en")
    .order("display_order", { ascending: true });

  return (
    <>
      <h1 className="text-h3 font-semibold text-ink">
        {zh ? "新建新闻" : "New article"}
      </h1>
      <div className="mt-8 max-w-4xl rounded-lg border border-grey-300 bg-white p-6">
        <NewsForm
          categories={(categories ?? []).map((category) => ({
            id: category.id,
            name: zh ? category.name_zh : category.name_en,
          }))}
          initial={null}
          locale={locale}
        />
      </div>
    </>
  );
}
