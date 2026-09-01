import { setRequestLocale } from "next-intl/server";
import Link from "next/link";
import { requireStaff } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

const KIND_LABELS: Record<string, { zh: string; en: string }> = {
  government: { zh: "政府机构", en: "Government" },
  chamber: { zh: "商会协会", en: "Chamber" },
  enterprise: { zh: "企业", en: "Enterprise" },
  provincial: { zh: "省级机构", en: "Provincial" },
  media: { zh: "媒体", en: "Media" },
};

export default async function AdminPartnersPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  await requireStaff(locale);

  const supabase = await createClient();
  const { data } = await supabase
    .from("partners")
    .select("id, name_zh, name_en, kind, region, display_order, is_active")
    .order("display_order", { ascending: true });

  const zh = locale === "zh";
  const rows = data ?? [];

  return (
    <>
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-h3 font-semibold text-ink">
          {zh ? "合作伙伴" : "Partners"}
        </h1>
        <Link
          href={`/${locale}/admin/partners/new`}
          className="inline-flex h-10 items-center justify-center rounded-md bg-sea-900 px-4 text-small font-medium text-white transition-colors duration-200 hover:bg-sea-800"
        >
          {zh ? "新建" : "New"}
        </Link>
      </div>

      <div className="mt-6 rounded-lg border border-grey-300 bg-white">
        {rows.length === 0 ? (
          <p className="p-6 text-small text-grey-500">
            {zh ? "暂无记录。" : "No entries yet."}
          </p>
        ) : (
          <div className="divide-y divide-grey-100">
            {rows.map((row) => {
              const kind = KIND_LABELS[row.kind];
              return (
                <Link
                  key={row.id}
                  href={`/${locale}/admin/partners/${row.id}`}
                  className="flex items-center justify-between gap-4 px-5 py-4 transition-colors hover:bg-grey-50"
                >
                  <div className="min-w-0">
                    <p className="truncate text-small font-medium text-ink">
                      {zh ? row.name_zh : row.name_en}
                    </p>
                    <p className="mt-0.5 truncate text-caption text-grey-500">
                      {(kind ? (zh ? kind.zh : kind.en) : row.kind) +
                        (row.region ? ` · ${row.region}` : "")}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-3 text-caption text-grey-500">
                    <span>#{row.display_order}</span>
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
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
