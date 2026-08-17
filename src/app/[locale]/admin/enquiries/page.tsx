import { setRequestLocale } from "next-intl/server";
import Link from "next/link";
import { requireStaff } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { cn } from "@/lib/utils/cn";
import type { Database } from "@/types/database.types";

type EnquiryStatus = Database["public"]["Enums"]["enquiry_status"];

const STATUS_LABELS: Record<EnquiryStatus, { zh: string; en: string; className: string }> = {
  new: { zh: "新留言", en: "New", className: "text-gold-600" },
  in_progress: { zh: "处理中", en: "In progress", className: "text-navy-800" },
  closed: { zh: "已关闭", en: "Closed", className: "text-grey-500" },
};

const FILTER_TABS: { value: EnquiryStatus | ""; zh: string; en: string }[] = [
  { value: "", zh: "全部", en: "All" },
  { value: "new", zh: "新留言", en: "New" },
  { value: "in_progress", zh: "处理中", en: "In progress" },
  { value: "closed", zh: "已关闭", en: "Closed" },
];

function isEnquiryStatus(value: string): value is EnquiryStatus {
  return value in STATUS_LABELS;
}

export default async function AdminEnquiriesPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ status?: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  await requireStaff(locale);

  const { status } = await searchParams;
  const statusFilter = status && isEnquiryStatus(status) ? status : undefined;

  const supabase = await createClient();
  let query = supabase
    .from("contact_enquiries")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(200);
  if (statusFilter) {
    query = query.eq("status", statusFilter);
  }
  const { data: enquiries } = await query;

  const zh = locale === "zh";

  return (
    <>
      <div className="flex items-center justify-between">
        <h1 className="text-h3 font-semibold text-ink">
          {zh ? "联络留言" : "Enquiries"}
        </h1>
      </div>

      <div className="mt-6 flex gap-1 overflow-x-auto">
        {FILTER_TABS.map((tab) => {
          const active = (statusFilter ?? "") === tab.value;
          return (
            <Link
              key={tab.value || "all"}
              href={
                tab.value
                  ? `/${locale}/admin/enquiries?status=${tab.value}`
                  : `/${locale}/admin/enquiries`
              }
              className={cn(
                "rounded-md px-3 py-1.5 text-small whitespace-nowrap transition-colors",
                active
                  ? "bg-navy-100 font-medium text-navy-900"
                  : "text-grey-500 hover:text-navy-900",
              )}
            >
              {zh ? tab.zh : tab.en}
            </Link>
          );
        })}
      </div>

      <div className="mt-4 rounded-lg border border-grey-300 bg-white">
        {enquiries && enquiries.length > 0 ? (
          <div className="divide-y divide-grey-100">
            {enquiries.map((enquiry) => {
              const badge = STATUS_LABELS[enquiry.status];
              const preview =
                enquiry.subject ||
                (enquiry.message.length > 60
                  ? `${enquiry.message.slice(0, 60)}…`
                  : enquiry.message);
              return (
                <Link
                  key={enquiry.id}
                  href={`/${locale}/admin/enquiries/${enquiry.id}`}
                  className="flex flex-wrap items-center gap-x-4 gap-y-1 px-5 py-4 transition-colors hover:bg-grey-50"
                >
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-small font-medium text-ink">
                      {enquiry.name}
                      <span className="ml-2 font-normal text-grey-500">
                        {enquiry.email}
                      </span>
                    </span>
                    <span className="block truncate text-caption text-grey-500">
                      {preview}
                    </span>
                  </span>
                  <span className="text-caption text-grey-500 uppercase">
                    {enquiry.locale}
                  </span>
                  <span className={cn("text-caption font-medium", badge.className)}>
                    {zh ? badge.zh : badge.en}
                  </span>
                  <span className="text-caption text-grey-500">
                    {new Date(enquiry.created_at).toLocaleDateString(
                      zh ? "zh-CN" : "en-GB",
                      { year: "numeric", month: "short", day: "numeric" },
                    )}
                  </span>
                </Link>
              );
            })}
          </div>
        ) : (
          <p className="px-5 py-10 text-center text-small text-grey-500">
            {zh ? "暂无留言" : "No enquiries"}
          </p>
        )}
      </div>
    </>
  );
}
