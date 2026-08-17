import Link from "next/link";
import { setRequestLocale } from "next-intl/server";
import { requireStaff } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export default async function AdminEventsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  await requireStaff(locale);
  const zh = locale === "zh";

  const supabase = await createClient();
  const { data: events } = await supabase
    .from("events")
    .select(
      "id, slug, title_zh, title_en, starts_at, location_zh, location_en, status, is_featured",
    )
    .order("starts_at", { ascending: false });

  const dateFormatter = new Intl.DateTimeFormat(zh ? "zh-CN" : "en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "UTC",
  });

  const statusLabel: Record<string, string> = {
    draft: zh ? "草稿" : "Draft",
    published: zh ? "已发布" : "Published",
    archived: zh ? "已归档" : "Archived",
  };
  const statusClass: Record<string, string> = {
    draft: "bg-grey-100 text-grey-600",
    published: "bg-green-50 text-green-700",
    archived: "bg-amber-50 text-amber-700",
  };

  return (
    <>
      <div className="flex items-center justify-between">
        <h1 className="text-h3 font-semibold text-ink">
          {zh ? "活动展会" : "Events"}
        </h1>
        <Link
          href={`/${locale}/admin/events/new`}
          className="inline-flex h-10 items-center justify-center rounded-md bg-navy-900 px-4 text-small font-medium text-white transition-colors duration-200 hover:bg-navy-800"
        >
          {zh ? "新建" : "New"}
        </Link>
      </div>

      <div className="mt-8 overflow-hidden rounded-lg border border-grey-300 bg-white">
        <div className="divide-y divide-grey-100">
          {(events ?? []).map((event) => {
            const title =
              (zh
                ? event.title_zh || event.title_en
                : event.title_en || event.title_zh) || event.slug;
            const location = zh
              ? event.location_zh || event.location_en
              : event.location_en || event.location_zh;
            return (
              <Link
                key={event.id}
                href={`/${locale}/admin/events/${event.id}`}
                className="flex flex-wrap items-center gap-x-4 gap-y-1 px-5 py-4 transition-colors hover:bg-grey-50"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-small font-medium text-ink">
                    {title}
                    {event.is_featured && (
                      <span className="ml-2 text-gold-400" title={zh ? "焦点活动" : "Featured"}>
                        ★
                      </span>
                    )}
                  </p>
                  <p className="mt-0.5 truncate text-caption text-grey-500">
                    {dateFormatter.format(new Date(event.starts_at))}
                    {location ? ` · ${location}` : ""}
                  </p>
                </div>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-caption ${statusClass[event.status] ?? "bg-grey-100 text-grey-600"}`}
                >
                  {statusLabel[event.status] ?? event.status}
                </span>
              </Link>
            );
          })}
          {(!events || events.length === 0) && (
            <p className="px-5 py-10 text-center text-small text-grey-500">
              {zh ? "暂无活动" : "No events yet"}
            </p>
          )}
        </div>
      </div>
    </>
  );
}
