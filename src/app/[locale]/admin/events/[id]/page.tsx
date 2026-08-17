import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { requireStaff } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { EventForm } from "@/components/admin/EventForm";

export default async function AdminEventEditPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  setRequestLocale(locale);
  await requireStaff(locale);
  const zh = locale === "zh";

  const eventId = Number(id);
  if (!Number.isInteger(eventId) || eventId <= 0) notFound();

  const supabase = await createClient();
  const { data: event } = await supabase
    .from("events")
    .select("*")
    .eq("id", eventId)
    .maybeSingle();
  if (!event) notFound();

  return (
    <div className="max-w-3xl">
      <h1 className="text-h3 font-semibold text-ink">
        {zh ? "编辑活动" : "Edit event"}
      </h1>
      <p className="mt-1 truncate text-small text-grey-500">
        {(zh ? event.title_zh || event.title_en : event.title_en || event.title_zh) ||
          event.slug}
      </p>
      <div className="mt-8">
        <EventForm locale={locale} event={event} />
      </div>
    </div>
  );
}
