import { setRequestLocale } from "next-intl/server";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requireStaff } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { cn } from "@/lib/utils/cn";
import { StatusButtons } from "./StatusButtons";
import type { Database } from "@/types/database.types";

type EnquiryStatus = Database["public"]["Enums"]["enquiry_status"];

const STATUS_LABELS: Record<EnquiryStatus, { zh: string; en: string; className: string }> = {
  new: { zh: "新留言", en: "New", className: "text-sea-700" },
  in_progress: { zh: "处理中", en: "In progress", className: "text-sea-800" },
  closed: { zh: "已关闭", en: "Closed", className: "text-grey-500" },
};

export default async function AdminEnquiryDetailPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  setRequestLocale(locale);
  await requireStaff(locale);

  const enquiryId = Number(id);
  if (!Number.isInteger(enquiryId) || enquiryId <= 0) notFound();

  const supabase = await createClient();
  const { data: enquiry } = await supabase
    .from("contact_enquiries")
    .select("*, handler:profiles(full_name,email)")
    .eq("id", enquiryId)
    .maybeSingle();

  if (!enquiry) notFound();

  const zh = locale === "zh";
  const badge = STATUS_LABELS[enquiry.status];

  const meta: { label: string; value: React.ReactNode }[] = [
    { label: zh ? "姓名" : "Name", value: enquiry.name },
    { label: zh ? "邮箱" : "Email", value: enquiry.email },
    { label: zh ? "电话" : "Phone", value: enquiry.phone ?? "—" },
    {
      label: zh ? "机构名称" : "Organisation",
      value: enquiry.organisation_name ?? "—",
    },
    { label: zh ? "主题" : "Subject", value: enquiry.subject ?? "—" },
    { label: zh ? "提交语言" : "Locale", value: enquiry.locale },
    {
      label: zh ? "状态" : "Status",
      value: (
        <span className={cn("font-medium", badge.className)}>
          {zh ? badge.zh : badge.en}
        </span>
      ),
    },
    {
      label: zh ? "提交时间" : "Submitted at",
      value: new Date(enquiry.created_at).toLocaleString(
        zh ? "zh-CN" : "en-GB",
        {
          year: "numeric",
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        },
      ),
    },
    {
      label: zh ? "处理人" : "Handled by",
      value: enquiry.handler
        ? enquiry.handler.full_name || enquiry.handler.email
        : "—",
    },
  ];

  return (
    <>
      <div className="flex items-center justify-between">
        <h1 className="text-h3 font-semibold text-ink">
          {zh ? "留言详情" : "Enquiry detail"}
        </h1>
        <Link
          href={`/${locale}/admin/enquiries`}
          className="text-small text-grey-500 transition-colors hover:text-sea-900"
        >
          {zh ? "← 返回列表" : "← Back to list"}
        </Link>
      </div>

      <div className="mt-6 space-y-6">
        <section className="rounded-lg border border-grey-300 bg-white p-6">
          <h2 className="text-small font-semibold text-ink">
            {zh ? "留言内容" : "Message"}
          </h2>
          <p className="mt-4 text-small whitespace-pre-wrap text-ink">
            {enquiry.message}
          </p>
        </section>

        <section className="rounded-lg border border-grey-300 bg-white p-6">
          <h2 className="text-small font-semibold text-ink">
            {zh ? "详细信息" : "Details"}
          </h2>
          <dl className="mt-4 divide-y divide-grey-100">
            {meta.map((item) => (
              <div
                key={item.label}
                className="grid gap-1 py-3 sm:grid-cols-[10rem_1fr] sm:gap-4"
              >
                <dt className="text-caption text-grey-500">{item.label}</dt>
                <dd className="text-small text-ink">{item.value}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section className="rounded-lg border border-grey-300 bg-white p-6">
          <h2 className="text-small font-semibold text-ink">
            {zh ? "处理状态" : "Update status"}
          </h2>
          <div className="mt-4">
            <StatusButtons
              enquiryId={enquiry.id}
              locale={locale}
              currentStatus={enquiry.status}
            />
          </div>
        </section>
      </div>
    </>
  );
}
