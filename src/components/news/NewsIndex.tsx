"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils/cn";

export type NewsListItem = {
  id: number;
  slug: string;
  title: string;
  summary: string;
  date: string;
  categorySlug: string | null;
  categoryName: string;
};

export type NewsCategoryItem = { slug: string; name: string };

/** Client-side category filter + editorial list (static-export friendly). */
export function NewsIndex({
  items,
  categories,
}: {
  items: NewsListItem[];
  categories: NewsCategoryItem[];
}) {
  const t = useTranslations("news");
  const [active, setActive] = useState<string | null>(null);

  const filtered = active
    ? items.filter((item) => item.categorySlug === active)
    : items;
  const [lead, ...rest] = filtered;

  const tabClass = (isActive: boolean) =>
    cn(
      "relative shrink-0 pb-4 text-small transition-colors",
      isActive
        ? "font-medium text-navy-900"
        : "text-grey-500 hover:text-navy-800",
    );

  return (
    <>
      <nav
        aria-label={t("title")}
        className="flex gap-8 overflow-x-auto border-b border-grey-300"
      >
        <button type="button" onClick={() => setActive(null)} className={tabClass(!active)}>
          {t("all")}
          {!active && (
            <span className="absolute inset-x-0 bottom-0 h-0.5 bg-gold-500" />
          )}
        </button>
        {categories.map((cat) => (
          <button
            key={cat.slug}
            type="button"
            onClick={() => setActive(cat.slug)}
            className={tabClass(active === cat.slug)}
          >
            {cat.name}
            {active === cat.slug && (
              <span className="absolute inset-x-0 bottom-0 h-0.5 bg-gold-500" />
            )}
          </button>
        ))}
      </nav>

      {filtered.length === 0 && (
        <p className="py-20 text-body text-grey-500">{t("empty")}</p>
      )}

      {lead && (
        <Link href={`/news/${lead.slug}`} className="group block py-12 md:py-16">
          <div className="max-w-[46rem]">
            <p className="flex items-baseline gap-3 text-caption">
              <span className="font-medium uppercase tracking-[0.08em] text-gold-600">
                {lead.categoryName}
              </span>
              <span className="text-grey-500">{lead.date}</span>
            </p>
            <h2 className="mt-5 text-h3 font-semibold leading-[1.2] tracking-[-0.01em] text-ink transition-colors duration-200 group-hover:text-navy-800 md:text-h2">
              {lead.title}
            </h2>
            <p className="mt-5 max-w-[42rem] text-body leading-relaxed text-grey-600">
              {lead.summary}
            </p>
          </div>
        </Link>
      )}

      {rest.length > 0 && (
        <div className="grid gap-x-10 gap-y-12 border-t border-grey-300 pt-12 md:grid-cols-3">
          {rest.map((item) => (
            <Link
              key={item.id}
              href={`/news/${item.slug}`}
              className="group block"
            >
              <p className="flex items-baseline gap-3 text-caption">
                <span className="font-medium uppercase tracking-[0.08em] text-gold-600">
                  {item.categoryName}
                </span>
                <span className="text-grey-500">{item.date}</span>
              </p>
              <h3 className="mt-4 text-h4 font-semibold leading-snug text-ink transition-colors duration-200 group-hover:text-navy-800">
                {item.title}
              </h3>
              <p className="mt-3 line-clamp-3 text-small leading-relaxed text-grey-600">
                {item.summary}
              </p>
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
