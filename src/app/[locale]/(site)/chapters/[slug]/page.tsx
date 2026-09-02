import Image from "next/image";
import { notFound } from "next/navigation";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Container } from "@/components/ui/Container";
import { ButtonLink } from "@/components/ui/Button";
import { ReviewNote } from "@/components/ui/ReviewNote";
import {
  getChapterBySlug,
  getChapters,
  type ChapterWithExtras,
} from "@/services/organisation";
import { getNewsByChapter } from "@/services/news";
import { getEventsByChapter } from "@/services/events";
import { loc, formatDate, melbourneDay, mediaUrl } from "@/lib/utils/l10n";
import { cn } from "@/lib/utils/cn";
import { isPreviewDeployment } from "@/lib/preview";
import { designFixturesEnabled } from "@/lib/fixtures/design-review";
import { pageMetadata } from "@/lib/seo";
import type { Locale } from "@/i18n/routing";
import type { Metadata } from "next";

export const revalidate = 300;

type ListField = "resources" | "experts" | "certifications" | "services";

/** Locale list pair (`{field}_zh` / `{field}_en`) with fallback to the other
 *  language, mirroring loc() for text columns. */
function locList(
  chapter: ChapterWithExtras,
  field: ListField,
  locale: Locale,
): string[] {
  const other: Locale = locale === "zh" ? "en" : "zh";
  const primary = chapter[`${field}_${locale}`];
  return primary.length > 0 ? primary : chapter[`${field}_${other}`];
}

function toParagraphs(text: string): string[] {
  return text
    .split(/\n+/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
}

export async function generateStaticParams() {
  const chapters = await getChapters().catch(() => []);
  return chapters.map((chapter) => ({ slug: chapter.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const chapter = await getChapterBySlug(slug).catch(() => null);
  if (!chapter) return {};
  const t = await getTranslations({ locale, namespace: "chapters" });
  const l = locale as Locale;
  return pageMetadata({
    locale,
    path: `/chapters/${slug}`,
    title: loc(chapter, "name", l),
    description:
      loc(chapter, "tagline", l) ||
      toParagraphs(loc(chapter, "description", l))[0] ||
      t("standfirst"),
  });
}

type Block = {
  id: string;
  /** Present only when the block renders its own h2 (drives the in-page nav). */
  heading?: string;
  content: React.ReactNode;
};

function BlockHeading({
  title,
  standfirst,
}: {
  title: string;
  standfirst?: string;
}) {
  return (
    <div className="max-w-[42rem]">
      <h2 className="text-h3 font-semibold text-ink">{title}</h2>
      {standfirst && (
        <p className="mt-3 text-body text-grey-600">{standfirst}</p>
      )}
    </div>
  );
}

function RuleList({ items }: { items: string[] }) {
  return (
    <ul className="mt-8 grid gap-x-12 gap-y-4 md:grid-cols-2">
      {items.map((item, i) => (
        <li
          key={i}
          className="flex items-start gap-3 border-b border-grey-100 pb-4 text-body text-ink"
        >
          <span
            className="mt-[0.7em] h-0.5 w-4 shrink-0 rounded-full bg-gold-600"
            aria-hidden
          />
          {item}
        </li>
      ))}
    </ul>
  );
}

export default async function ChapterPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale: rawLocale, slug } = await params;
  setRequestLocale(rawLocale);
  const locale = rawLocale as Locale;
  const t = await getTranslations("chapters");
  const tCommon = await getTranslations("common");

  const chapter = await getChapterBySlug(slug).catch(() => null);
  if (!chapter) notFound();

  const [news, events] = await Promise.all([
    getNewsByChapter(slug, 3).catch(() => []),
    getEventsByChapter(slug, 3).catch(() => []),
  ]);

  const name = loc(chapter, "name", locale);
  const tagline = loc(chapter, "tagline", locale);
  const paragraphs = toParagraphs(loc(chapter, "description", locale));
  const resources = locList(chapter, "resources", locale);
  const experts = locList(chapter, "experts", locale);
  const certifications = locList(chapter, "certifications", locale);
  const services = locList(chapter, "services", locale);
  const hasSecretariat = Boolean(
    chapter.secretary_general || chapter.contact_email,
  );
  const copyPending = [
    paragraphs,
    resources,
    experts,
    certifications,
    services,
  ].every((list) => list.length === 0);
  const consultHref = `/contact?topic=${encodeURIComponent(name)}`;

  const blocks: Block[] = [];

  // 1 · Industry introduction (+ secretariat panel when the chapter has one)
  if (paragraphs.length > 0 || hasSecretariat) {
    blocks.push({
      id: "intro",
      heading: paragraphs.length > 0 ? t("introTitle") : undefined,
      content: (
        <div className="grid gap-12 md:grid-cols-12 md:gap-16">
          {paragraphs.length > 0 && (
            <div className="md:col-span-7">
              <BlockHeading title={t("introTitle")} />
              <div className="mt-6 space-y-5">
                {paragraphs.map((paragraph, i) => (
                  <p
                    key={i}
                    className="text-body leading-relaxed text-grey-600"
                  >
                    {paragraph}
                  </p>
                ))}
              </div>
            </div>
          )}
          {hasSecretariat && (
            <aside
              className={cn(
                "md:col-span-4",
                paragraphs.length > 0 && "md:col-start-9",
              )}
            >
              <div className="card-surface divide-y divide-grey-100">
                {chapter.secretary_general && (
                  <div className="px-6 py-5">
                    <p className="text-caption font-semibold uppercase tracking-[0.06em] text-sea-800">
                      {t("secretaryGeneral")}
                    </p>
                    <p className="mt-1.5 text-body font-medium text-ink">
                      {chapter.secretary_general}
                    </p>
                  </div>
                )}
                {chapter.contact_email && (
                  <div className="px-6 py-5">
                    <p className="text-caption font-semibold uppercase tracking-[0.06em] text-sea-800">
                      {tCommon("contactUs")}
                    </p>
                    <a
                      href={`mailto:${chapter.contact_email}`}
                      className="mt-1.5 block text-body font-medium text-sea-800 transition-colors hover:text-sea-600"
                    >
                      {chapter.contact_email}
                    </a>
                  </div>
                )}
              </div>
            </aside>
          )}
        </div>
      ),
    });
  }

  // 2 · Australian agents / channel resources
  if (resources.length > 0) {
    blocks.push({
      id: "resources",
      heading: t("resourcesTitle"),
      content: (
        <>
          <BlockHeading title={t("resourcesTitle")} />
          <RuleList items={resources} />
        </>
      ),
    });
  }

  // 3 · Expert advisers
  if (experts.length > 0) {
    blocks.push({
      id: "experts",
      heading: t("expertsTitle"),
      content: (
        <>
          <BlockHeading title={t("expertsTitle")} />
          <ul className="mt-8 grid gap-4 sm:grid-cols-2 md:grid-cols-3">
            {experts.map((item, i) => (
              <li
                key={i}
                className="card-surface p-6 text-body leading-relaxed text-ink"
              >
                {item}
              </li>
            ))}
          </ul>
        </>
      ),
    });
  }

  // 4 · Certification information
  if (certifications.length > 0) {
    blocks.push({
      id: "certifications",
      heading: t("certsTitle"),
      content: (
        <>
          <BlockHeading
            title={t("certsTitle")}
            standfirst={t("certsStandfirst")}
          />
          <RuleList items={certifications} />
        </>
      ),
    });
  }

  // 5 · ABS industry services
  if (services.length > 0) {
    blocks.push({
      id: "services",
      heading: t("absTitle"),
      content: (
        <div className="grid gap-10 md:grid-cols-12 md:gap-16">
          <div className="md:col-span-5">
            <BlockHeading title={t("absTitle")} />
          </div>
          <div className="md:col-span-7">
            <ol>
              {services.map((item, i) => (
                <li
                  key={i}
                  className="grid grid-cols-[2.5rem_1fr] items-baseline gap-4 border-t border-grey-100 py-4 first:border-t-0 first:pt-0"
                >
                  <span className="text-h4 font-semibold tabular-nums text-grey-300">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="text-body text-ink">{item}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      ),
    });
  }

  // 6 · Industry news
  if (news.length > 0) {
    blocks.push({
      id: "news",
      heading: t("newsTitle"),
      content: (
        <>
          <div className="flex items-end justify-between gap-6">
            <BlockHeading title={t("newsTitle")} />
            <Link
              href="/news"
              className="hidden shrink-0 text-small font-medium text-sea-800 transition-colors hover:text-sea-600 md:block"
            >
              {tCommon("viewAll")} →
            </Link>
          </div>
          {/* The fixture build associates real published rows with this
              chapter for demonstration only; production never does. */}
          {designFixturesEnabled() && (
            <ReviewNote className="mt-6">{t("demoAssociationNote")}</ReviewNote>
          )}
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {news.map((article) => {
              const cover = mediaUrl(article.cover_image_path);
              return (
                <Link
                  key={article.id}
                  href={`/news/${article.slug}`}
                  className="card-surface group block h-full overflow-hidden transition-shadow duration-300 hover:shadow-card-hover"
                >
                  {cover && (
                    <div className="relative aspect-[3/2] overflow-hidden bg-sea-50">
                      <Image
                        src={cover}
                        alt=""
                        fill
                        sizes="(min-width: 768px) 350px, 100vw"
                        className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                      />
                    </div>
                  )}
                  <div className="p-6">
                    <p className="text-caption text-grey-500">
                      {formatDate(article.published_at, locale)}
                    </p>
                    <h3 className="mt-3 text-body font-semibold leading-snug text-ink transition-colors duration-200 group-hover:text-sea-800">
                      {loc(article, "title", locale)}
                    </h3>
                  </div>
                </Link>
              );
            })}
          </div>
        </>
      ),
    });
  }

  // 7 · Past events
  if (events.length > 0) {
    blocks.push({
      id: "events",
      heading: t("eventsTitle"),
      content: (
        <>
          <BlockHeading title={t("eventsTitle")} />
          {designFixturesEnabled() && (
            <ReviewNote className="mt-6">{t("demoAssociationNote")}</ReviewNote>
          )}
          <div className="mt-8 space-y-4">
            {events.map((event) => {
              const location = loc(event, "location", locale);
              return (
                <Link
                  key={event.id}
                  href={`/events/${event.slug}`}
                  className="card-surface group grid grid-cols-[4.5rem_1fr] items-center gap-5 p-5 transition-shadow duration-300 hover:shadow-card-hover"
                >
                  <p className="flex h-[4.5rem] flex-col items-center justify-center rounded-xl bg-sea-800 text-white">
                    <span className="text-h3 font-semibold leading-none tabular-nums">
                      {melbourneDay(event.starts_at)}
                    </span>
                    <span className="mt-1 text-[0.6875rem] tracking-[0.04em] text-white/75">
                      {formatDate(event.starts_at, locale, {
                        year: "numeric",
                        month: "short",
                      })}
                    </span>
                  </p>
                  <div>
                    <h3 className="text-h4 font-semibold leading-snug text-ink transition-colors duration-200 group-hover:text-sea-800">
                      {loc(event, "title", locale)}
                    </h3>
                    {location && (
                      <p className="mt-1.5 text-small text-grey-500">
                        {location}
                      </p>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        </>
      ),
    });
  }

  const navItems = blocks.filter(
    (block): block is Block & { heading: string } => Boolean(block.heading),
  );

  return (
    <>
      {/* Chapter header with the two CTAs (8 · consult, 9 · apply) */}
      <section className="border-b border-grey-100 bg-sea-50">
        <Container className="pb-12 pt-12 md:pb-16 md:pt-16">
          <p className="flex items-center gap-3 text-caption font-semibold uppercase tracking-[0.06em] text-sea-800">
            <span className="h-0.5 w-6 rounded-full bg-gold-600" aria-hidden />
            {t("title")}
          </p>
          <h1 className="mt-4 max-w-[20em] text-[2rem] font-semibold leading-[1.2] tracking-[-0.02em] text-ink md:text-h1">
            {name}
          </h1>
          {tagline && (
            <p className="mt-5 max-w-[36rem] text-body-lg text-grey-600">
              {tagline}
            </p>
          )}
          <div className="mt-8 flex flex-wrap gap-4">
            <ButtonLink href={consultHref} variant="primary">
              {t("consultCta")}
            </ButtonLink>
            <ButtonLink href="/membership/apply" variant="secondary">
              {t("joinCta")}
            </ButtonLink>
          </div>
        </Container>
        {navItems.length >= 2 && (
          <nav
            aria-label={t("sectionsLabel")}
            className="border-t border-grey-100 bg-white"
          >
            <Container>
              <ul className="-mx-1 flex gap-x-1 overflow-x-auto py-1 text-small font-medium">
                {navItems.map((block) => (
                  <li key={block.id} className="shrink-0">
                    <a
                      href={`#${block.id}`}
                      className="inline-block rounded-md px-3 py-2.5 text-sea-800 transition-colors hover:bg-sea-50 hover:text-sea-900"
                    >
                      {block.heading}
                    </a>
                  </li>
                ))}
              </ul>
            </Container>
          </nav>
        )}
      </section>

      {copyPending && isPreviewDeployment() && (
        <div className="bg-white">
          <Container className="pt-10 md:pt-12">
            <ReviewNote />
          </Container>
        </div>
      )}

      {blocks.map((block, i) => (
        <section
          key={block.id}
          id={block.id}
          className={cn(
            "scroll-mt-24 py-16 md:py-20",
            i % 2 === 0 ? "bg-white" : "bg-grey-50",
          )}
        >
          <Container>{block.content}</Container>
        </section>
      ))}

      {/* Back link + closing dual CTA band (8 · consult, 9 · apply) */}
      <section
        className={cn(
          "bg-white pb-16 md:pb-24",
          blocks.length === 0 && "pt-12 md:pt-16",
        )}
      >
        <Container>
          <Link
            href="/chapters"
            className="inline-block text-small font-medium text-sea-800 transition-colors hover:text-sea-600"
          >
            ← {t("backToChapters")}
          </Link>
          <div className="mt-10 rounded-2xl bg-sea-800 px-8 py-10 text-center text-white md:px-14">
            <h2 className="mx-auto max-w-[24em] text-h3 font-semibold tracking-[-0.01em]">
              {t("consultPrompt")}
            </h2>
            <div className="mt-7 flex flex-wrap justify-center gap-4">
              <Link
                href={consultHref}
                className="inline-flex h-11 items-center justify-center rounded-full bg-white px-7 text-small font-medium text-sea-800 transition-colors duration-200 hover:bg-sea-100"
              >
                {t("consultCta")}
              </Link>
              <Link
                href="/membership/apply"
                className="inline-flex h-11 items-center justify-center rounded-full border border-white/40 px-7 text-small font-medium text-white transition-colors duration-200 hover:bg-white/10"
              >
                {t("joinCta")}
              </Link>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
