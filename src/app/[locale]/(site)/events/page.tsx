import Image from "next/image";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Container } from "@/components/ui/Container";
import { PageHero } from "@/components/ui/PageHero";
import { getPastEvents, getUpcomingEvents } from "@/services/events";
import type { EventRow } from "@/services/events";
import { loc, formatDate, mediaUrl } from "@/lib/utils/l10n";
import type { Locale } from "@/i18n/routing";
import type { Metadata } from "next";

export const revalidate = 300;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "events" });
  return { title: t("title"), description: t("standfirst") };
}

/** One event — card row with royal date chip + thumbnail (home pattern). */
function EventItem({ event, locale }: { event: EventRow; locale: Locale }) {
  const location = loc(event, "location", locale);
  const cover = mediaUrl(event.cover_image_path);
  return (
    <Link
      href={`/events/${event.slug}`}
      className="card-surface group grid grid-cols-[4.5rem_1fr] items-center gap-5 p-5 transition-shadow duration-300 hover:shadow-[0_2px_4px_rgba(5,5,62,0.06),0_16px_40px_-16px_rgba(5,5,62,0.25)] md:grid-cols-[4.5rem_1fr_9rem] md:gap-6"
    >
      <p className="flex h-[4.5rem] flex-col items-center justify-center rounded-xl bg-royal-600 text-white">
        <span className="text-h3 font-semibold leading-none">
          {new Date(event.starts_at).getDate()}
        </span>
        <span className="mt-1 text-[0.6875rem] tracking-[0.04em] text-white/75">
          {formatDate(event.starts_at, locale, {
            year: "numeric",
            month: "short",
          })}
        </span>
      </p>
      <div>
        <h3 className="text-h4 font-semibold leading-snug text-ink transition-colors duration-200 group-hover:text-royal-600">
          {loc(event, "title", locale)}
        </h3>
        {location && (
          <p className="mt-1.5 text-small text-grey-500">{location}</p>
        )}
      </div>
      {cover && (
        <div className="relative hidden aspect-[16/10] overflow-hidden rounded-lg md:block">
          <Image
            src={cover}
            alt=""
            fill
            sizes="144px"
            className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />
        </div>
      )}
    </Link>
  );
}

export default async function EventsIndexPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: rawLocale } = await params;
  setRequestLocale(rawLocale);
  const locale = rawLocale as Locale;
  const t = await getTranslations("events");

  const [upcoming, past] = await Promise.all([
    getUpcomingEvents().catch(() => []),
    getPastEvents().catch(() => []),
  ]);

  return (
    <>
      <PageHero
        label="Events"
        title={t("title")}
        standfirst={t("standfirst")}
      />

      {upcoming.length === 0 && past.length === 0 && (
        <section className="bg-white py-16 md:py-24">
          <Container>
            <p className="text-body text-grey-500">{t("empty")}</p>
          </Container>
        </section>
      )}

      {/* Upcoming — card rows with date chip + thumbnail */}
      {upcoming.length > 0 && (
        <section className="bg-white py-16 md:py-24">
          <Container>
            <h2 className="text-h3 font-semibold tracking-[-0.01em] text-ink">
              {t("upcoming")}
            </h2>
            <div className="mt-10 space-y-4">
              {upcoming.map((event) => (
                <EventItem key={event.id} event={event} locale={locale} />
              ))}
            </div>
          </Container>
        </section>
      )}

      {/* Past events */}
      {past.length > 0 && (
        <section
          className={
            upcoming.length > 0
              ? "border-t border-grey-100 bg-royal-50 py-16 md:py-24"
              : "bg-white py-16 md:py-24"
          }
        >
          <Container>
            <h2 className="text-h3 font-semibold tracking-[-0.01em] text-ink">
              {t("past")}
            </h2>
            <div className="mt-10 space-y-4">
              {past.map((event) => (
                <EventItem key={event.id} event={event} locale={locale} />
              ))}
            </div>
          </Container>
        </section>
      )}
    </>
  );
}
