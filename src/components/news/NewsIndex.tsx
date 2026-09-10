"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils/cn";
import {
  EMPTY_FILTER,
  filterNews,
  isFiltering,
  layoutNews,
  normaliseSlug,
  type CategoryOption,
  type NewsFilter,
  type NewsFilterItem,
  type TagOption,
} from "@/lib/news/filter";
import { filterFromSearch, searchFromFilter } from "./url-state";

export type NewsListItem = NewsFilterItem;
export type NewsCategoryItem = CategoryOption;
export type NewsTagItem = TagOption;

const noopSubscribe = () => () => {};

// Safari rate-limits history.replaceState, so keystrokes are coalesced
// before the filter is mirrored into the URL.
const URL_SYNC_MS = 250;

const cardImageClass =
  "object-cover transition-transform duration-500 group-hover:scale-[1.03]";

function Tab({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "relative shrink-0 pb-4 text-small transition-colors",
        active ? "font-medium text-sea-800" : "text-grey-500 hover:text-sea-800",
      )}
    >
      {children}
      {active && (
        <span
          aria-hidden
          className="absolute inset-x-0 bottom-0 h-0.5 bg-sea-800"
        />
      )}
    </button>
  );
}

function FilterChip({
  label,
  removeLabel,
  onRemove,
}: {
  label: string;
  removeLabel: string;
  onRemove: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onRemove}
      className="inline-flex items-center gap-1.5 rounded-full border border-sea-800 bg-sea-800 px-3 py-1 text-caption font-medium text-white transition-colors hover:bg-sea-700"
    >
      <span>{label}</span>
      <span className="sr-only">, {removeLabel}</span>
      <span aria-hidden>×</span>
    </button>
  );
}

/**
 * Client-side category tabs, industry-tag chips and search over the
 * pre-fetched corpus (static-export friendly: the full published list is
 * serialised into the page). Filtering itself lives in lib/news/filter.
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
  // The static export has no server-side params: the server render (and
  // hydration) is unfiltered, then the URL state applies on the client.
  const initialSearch = useSyncExternalStore(
    noopSubscribe,
    () => window.location.search,
    () => "",
  );
  const [edits, setEdits] = useState<NewsFilter | null>(null);

  const filter = useMemo<NewsFilter>(() => {
    if (edits) return edits;
    const fromUrl = filterFromSearch(initialSearch);
    const category = normaliseSlug(fromUrl.category);
    const tag = normaliseSlug(fromUrl.tag);
    return {
      category:
        category && categories.some((option) => option.slug === category)
          ? category
          : null,
      tag: tag && tags.some((option) => option.value === tag) ? tag : null,
      query: fromUrl.query,
    };
  }, [edits, initialSearch, categories, tags]);

  useEffect(() => {
    if (!edits) return;
    const timer = window.setTimeout(() => {
      const { pathname, search, hash } = window.location;
      const next = searchFromFilter(edits);
      if (next === search) return;
      window.history.replaceState(
        window.history.state,
        "",
        `${pathname}${next}${hash}`,
      );
    }, URL_SYNC_MS);
    return () => window.clearTimeout(timer);
  }, [edits]);

  const searchRef = useRef<HTMLInputElement>(null);
  const update = (patch: Partial<NewsFilter>) =>
    setEdits({ ...filter, ...patch });
  // Removing a chip or clearing unmounts the control that had focus; hand
  // focus to the search box so keyboard users keep their place.
  const remove = (patch: Partial<NewsFilter>) => {
    update(patch);
    searchRef.current?.focus();
  };
  const clearAll = () => {
    setEdits(EMPTY_FILTER);
    searchRef.current?.focus();
  };

  const filtering = isFiltering(filter);
  const filtered = useMemo(() => filterNews(items, filter), [items, filter]);
  const { pinned, regular } = useMemo(
    () => layoutNews(filtered, filter),
    [filtered, filter],
  );
  const [lead, ...rest] = regular;

  const query = filter.query.trim();
  const activeCategory = categories.find(
    (option) => option.slug === filter.category,
  );
  const activeTag = tags.find((option) => option.value === filter.tag);

  const clearButtonClass =
    "text-caption font-medium text-sea-800 underline decoration-grey-300 underline-offset-4 transition-colors hover:text-sea-600";

  // A category-only tab with no article yet is an empty state, not a
  // failed search.
  const categoryOnly =
    filter.category !== null && filter.tag === null && query === "";

  const meta = (item: NewsListItem) => (
    <p className="flex flex-wrap items-center gap-3 text-caption">
      {item.categoryName !== "" && (
        <span className="rounded-full bg-sea-50 px-2.5 py-1 font-medium text-sea-800">
          {item.categoryName}
        </span>
      )}
      {item.featured && !filtering && (
        <span className="rounded-full border border-sea-200 px-2.5 py-1 font-medium text-sea-800">
          {t("featured")}
        </span>
      )}
      {item.date !== "" && <span className="text-grey-500">{item.date}</span>}
    </p>
  );

  return (
    <>
      {/* Search + industry-tag filter row */}
      <div className="flex flex-wrap items-center gap-x-6 gap-y-4 pb-6">
        <div className="relative w-full max-w-[22rem]">
          <label htmlFor="news-search" className="sr-only">
            {t("searchLabel")}
          </label>
          <input
            ref={searchRef}
            id="news-search"
            type="search"
            value={filter.query}
            onChange={(event) => update({ query: event.target.value })}
            placeholder={t("searchPlaceholder")}
            className="h-11 w-full rounded-full border border-grey-300 bg-white pl-5 pr-11 text-small transition-colors focus:border-sea-600 [&::-webkit-search-cancel-button]:appearance-none"
          />
          {filter.query !== "" && (
            <button
              type="button"
              onClick={() => remove({ query: "" })}
              className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-grey-500 transition-colors hover:text-sea-800"
            >
              <span className="sr-only">{t("clearSearch")}</span>
              <span aria-hidden>×</span>
            </button>
          )}
        </div>
        {tags.length > 0 && (
          <div
            className="flex flex-wrap items-center gap-2"
            role="group"
            aria-label={t("tagsLabel")}
          >
            <span className="text-caption text-grey-500">{t("tagsLabel")}</span>
            {tags.map((option) => {
              const active = filter.tag === option.value;
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => update({ tag: active ? null : option.value })}
                  aria-pressed={active}
                  className={cn(
                    "rounded-full border px-3 py-1 text-caption font-medium transition-colors",
                    active
                      ? "border-sea-800 bg-sea-800 text-white"
                      : "border-grey-300 text-grey-600 hover:border-sea-600 hover:text-sea-800",
                  )}
                >
                  {option.label}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Category tabs */}
      <div
        role="group"
        aria-label={t("categoriesLabel")}
        className="flex gap-8 overflow-x-auto border-b border-grey-300"
      >
        <Tab
          active={filter.category === null}
          onClick={() => update({ category: null })}
        >
          {t("all")}
        </Tab>
        {categories.map((option) => (
          <Tab
            key={option.slug}
            active={filter.category === option.slug}
            onClick={() => update({ category: option.slug })}
          >
            {option.name}
            <span className="sr-only">, </span>
            <span className="ml-1.5 text-caption text-grey-500">
              {option.count}
            </span>
          </Tab>
        ))}
      </div>

      {filtering && (
        <div className="flex flex-wrap items-center gap-2 pt-5">
          <span className="text-caption text-grey-500">
            {t("activeFilters")}
          </span>
          {activeCategory && (
            <FilterChip
              label={t("filterCategory", { name: activeCategory.name })}
              removeLabel={t("removeFilter")}
              onRemove={() => remove({ category: null })}
            />
          )}
          {activeTag && (
            <FilterChip
              label={t("filterTag", { name: activeTag.label })}
              removeLabel={t("removeFilter")}
              onRemove={() => remove({ tag: null })}
            />
          )}
          {query !== "" && (
            <FilterChip
              label={t("filterQuery", { query })}
              removeLabel={t("removeFilter")}
              onRemove={() => remove({ query: "" })}
            />
          )}
          <button type="button" onClick={clearAll} className={clearButtonClass}>
            {t("clearFilters")}
          </button>
        </div>
      )}

      {/* Persistent status region: result count while filtering, empty state
          when nothing matches. */}
      <div
        role="status"
        aria-live="polite"
        className={cn(
          filtered.length === 0 ? "py-20" : filtering ? "pt-6" : undefined,
        )}
      >
        {filtered.length === 0 ? (
          <>
            <p className="text-body text-grey-500">
              {filtering && !categoryOnly ? t("noResultsFiltered") : t("empty")}
            </p>
            {filtering && (
              <button
                type="button"
                onClick={clearAll}
                className={cn("mt-4", clearButtonClass)}
              >
                {t("clearFilters")}
              </button>
            )}
          </>
        ) : filtering ? (
          <p className="text-caption text-grey-500">
            {t("resultCount", { count: filtered.length })}
          </p>
        ) : null}
      </div>

      {/* Pinned strip (only while nothing is filtered) */}
      {pinned.length > 0 && (
        <section
          aria-labelledby="news-pinned-title"
          className="border-b border-grey-100 py-10"
        >
          <h2
            id="news-pinned-title"
            className="flex items-center gap-3 text-caption font-semibold uppercase tracking-[0.06em] text-sea-800"
          >
            <span className="h-0.5 w-6 rounded-full bg-gold-600" aria-hidden />
            {t("featuredTitle")}
          </h2>
          <ul className="mt-5 grid gap-x-10 gap-y-6 md:grid-cols-3">
            {pinned.map((item) => (
              <li key={item.id}>
                <Link
                  href={`/news/${item.slug}`}
                  className="group block border-l-2 border-grey-100 pl-4 transition-colors hover:border-gold-600"
                >
                  {item.date !== "" && (
                    <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-caption text-grey-500">
                      <span>{item.date}</span>
                    </p>
                  )}
                  <h3 className="mt-1.5 text-body font-semibold leading-snug text-ink transition-colors duration-200 group-hover:text-sea-800">
                    {item.title}
                  </h3>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {regular.length > 0 && (
        <section aria-labelledby="news-list-title">
          <h2 id="news-list-title" className="sr-only">
            {t("listTitle")}
          </h2>

          {lead && (
            <Link
              href={`/news/${lead.slug}`}
              className="group block py-12 md:py-14"
            >
              <div className="grid items-center gap-8 md:grid-cols-12">
                {lead.image && (
                  <div className="relative aspect-[3/2] overflow-hidden rounded-md bg-sea-50 md:order-2 md:col-span-6">
                    <Image
                      src={lead.image}
                      alt=""
                      fill
                      sizes="(min-width: 768px) 540px, 100vw"
                      className={cardImageClass}
                    />
                  </div>
                )}
                <div
                  className={cn(lead.image ? "md:col-span-6" : "md:col-span-8")}
                >
                  {meta(lead)}
                  <h3 className="mt-5 text-h3 font-semibold leading-[1.25] tracking-[-0.01em] text-ink transition-colors duration-200 group-hover:text-sea-800 md:text-[2rem]">
                    {lead.title}
                  </h3>
                  <p className="mt-5 max-w-[42rem] text-body leading-relaxed text-grey-600">
                    {lead.summary}
                  </p>
                </div>
              </div>
            </Link>
          )}

          {rest.length > 0 && (
            <ul className="grid gap-x-10 gap-y-12 border-t border-grey-300 pt-12 md:grid-cols-3">
              {rest.map((item) => (
                <li key={item.id}>
                  <Link href={`/news/${item.slug}`} className="group block">
                    {item.image && (
                      <div className="relative mb-5 aspect-[3/2] overflow-hidden rounded-md bg-sea-50">
                        <Image
                          src={item.image}
                          alt=""
                          fill
                          sizes="(min-width: 768px) 350px, 100vw"
                          className={cardImageClass}
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
                </li>
              ))}
            </ul>
          )}
        </section>
      )}
    </>
  );
}
