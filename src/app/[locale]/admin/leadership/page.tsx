import { setRequestLocale } from "next-intl/server";
import Link from "next/link";
import { requireStaff } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

/* Same order and labels as LeadershipForm / messages leadership.groups.*. */
const GROUP_ORDER = [
  "executive",
  "honorary",
  "secretariat",
  "president",
  "honorary_chairman",
  "vice_chair",
  "advisor",
];

const GROUP_LABELS: Record<string, { zh: string; en: string }> = {
  executive: { zh: "执委会", en: "Executive Committee" },
  honorary: { zh: "荣誉主席与荣誉顾问", en: "Honorary Patrons" },
  secretariat: { zh: "秘书处", en: "Secretariat" },
  president: { zh: "会长（旧分组）", en: "President (legacy)" },
  honorary_chairman: { zh: "名誉主席（旧分组）", en: "Honorary Chairman (legacy)" },
  vice_chair: { zh: "副会长（旧分组）", en: "Vice Chair (legacy)" },
  advisor: { zh: "顾问（旧分组）", en: "Advisor (legacy)" },
};

function groupRank(key: string) {
  const index = GROUP_ORDER.indexOf(key);
  return index === -1 ? GROUP_ORDER.length : index;
}

export default async function AdminLeadershipPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  await requireStaff(locale);

  const supabase = await createClient();
  const { data } = await supabase
    .from("leadership")
    .select(
      "id, name_zh, name_en, title_zh, title_en, group_key, display_order, is_active",
    )
    .order("display_order", { ascending: true });

  const zh = locale === "zh";
  const rows = (data ?? [])
    .slice()
    .sort(
      (a, b) =>
        groupRank(a.group_key) - groupRank(b.group_key) ||
        a.display_order - b.display_order,
    );

  return (
    <>
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-h3 font-semibold text-ink">
          {zh ? "领导团队" : "Leadership"}
        </h1>
        <Link
          href={`/${locale}/admin/leadership/new`}
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
              const group = GROUP_LABELS[row.group_key];
              return (
                <Link
                  key={row.id}
                  href={`/${locale}/admin/leadership/${row.id}`}
                  className="flex items-center justify-between gap-4 px-5 py-4 transition-colors hover:bg-grey-50"
                >
                  <div className="min-w-0">
                    <p className="truncate text-small font-medium text-ink">
                      {zh ? row.name_zh : row.name_en}
                    </p>
                    <p className="mt-0.5 truncate text-caption text-grey-500">
                      {(zh ? row.title_zh : row.title_en) +
                        " · " +
                        (group ? (zh ? group.zh : group.en) : row.group_key)}
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
