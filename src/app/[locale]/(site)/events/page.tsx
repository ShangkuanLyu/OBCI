import { setRequestLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Container } from "@/components/ui/Container";
import { PageHero } from "@/components/ui/PageHero";
import { getPastEvents, getUpcomingEvents } from "@/services/events";
import type { EventRow } from "@/services/events";
import { loc, formatDate } from "@/lib/utils/l10n";
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

/** One event — date + typography + hairline-divider row (home pattern). */
function EventItem({ event, locale }: { event: EventRow; locale: Locale }) {
  const location = loc(event, "location", locale);
  return (
    <Link
      href={`/events/${event.slug}`}
      className="group grid grid-cols-[5.5rem_1fr] items-baseline gap-6 border-t border-grey-300 py-7 last:border-b md:grid-cols-[7rem_1fr_auto]"
    >
      <p>
        <span className="block text-h3 font-semibold leading-none text-navy-900">
          {new Date(event.starts_at).getDate()}
        </span>
        <span className="mt-1 block text-caption text-grey-500">
          {formatDate(event.starts_at, locale, {
            year: "numeric",
            month: "short",
          })}
        </span>
      </p>
      <div>
        <h3 className="text-h4 font-semibold leading-snug text-ink transition-colors duration-200 group-hover:text-navy-800">
          {loc(event, "title", locale)}
        </h3>
        {location && (
          <p className="mt-2 text-small text-grey-500">{location}</p>
        )}
      </div>
      <span className="hidden text-small font-medium text-navy-800 md:block">
        →
      </span>
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

      {/* Upcoming — date + typography + divider rows */}
      {upcoming.length > 0 && (
        <section className="bg-white py-16 md:py-24">
          <Container>
            <h2 className="text-h3 font-semibold tracking-[-0.01em] text-ink">
              {t("upcoming")}
            </h2>
            <div className="mt-10">
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
              ? "border-t border-grey-300 bg-grey-50 py-16 md:py-24"
              : "bg-white py-16 md:py-24"
          }
        >
          <Container>
            <h2 className="text-h3 font-semibold tracking-[-0.01em] text-ink">
              {t("past")}
            </h2>
            <div className="mt-10">
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
