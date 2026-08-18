import Image from "next/image";
import { notFound } from "next/navigation";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Container } from "@/components/ui/Container";
import { ButtonLink } from "@/components/ui/Button";
import { getAllEventSlugs, getEventBySlug } from "@/services/events";
import { loc, formatDate, mediaUrl } from "@/lib/utils/l10n";
import { renderMarkdown } from "@/lib/utils/markdown";
import { cn } from "@/lib/utils/cn";
import type { Locale } from "@/i18n/routing";
import type { Metadata } from "next";

export const revalidate = 300;

export async function generateStaticParams() {
  const slugs = await getAllEventSlugs().catch(() => []);
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const event = await getEventBySlug(slug).catch(() => null);
  if (!event) return {};
  return {
    title: loc(event, "title", locale as Locale),
    description: loc(event, "summary", locale as Locale),
  };
}

export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale: rawLocale, slug } = await params;
  setRequestLocale(rawLocale);
  const locale = rawLocale as Locale;
  const t = await getTranslations("events");

  const event = await getEventBySlug(slug).catch(() => null);
  if (!event) notFound();

  const startDate = formatDate(event.starts_at, locale);
  const endDate = event.ends_at ? formatDate(event.ends_at, locale) : "";
  const dateRange =
    endDate && endDate !== startDate ? `${startDate} – ${endDate}` : startDate;
  const location = loc(event, "location", locale);
  const summary = loc(event, "summary", locale);
  const body = loc(event, "body", locale);
  const cover = mediaUrl(event.cover_image_path);
  const isFuture = new Date(event.starts_at).getTime() > Date.now();

  return (
    <>
      {/* Event header — light editorial */}
      <section className="border-b border-grey-100 bg-royal-50">
        <Container className="pb-12 pt-12 md:pb-14 md:pt-16">
          <p className="flex flex-wrap items-center gap-x-3 gap-y-2 text-caption">
            <span className="rounded-full bg-white px-2.5 py-1 font-medium text-royal-600">
              {dateRange}
            </span>
            {location && <span className="text-grey-500">· {location}</span>}
          </p>
          <h1 className="mt-5 max-w-[24em] text-[1.75rem] font-semibold leading-[1.2] tracking-[-0.015em] text-ink md:text-[2.5rem] md:leading-[1.15]">
            {loc(event, "title", locale)}
          </h1>
          {summary && (
            <p className="mt-6 max-w-[36rem] text-body-lg text-grey-600">
              {summary}
            </p>
          )}
        </Container>
      </section>

      <article className="bg-white py-14 md:py-20">
        <Container>
          {cover && (
            <div className="relative mx-auto mb-12 aspect-[2/1] max-w-[56rem] overflow-hidden rounded-lg bg-royal-50">
              <Image
                src={cover}
                alt=""
                fill
                sizes="(min-width: 1024px) 896px, 100vw"
                className="object-cover"
                priority
              />
            </div>
          )}
          <div className="mx-auto max-w-[42rem]">
            {body && <div>{renderMarkdown(body)}</div>}

            {/* Action row */}
            <div
              className={cn(
                "flex flex-wrap items-center gap-x-6 gap-y-4",
                body && "mt-12 border-t border-grey-300 pt-8",
              )}
            >
              {isFuture && event.registration_open && event.registration_url ? (
                <a
                  href={event.registration_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-11 items-center justify-center rounded-lg bg-rose-500 px-6 text-small font-medium text-white transition-colors duration-200 hover:bg-rose-600"
                >
                  {t("registerInterest")}
                </a>
              ) : isFuture ? (
                <ButtonLink href="/contact" variant="primary">
                  {t("registerInterest")}
                </ButtonLink>
              ) : (
                <p className="text-small text-grey-500">
                  {t("registrationClosed")}
                </p>
              )}
            </div>

            <p className="mt-12 border-t border-grey-300 pt-6">
              <Link
                href="/events"
                className="text-small font-medium text-royal-600 transition-colors hover:text-royal-500"
              >
                ← {t("backToEvents")}
              </Link>
            </p>
          </div>
        </Container>
      </article>
    </>
  );
}
