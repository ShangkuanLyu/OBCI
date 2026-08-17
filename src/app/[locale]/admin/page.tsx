import { setRequestLocale } from "next-intl/server";
import { requireStaff } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

export default async function AdminDashboardPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  await requireStaff(locale);

  const supabase = await createClient();
  const [news, events, applications, enquiries] = await Promise.all([
    supabase.from("news").select("id", { count: "exact", head: true }),
    supabase.from("events").select("id", { count: "exact", head: true }),
    supabase
      .from("membership_applications")
      .select("id", { count: "exact", head: true })
      .eq("status", "submitted"),
    supabase
      .from("contact_enquiries")
      .select("id", { count: "exact", head: true })
      .eq("status", "new"),
  ]);

  const zh = locale === "zh";
  const stats = [
    { label: zh ? "新闻文章" : "News articles", value: news.count ?? 0, href: `/${locale}/admin/news` },
    { label: zh ? "活动" : "Events", value: events.count ?? 0, href: `/${locale}/admin/events` },
    { label: zh ? "待审核申请" : "Pending applications", value: applications.count ?? 0, href: `/${locale}/admin/applications` },
    { label: zh ? "未处理留言" : "New enquiries", value: enquiries.count ?? 0, href: `/${locale}/admin/enquiries` },
  ];

  return (
    <>
      <h1 className="text-h3 font-semibold text-ink">
        {zh ? "总览" : "Dashboard"}
      </h1>
      <div className="mt-8 grid gap-px overflow-hidden rounded-lg border border-grey-300 bg-grey-300 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Link
            key={stat.href + stat.label}
            href={stat.href}
            className="bg-white p-6 transition-colors hover:bg-grey-50"
          >
            <p className="text-caption text-grey-500">{stat.label}</p>
            <p className="mt-2 text-h2 font-semibold text-navy-900">
              {stat.value}
            </p>
          </Link>
        ))}
      </div>
    </>
  );
}
