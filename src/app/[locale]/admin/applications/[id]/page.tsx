import { setRequestLocale } from "next-intl/server";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requireStaff } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { cn } from "@/lib/utils/cn";
import {
  ApplicationReview,
  type ConsentSummary,
} from "@/components/admin/ApplicationReview";
import type { Database } from "@/types/database.types";

type ApplicationStatus = Database["public"]["Enums"]["application_status"];

/** Columns added by the application_form_v2 migration. They are absent
 *  (undefined) until it is applied, so every read below tolerates that. */
type ApplicationV2Columns = Partial<{
  first_name: string | null;
  last_name: string | null;
  company_intro_zh: string | null;
  company_intro_en: string | null;
  agreed_constitution: boolean;
  agreed_privacy: boolean;
  consent_at: string | null;
  policy_version: string | null;
}>;

const STATUS_LABELS: Record<ApplicationStatus, { zh: string; en: string; className: string }> = {
  submitted: { zh: "待处理", en: "Submitted", className: "text-sea-700" },
  under_review: { zh: "审核中", en: "Under review", className: "text-sea-800" },
  approved: { zh: "已通过", en: "Approved", className: "text-green-700" },
  rejected: { zh: "已拒绝", en: "Rejected", className: "text-red-700" },
  withdrawn: { zh: "已撤回", en: "Withdrawn", className: "text-grey-500" },
};

function formatSize(bytes: number): string {
  if (bytes >= 1024 * 1024) {
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }
  return `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

export default async function AdminApplicationDetailPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  setRequestLocale(locale);
  await requireStaff(locale);

  const applicationId = Number(id);
  if (!Number.isInteger(applicationId) || applicationId <= 0) notFound();

  const supabase = await createClient();
  const { data: application } = await supabase
    .from("membership_applications")
    .select(
      "*, membership_type:membership_types(name_zh,name_en), reviewer:profiles(full_name,email)",
    )
    .eq("id", applicationId)
    .maybeSingle();

  if (!application) notFound();

  const { data: documents } = await supabase
    .from("membership_documents")
    .select("*")
    .eq("application_id", applicationId)
    .order("uploaded_at", { ascending: true });

  const signedDocuments = await Promise.all(
    (documents ?? []).map(async (doc) => {
      const { data } = await supabase.storage
        .from("member-documents")
        .createSignedUrl(doc.storage_path, 3600);
      return { ...doc, signedUrl: data?.signedUrl ?? null };
    }),
  );

  const zh = locale === "zh";
  const badge = STATUS_LABELS[application.status];
  const dateFormat: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  };
  const formatDate = (value: string | null | undefined) =>
    value
      ? new Date(value).toLocaleString(zh ? "zh-CN" : "en-GB", dateFormat)
      : "—";
  const v2 = application as typeof application & ApplicationV2Columns;
  const preWrap = (value: string | null | undefined) =>
    value ? <span className="whitespace-pre-wrap">{value}</span> : "—";

  const consent: ConsentSummary = {
    directoryConsent: application.directory_consent,
    agreedConstitution: v2.agreed_constitution,
    agreedTerms: application.agreed_terms,
    agreedPrivacy: v2.agreed_privacy,
    agreedMarketing: application.agreed_marketing,
    consentAt: formatDate(v2.consent_at),
    policyVersion: v2.policy_version,
  };

  const details: { label: string; value: React.ReactNode }[] = [
    { label: zh ? "申请人" : "Applicant", value: application.applicant_name },
    { label: zh ? "邮箱" : "Email", value: application.email },
    { label: zh ? "手机" : "Mobile", value: application.mobile ?? "—" },
    { label: zh ? "电话" : "Phone", value: application.phone ?? "—" },
    { label: zh ? "传真" : "Fax", value: application.fax ?? "—" },
    {
      label: zh ? "机构名称" : "Organisation",
      value: application.organisation_name ?? "—",
    },
    {
      label: zh ? "公司地址" : "Company address",
      value: application.company_address ?? "—",
    },
    { label: zh ? "职位" : "Position", value: application.position ?? "—" },
    {
      label: zh ? "会员类型" : "Membership type",
      value: application.membership_type
        ? zh
          ? application.membership_type.name_zh
          : application.membership_type.name_en
        : "—",
    },
    {
      label: zh ? "企业简介（中文）" : "Introduction (Chinese)",
      value: preWrap(v2.company_intro_zh),
    },
    {
      label: zh ? "企业简介（英文）" : "Introduction (English)",
      value: preWrap(v2.company_intro_en),
    },
    // Legacy merged introduction, shown only for rows that predate the
    // per-language columns.
    ...(!v2.company_intro_zh && !v2.company_intro_en && application.company_intro
      ? [
          {
            label: zh ? "企业简介" : "Introduction",
            value: preWrap(application.company_intro),
          },
        ]
      : []),
    {
      label: zh ? "申请留言" : "Message",
      value: preWrap(application.message),
    },
    { label: zh ? "提交语言" : "Locale", value: application.locale },
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
      value: formatDate(application.created_at),
    },
    {
      label: zh ? "审核人" : "Reviewed by",
      value: application.reviewer
        ? application.reviewer.full_name || application.reviewer.email
        : "—",
    },
    {
      label: zh ? "审核时间" : "Reviewed at",
      value: formatDate(application.reviewed_at),
    },
    {
      label: zh ? "审核备注" : "Review note",
      value: preWrap(application.review_note),
    },
  ];

  return (
    <>
      <div className="flex items-center justify-between">
        <h1 className="text-h3 font-semibold text-ink">
          {zh ? "申请详情" : "Application detail"}
        </h1>
        <Link
          href={`/${locale}/admin/applications`}
          className="text-small text-grey-500 transition-colors hover:text-sea-900"
        >
          {zh ? "← 返回列表" : "← Back to list"}
        </Link>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <section className="rounded-lg border border-grey-300 bg-white p-6">
            <h2 className="text-small font-semibold text-ink">
              {zh ? "申请信息" : "Application details"}
            </h2>
            <dl className="mt-4 divide-y divide-grey-100">
              {details.map((item) => (
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
              {zh ? "证明文件" : "Documents"}
            </h2>
            {signedDocuments.length > 0 ? (
              <ul className="mt-4 divide-y divide-grey-100">
                {signedDocuments.map((doc) => (
                  <li
                    key={doc.id}
                    className="flex items-center justify-between gap-4 py-3"
                  >
                    {doc.signedUrl ? (
                      <a
                        href={doc.signedUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="min-w-0 truncate text-small font-medium text-sea-800 underline-offset-2 hover:underline"
                      >
                        {doc.file_name}
                      </a>
                    ) : (
                      <span className="min-w-0 truncate text-small text-grey-500">
                        {doc.file_name}{" "}
                        {zh ? "（链接生成失败）" : "(link unavailable)"}
                      </span>
                    )}
                    <span className="shrink-0 text-caption text-grey-500">
                      {formatSize(doc.size_bytes)}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-4 text-small text-grey-500">
                {zh ? "未上传文件" : "No documents uploaded"}
              </p>
            )}
          </section>
        </div>

        <div>
          <section className="rounded-lg border border-grey-300 bg-white p-6">
            <h2 className="text-small font-semibold text-ink">
              {zh ? "审核" : "Review"}
            </h2>
            <div className="mt-4">
              <ApplicationReview
                applicationId={application.id}
                locale={locale}
                currentStatus={application.status}
                currentNote={application.review_note}
                consent={consent}
              />
            </div>
          </section>
        </div>
      </div>
    </>
  );
}
