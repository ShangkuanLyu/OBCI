import { setRequestLocale } from "next-intl/server";
import { requireStaff } from "@/lib/auth";
import { AdminNav } from "@/components/admin/AdminNav";
import { SignOutButton } from "@/components/admin/SignOutButton";

export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const session = await requireStaff(locale);

  return (
    <div className="flex min-h-dvh flex-col">
      <div className="flex min-h-0 flex-1 bg-grey-50">
        <aside className="hidden w-60 shrink-0 flex-col justify-between bg-sea-950 px-5 py-6 text-white md:flex">
          <div>
            <p className="px-3 text-caption font-semibold tracking-[0.08em] text-gold-500">
              OBCI · CMS
            </p>
            <div className="mt-8">
              <AdminNav locale={locale} role={session.profile.role} />
            </div>
          </div>
          <div className="border-t border-white/10 px-3 pt-4">
            <p className="truncate text-caption text-white/60">{session.email}</p>
            <p className="mt-0.5 text-caption text-gold-500">{session.profile.role}</p>
            <div className="mt-3">
              <SignOutButton locale={locale} />
            </div>
          </div>
        </aside>
        <div className="min-w-0 flex-1">
          <div className="border-b border-grey-300 bg-white px-6 py-3 md:hidden">
            <AdminNav locale={locale} role={session.profile.role} horizontal />
          </div>
          <div className="px-6 py-8 md:px-10">{children}</div>
        </div>
      </div>
    </div>
  );
}
