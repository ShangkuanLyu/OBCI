"use client";

import { useMemo, useState } from "react";
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
  featured: boolean;
  tags: string[];
};

export type NewsCategoryItem = { slug: string; name: string };
export type NewsTagItem = { value: string; label: string };

/**
 * Client-side search + category tabs + industry-tag filter + pinned area
 * over the pre-fetched corpus (static-export friendly — no server round
 * trips; the full published list is already serialized into the page).
 */
export function NewsIndex({
  items,
  categories,
  tags,
}: {
  items: NewsListItem[];
  categories: NewsCategoryItem[];
  tags: NewsTagItem[];
}) {
  const t = useTranslations("news");
  const [active, setActive] = useState<string | null>(null);
  const [tag, setTag] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter((item) => {
      if (active && item.categorySlug !== active) return false;
      if (tag && !item.tags.includes(tag)) return false;
      if (
        q &&
        !item.title.toLowerCase().includes(q) &&
        !item.summary.toLowerCase().includes(q)
      )
        return false;
      return true;
    });
  }, [items, active, tag, query]);

  const searching = query.trim() !== "" || tag !== null;
  const pinned = searching ? [] : filtered.filter((item) => item.featured);
  const regular = searching
    ? filtered
    : filtered.filter((item) => !item.featured);
  const [lead, ...rest] = regular;

  const tabClass = (isActive: boolean) =>
    cn(
      "relative shrink-0 pb-4 text-small transition-colors",
      isActive
        ? "font-medium text-sea-800"
        : "text-grey-500 hover:text-sea-800",
    );

  const meta = (item: NewsListItem) => (
    <p className="flex flex-wrap items-center gap-3 text-caption">
      <span className="rounded-full bg-sea-50 px-2.5 py-1 font-medium text-sea-800">
        {item.categoryName}
      </span>
      {item.featured && !searching && (
        <span className="rounded-full bg-gold-50 px-2.5 py-1 font-medium text-gold-600">
          {t("featured")}
        </span>
      )}
      <span className="text-grey-500">{item.date}</span>
    </p>
  );

  return (
    <>
      {/* Search + industry-tag filter row */}
      <div className="flex flex-wrap items-center gap-x-6 gap-y-4 pb-6">
        <div className="w-full max-w-[22rem]">
          <label htmlFor="news-search" className="sr-only">
            {t("searchLabel")}
          </label>
          <input
            id="news-search"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t("searchPlaceholder")}
            className="h-11 w-full rounded-full border border-grey-300 bg-white px-5 text-small transition-colors focus:border-sea-600"
          />
        </div>
        {tags.length > 0 && (
          <div
            className="flex flex-wrap items-center gap-2"
            role="group"
            aria-label={t("tagsLabel")}
          >
            <span className="text-caption text-grey-500">{t("tagsLabel")}</span>
            {tags.map((item) => (
              <button
                key={item.value}
                type="button"
                onClick={() => setTag(tag === item.value ? null : item.value)}
                aria-pressed={tag === item.value}
                className={cn(
                  "rounded-full border px-3 py-1 text-caption font-medium transition-colors",
                  tag === item.value
                    ? "border-sea-800 bg-sea-800 text-white"
                    : "border-grey-300 text-grey-600 hover:border-sea-600 hover:text-sea-800",
                )}
              >
                {item.label}
              </button>
            ))}
          </div>
        )}
      </div>

      <nav
        aria-label={t("title")}
        className="flex gap-8 overflow-x-auto border-b border-grey-300"
      >
        <button
          type="button"
          onClick={() => setActive(null)}
          className={tabClass(!active)}
        >
          {t("all")}
          {!active && (
            <span className="absolute inset-x-0 bottom-0 h-0.5 bg-sea-800" />
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
              <span className="absolute inset-x-0 bottom-0 h-0.5 bg-sea-800" />
            )}
          </button>
        ))}
      </nav>

      {filtered.length === 0 && (
        <p className="py-20 text-body text-grey-500" role="status">
          {searching ? t("noResults") : t("empty")}
        </p>
      )}

      {/* Pinned strip (hidden while searching/filtering) */}
      {pinned.length > 0 && (
        <div className="border-b border-grey-100 py-10">
          <p className="text-caption font-semibold uppercase tracking-[0.06em] text-gold-600">
            {t("featured")}
          </p>
          <div className="mt-5 grid gap-x-10 gap-y-6 md:grid-cols-3">
            {pinned.slice(0, 3).map((item) => (
              <Link
                key={item.id}
                href={`/news/${item.slug}`}
                className="group block border-l-2 border-grey-100 pl-4 transition-colors hover:border-gold-600"
              >
                <p className="text-caption text-grey-500">{item.date}</p>
                <h3 className="mt-1.5 text-body font-semibold leading-snug text-ink transition-colors duration-200 group-hover:text-sea-800">
                  {item.title}
                </h3>
              </Link>
            ))}
          </div>
        </div>
      )}

      {lead && (
        <Link href={`/news/${lead.slug}`} className="group block py-12 md:py-14">
          <div className="grid items-center gap-8 md:grid-cols-12">
            {lead.image && (
              <div className="relative aspect-[3/2] overflow-hidden rounded-md bg-sea-50 md:order-2 md:col-span-6">
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
              {meta(lead)}
              <h2 className="mt-5 text-h3 font-semibold leading-[1.25] tracking-[-0.01em] text-ink transition-colors duration-200 group-hover:text-sea-800 md:text-[2rem]">
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
                <div className="relative mb-5 aspect-[3/2] overflow-hidden rounded-md bg-sea-50">
                  <Image
                    src={item.image}
                    alt=""
                    fill
                    sizes="(min-width: 768px) 350px, 100vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                  />
                </div>
              )}
              {meta(item)}
              <h3 className="mt-4 text-h4 font-semibold leading-snug text-ink transition-colors duration-200 group-hover:text-sea-800">
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
