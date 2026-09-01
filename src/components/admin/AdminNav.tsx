"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils/cn";
import type { AppRole } from "@/lib/auth";

type Item = {
  href: string;
  zh: string;
  en: string;
  roles?: AppRole[];
};

const ITEMS: Item[] = [
  { href: "", zh: "总览", en: "Dashboard" },
  { href: "/news", zh: "新闻资讯", en: "News", roles: ["admin", "editor"] },
  { href: "/categories", zh: "资讯分类", en: "Categories", roles: ["editor"] },
  { href: "/events", zh: "活动展会", en: "Events", roles: ["admin", "editor", "event_manager"] },
  { href: "/leadership", zh: "领导团队", en: "Leadership", roles: ["admin", "editor"] },
  { href: "/chapters", zh: "行业分会", en: "Chapters", roles: ["admin", "editor"] },
  { href: "/partners", zh: "合作伙伴", en: "Partners", roles: ["admin", "editor"] },
  { href: "/membership-types", zh: "会员类型", en: "Membership types", roles: ["membership_manager"] },
  { href: "/applications", zh: "入会申请", en: "Applications", roles: ["admin", "membership_manager"] },
  { href: "/enquiries", zh: "联络留言", en: "Enquiries", roles: ["admin", "membership_manager", "editor"] },
  { href: "/settings", zh: "站点设置", en: "Settings", roles: ["admin"] },
];

export function AdminNav({
  locale,
  role,
  horizontal = false,
}: {
  locale: string;
  role: AppRole;
  horizontal?: boolean;
}) {
  const pathname = usePathname();
  const base = `/${locale}/admin`;

  const visible = ITEMS.filter(
    (item) => !item.roles || item.roles.includes(role) || role === "admin",
  );

  return (
    <nav
      className={cn(
        horizontal ? "flex gap-1 overflow-x-auto" : "flex flex-col gap-1",
      )}
      aria-label="Admin"
    >
      {visible.map((item) => {
        const href = `${base}${item.href}`;
        const active =
          item.href === "" ? pathname === base : pathname.startsWith(href);
        return (
          <Link
            key={item.href}
            href={href}
            className={cn(
              "rounded-md px-3 py-2 text-small whitespace-nowrap transition-colors",
              horizontal
                ? active
                  ? "bg-sea-100 font-medium text-sea-900"
                  : "text-grey-600 hover:text-sea-900"
                : active
                  ? "bg-white/10 font-medium text-white"
                  : "text-white/65 hover:text-white",
            )}
          >
            {locale === "zh" ? item.zh : item.en}
          </Link>
        );
      })}
    </nav>
  );
}
