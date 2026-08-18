"use client";

import { useState } from "react";
import Image from "next/image";
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
  image: string | null;
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
            <span className="absolute inset-x-0 bottom-0 h-0.5 bg-rose-500" />
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
              <span className="absolute inset-x-0 bottom-0 h-0.5 bg-rose-500" />
            )}
          </button>
        ))}
      </nav>

      {filtered.length === 0 && (
        <p className="py-20 text-body text-grey-500">{t("empty")}</p>
      )}

      {lead && (
        <Link href={`/news/${lead.slug}`} className="group block py-12 md:py-14">
          <div className="grid items-center gap-8 md:grid-cols-12">
            {lead.image && (
              <div className="relative aspect-[3/2] overflow-hidden rounded-md bg-navy-100 md:order-2 md:col-span-6">
                <Image
                  src={lead.image}
                  alt=""
                  fill
                  sizes="(min-width: 768px) 540px, 100vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                />
              </div>
            )}
            <div className={cn(lead.image ? "md:col-span-6" : "md:col-span-8")}>
              <p className="flex items-baseline gap-3 text-caption">
                <span className="font-medium uppercase tracking-[0.08em] text-rose-600">
                  {lead.categoryName}
                </span>
                <span className="text-grey-500">{lead.date}</span>
              </p>
              <h2 className="mt-5 text-h3 font-semibold leading-[1.2] tracking-[-0.01em] text-ink transition-colors duration-200 group-hover:text-royal-600 md:text-[2rem]">
                {lead.title}
              </h2>
              <p className="mt-5 max-w-[42rem] text-body leading-relaxed text-grey-600">
                {lead.summary}
              </p>
            </div>
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
              {item.image && (
                <div className="relative mb-5 aspect-[3/2] overflow-hidden rounded-md bg-navy-100">
                  <Image
                    src={item.image}
                    alt=""
                    fill
                    sizes="(min-width: 768px) 350px, 100vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                  />
                </div>
              )}
              <p className="flex items-baseline gap-3 text-caption">
                <span className="font-medium uppercase tracking-[0.08em] text-rose-600">
                  {item.categoryName}
                </span>
                <span className="text-grey-500">{item.date}</span>
              </p>
              <h3 className="mt-4 text-h4 font-semibold leading-snug text-ink transition-colors duration-200 group-hover:text-royal-600">
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
