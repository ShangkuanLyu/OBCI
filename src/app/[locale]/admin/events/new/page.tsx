import { setRequestLocale } from "next-intl/server";
import { requireStaff } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { EventForm } from "@/components/admin/EventForm";

export default async function AdminEventNewPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  await requireStaff(locale);
  const zh = locale === "zh";

  const supabase = await createClient();
  const { data: chapters } = await supabase
    .from("industry_chapters")
    .select("slug, name_zh, name_en")
    .eq("is_active", true)
    .order("display_order");

  return (
    <div className="max-w-3xl">
      <h1 className="text-h3 font-semibold text-ink">
        {zh ? "新建活动" : "New event"}
      </h1>
      <div className="mt-8">
        <EventForm locale={locale} chapters={chapters ?? []} />
      </div>
    </div>
  );
}
