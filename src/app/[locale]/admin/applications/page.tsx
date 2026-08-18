import { setRequestLocale } from "next-intl/server";
import Link from "next/link";
import { requireStaff } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { cn } from "@/lib/utils/cn";
import type { Database } from "@/types/database.types";

type ApplicationStatus = Database["public"]["Enums"]["application_status"];

const STATUS_LABELS: Record<ApplicationStatus, { zh: string; en: string; className: string }> = {
  submitted: { zh: "待处理", en: "Submitted", className: "text-rose-600" },
  under_review: { zh: "审核中", en: "Under review", className: "text-navy-800" },
  approved: { zh: "已通过", en: "Approved", className: "text-green-700" },
  rejected: { zh: "已拒绝", en: "Rejected", className: "text-red-700" },
  withdrawn: { zh: "已撤回", en: "Withdrawn", className: "text-grey-500" },
};

const FILTER_TABS: { value: ApplicationStatus | ""; zh: string; en: string }[] = [
  { value: "", zh: "全部", en: "All" },
  { value: "submitted", zh: "待处理", en: "Submitted" },
  { value: "under_review", zh: "审核中", en: "Under review" },
  { value: "approved", zh: "已通过", en: "Approved" },
  { value: "rejected", zh: "已拒绝", en: "Rejected" },
];

function isApplicationStatus(value: string): value is ApplicationStatus {
  return value in STATUS_LABELS;
}

export default async function AdminApplicationsPage({
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
  const statusFilter =
    status && isApplicationStatus(status) ? status : undefined;

  const supabase = await createClient();
  let query = supabase
    .from("membership_applications")
    .select("*, membership_type:membership_types(name_zh,name_en)")
    .order("created_at", { ascending: false })
    .limit(200);
  if (statusFilter) {
    query = query.eq("status", statusFilter);
  }
  const { data: applications } = await query;

  const zh = locale === "zh";

  return (
    <>
      <div className="flex items-center justify-between">
        <h1 className="text-h3 font-semibold text-ink">
          {zh ? "入会申请" : "Membership applications"}
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
                  ? `/${locale}/admin/applications?status=${tab.value}`
                  : `/${locale}/admin/applications`
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
        {applications && applications.length > 0 ? (
          <div className="divide-y divide-grey-100">
            {applications.map((application) => {
              const badge = STATUS_LABELS[application.status];
              return (
                <Link
                  key={application.id}
                  href={`/${locale}/admin/applications/${application.id}`}
                  className="flex flex-wrap items-center gap-x-4 gap-y-1 px-5 py-4 transition-colors hover:bg-grey-50"
                >
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-small font-medium text-ink">
                      {application.applicant_name}
                    </span>
                    <span className="block truncate text-caption text-grey-500">
                      {application.email}
                    </span>
                  </span>
                  <span className="hidden text-small text-grey-600 sm:block">
                    {application.membership_type
                      ? zh
                        ? application.membership_type.name_zh
                        : application.membership_type.name_en
                      : "—"}
                  </span>
                  <span className={cn("text-caption font-medium", badge.className)}>
                    {zh ? badge.zh : badge.en}
                  </span>
                  <span className="text-caption text-grey-500">
                    {new Date(application.created_at).toLocaleDateString(
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
            {zh ? "暂无申请" : "No applications"}
          </p>
        )}
      </div>
    </>
  );
}
