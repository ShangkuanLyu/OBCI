import { setRequestLocale } from "next-intl/server";
import Link from "next/link";
import { requireStaff } from "@/lib/auth";
import { PartnerForm } from "@/components/admin/PartnerForm";

export default async function NewPartnerPage({
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
        href={`/${locale}/admin/partners`}
        className="text-caption text-grey-500 transition-colors hover:text-navy-900"
      >
        ← {zh ? "返回列表" : "Back to list"}
      </Link>
      <h1 className="mt-2 text-h3 font-semibold text-ink">
        {zh ? "新建合作伙伴" : "New partner"}
      </h1>
      <div className="mt-6 max-w-3xl rounded-lg border border-grey-300 bg-white p-6">
        <PartnerForm locale={locale} />
      </div>
    </>
  );
}
