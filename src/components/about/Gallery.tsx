import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { getPublishedNews } from "@/services/news";
import { getPastEvents, getUpcomingEvents } from "@/services/events";
import { loc, mediaUrl } from "@/lib/utils/l10n";
import type { GalleryItem } from "@/lib/fixtures/design-review";
import type { Locale } from "@/i18n/routing";

export type ResolvedGalleryItem = {
  key: string;
  src: string;
  caption: string;
  href: string | null;
};

/**
 * Resolve gallery entries against the published news/event rows: the
 * caption and link come from the source row when a slug is set, so the
 * gallery can never show an unpublished or invented caption. An entry whose
 * source row is not published is dropped; entries without a source use
 * their own CMS caption, or are dropped when that is empty too.
 */
export async function resolveGalleryItems(
  items: GalleryItem[],
  locale: Locale,
): Promise<ResolvedGalleryItem[]> {
  if (items.length === 0) return [];
  const needsNews = items.some((item) => item.news_slug);
  const needsEvents = items.some((item) => item.event_slug);
  const [news, upcoming, past] = await Promise.all([
    needsNews ? getPublishedNews().catch(() => []) : Promise.resolve([]),
    needsEvents ? getUpcomingEvents().catch(() => []) : Promise.resolve([]),
    needsEvents ? getPastEvents(100).catch(() => []) : Promise.resolve([]),
  ]);
  const events = [...upcoming, ...past];

  const resolved: ResolvedGalleryItem[] = [];
  for (const item of items) {
    const src = mediaUrl(item.image_path);
    if (!src) continue;
    let caption = "";
    let href: string | null = null;
    if (item.news_slug) {
      const row = news.find((article) => article.slug === item.news_slug);
      if (!row) continue;
      caption = loc(row, "title", locale);
      href = `/news/${row.slug}`;
    } else if (item.event_slug) {
      const row = events.find((event) => event.slug === item.event_slug);
      if (!row) continue;
      caption = loc(row, "title", locale);
      href = `/events/${row.slug}`;
    } else {
      caption = loc(item, "caption", locale);
    }
    if (!caption) continue;
    resolved.push({ key: item.image_path, src, caption, href });
  }
  return resolved;
}

/** Credentials / activity gallery grid; render only when items exist. */
export function Gallery({ items }: { items: ResolvedGalleryItem[] }) {
  if (items.length === 0) return null;
  return (
    <ul className="grid gap-5 sm:grid-cols-2 md:grid-cols-3">
      {items.map((item) => {
        const figure = (
          <figure>
            <div className="relative aspect-[4/3] overflow-hidden bg-sea-50">
              {/* The figcaption carries the title; the photo is decorative. */}
              <Image
                src={item.src}
                alt=""
                fill
                sizes="(min-width: 768px) 350px, (min-width: 640px) 50vw, 100vw"
                className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
              />
            </div>
            <figcaption className="p-4 text-small leading-relaxed text-grey-600">
              {item.caption}
            </figcaption>
          </figure>
        );
        return (
          <li key={item.key}>
            {item.href ? (
              <Link
                href={item.href}
                className="card-surface group block overflow-hidden transition-shadow duration-300 hover:shadow-card-hover"
              >
                {figure}
              </Link>
            ) : (
              <div className="card-surface overflow-hidden">{figure}</div>
            )}
          </li>
        );
      })}
    </ul>
  );
}
