import { setRequestLocale } from "next-intl/server";
import Link from "next/link";
import { requireStaff } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export default async function AdminMembershipTypesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  await requireStaff(locale);

  const supabase = await createClient();
  const { data } = await supabase
    .from("membership_types")
    .select(
      "id, code, name_zh, name_en, price_annual, currency, display_order, is_popular, is_active",
    )
    .order("display_order", { ascending: true });

  const zh = locale === "zh";
  const rows = data ?? [];

  return (
    <>
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-h3 font-semibold text-ink">
          {zh ? "会员类型" : "Membership types"}
        </h1>
        <Link
          href={`/${locale}/admin/membership-types/new`}
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
                href={`/${locale}/admin/membership-types/${row.id}`}
                className="flex items-center justify-between gap-4 px-5 py-4 transition-colors hover:bg-grey-50"
              >
                <div className="min-w-0">
                  <p className="truncate text-small font-medium text-ink">
                    {zh ? row.name_zh : row.name_en}
                  </p>
                  <p className="mt-0.5 truncate text-caption text-grey-500">
                    {row.code}
                    {" · "}
                    {row.price_annual === null
                      ? zh
                        ? "面议"
                        : "On request"
                      : `${row.currency} ${row.price_annual}`}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-3 text-caption text-grey-500">
                  <span>#{row.display_order}</span>
                  {row.is_popular && (
                    <span className="rounded-full bg-sea-100 px-2.5 py-0.5 text-sea-900">
                      {zh ? "推荐" : "Popular"}
                    </span>
                  )}
                  <span
                    className={
                      row.is_active
                        ? "rounded-full bg-sea-50 px-2.5 py-0.5 text-sea-800"
                        : "rounded-full bg-grey-100 px-2.5 py-0.5 text-grey-500"
                    }
                  >
                    {row.is_active
                      ? zh
                        ? "启用"
                        : "Active"
                      : zh
                        ? "停用"
                        : "Inactive"}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
