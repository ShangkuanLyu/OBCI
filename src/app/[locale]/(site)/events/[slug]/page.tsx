import { notFound } from "next/navigation";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Container } from "@/components/ui/Container";
import { ButtonLink } from "@/components/ui/Button";
import { getAllEventSlugs, getEventBySlug } from "@/services/events";
import { loc, formatDate } from "@/lib/utils/l10n";
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
  const isFuture = new Date(event.starts_at).getTime() > Date.now();

  return (
    <>
      {/* Event header — navy, editorial */}
      <section className="bg-navy-900 text-white">
        <Container className="pb-14 pt-14 md:pb-16 md:pt-16">
          <p className="flex flex-wrap items-baseline gap-x-3 gap-y-1 text-caption">
            <span className="font-medium tracking-[0.08em] text-rose-400">
              {dateRange}
            </span>
            {location && <span className="text-white/60">· {location}</span>}
          </p>
          <h1 className="mt-5 max-w-[24em] text-[1.75rem] font-semibold leading-[1.2] tracking-[-0.015em] md:text-[2.5rem] md:leading-[1.15]">
            {loc(event, "title", locale)}
          </h1>
          {summary && (
            <p className="mt-6 max-w-[36rem] text-body-lg text-navy-100/85">
              {summary}
            </p>
          )}
        </Container>
      </section>

      <article className="bg-white py-14 md:py-20">
        <Container>
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
                  className="inline-flex h-11 items-center justify-center rounded-md bg-rose-500 px-6 text-small font-medium text-navy-950 transition-colors duration-200 hover:bg-rose-600"
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
                className="text-small font-medium text-navy-800 transition-colors hover:text-rose-600"
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
