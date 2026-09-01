import { setRequestLocale } from "next-intl/server";
import Link from "next/link";
import { requireStaff } from "@/lib/auth";
import { CategoryForm } from "@/components/admin/CategoryForm";

export default async function NewCategoryPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  await requireStaff(locale);

  const zh = locale === "zh";

  return (
    <>
      <Link
        href={`/${locale}/admin/categories`}
        className="text-caption text-grey-500 transition-colors hover:text-sea-900"
      >
        ← {zh ? "返回列表" : "Back to list"}
      </Link>
      <h1 className="mt-2 text-h3 font-semibold text-ink">
        {zh ? "新增分类" : "New category"}
      </h1>
      <div className="mt-6 max-w-3xl rounded-lg border border-grey-300 bg-white p-6">
        <CategoryForm locale={locale} />
      </div>
    </>
  );
}
