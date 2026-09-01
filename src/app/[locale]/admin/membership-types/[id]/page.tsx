import { setRequestLocale } from "next-intl/server";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requireStaff } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { MembershipTypeForm } from "@/components/admin/MembershipTypeForm";

export default async function EditMembershipTypePage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  setRequestLocale(locale);
  await requireStaff(locale);

  const numericId = Number(id);
  if (!Number.isInteger(numericId) || numericId <= 0) notFound();

  const supabase = await createClient();
  const { data: item } = await supabase
    .from("membership_types")
    .select("*")
    .eq("id", numericId)
    .maybeSingle();
  if (!item) notFound();

  const zh = locale === "zh";

  return (
    <>
      <Link
        href={`/${locale}/admin/membership-types`}
        className="text-caption text-grey-500 transition-colors hover:text-sea-900"
      >
        ← {zh ? "返回列表" : "Back to list"}
      </Link>
      <h1 className="mt-2 text-h3 font-semibold text-ink">
        {zh ? "编辑会员类型" : "Edit membership type"}
      </h1>
      <div className="mt-6 max-w-3xl rounded-lg border border-grey-300 bg-white p-6">
        <MembershipTypeForm locale={locale} item={item} />
      </div>
    </>
  );
}
