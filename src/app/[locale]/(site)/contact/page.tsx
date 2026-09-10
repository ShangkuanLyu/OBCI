import { setRequestLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Container } from "@/components/ui/Container";
import { PageHero } from "@/components/ui/PageHero";
import { ContactForm } from "@/components/forms/ContactForm";
import { getSiteSettings, settingString } from "@/services/settings";
import { contactFieldState, type ContactField } from "@/lib/review";
import { pageMetadata } from "@/lib/seo";
import type { Locale } from "@/i18n/routing";
import type { Metadata } from "next";
import type { Json } from "@/types/database.types";

export const revalidate = 300;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "contact" });
  return pageMetadata({
    locale,
    path: "/contact",
    title: t("title"),
    description: t("standfirst"),
  });
}

type WayItem = { href: string; label: string };

export default async function ContactPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: rawLocale } = await params;
  setRequestLocale(rawLocale);
  const locale = rawLocale as Locale;
  const t = await getTranslations("contact");
  const zh = locale === "zh";

  const settings = await getSiteSettings().catch(() => ({}));
  const s = (key: string, field: string, fallback = "") =>
    settingString(settings, key, field, fallback);

  // Contact details are published only where the CMS lists the field in
  // site_settings.contact.confirmed_fields; anything else is not rendered.
  const c = (field: ContactField, key: string) =>
    contactFieldState(settings, field) === "hidden" ? "" : s("contact", key);

  const address = c("address", zh ? "address_zh" : "address_en");
  const addressLabel = s("contact", zh ? "address_label_zh" : "address_label_en", t("address"));
  const address2 = c("address2", zh ? "address2_zh" : "address2_en");
  const address2Label = s("contact", zh ? "address2_label_zh" : "address2_label_en");
  const phone = c("phone", "phone");
  const fax = c("fax", "fax");
  const email = c("email", "email");
  const wechat = c("wechat", zh ? "wechat_zh" : "wechat_en");
  const membershipContactName = c("membership_contact", "membership_contact_name");
  const membershipContactPhone = c("membership_contact", "membership_contact_phone");

  // "Ways to work with us" — stored as a top-level array under the
  // partner_routes settings key.
  const routesRaw = (settings as Record<string, Json>)["partner_routes"];
  const ways: WayItem[] = Array.isArray(routesRaw)
    ? routesRaw
        .filter(
          (item): item is Record<string, Json> =>
            typeof item === "object" && item !== null && !Array.isArray(item),
        )
        .map((item) => ({
          href: typeof item.href === "string" ? item.href : "/contact",
          label: String((zh ? item.name_zh : item.name_en) ?? ""),
        }))
        .filter((item) => item.label)
    : [];

  const rows: { label: string; value: React.ReactNode }[] = [
    ...(address ? [{ label: addressLabel, value: address }] : []),
    ...(address2 && address2Label
      ? [{ label: address2Label, value: address2 }]
      : []),
    ...(phone ? [{ label: t("phone"), value: phone }] : []),
    ...(fax ? [{ label: t("fax"), value: fax }] : []),
    ...(email
      ? [
          {
            label: t("email"),
            value: (
              <a
                href={`mailto:${email}`}
                className="text-sea-800 transition-colors duration-200 hover:text-sea-600 hover:underline"
              >
                {email}
              </a>
            ),
          },
        ]
      : []),
    ...(membershipContactName
      ? [
          {
            label: t("membershipContact"),
            value: `${membershipContactName}${membershipContactPhone ? ` · ${membershipContactPhone}` : ""}`,
          },
        ]
      : []),
    ...(wechat ? [{ label: t("wechat"), value: wechat }] : []),
  ];

  return (
    <>
      <PageHero
        title={t("title")}
        standfirst={t("standfirst")}
      />

      <section className="bg-white py-16 md:py-24">
        <Container>
          <div className="grid gap-y-16 md:grid-cols-12 md:gap-x-10">
            {/* Contact details + ways to work with us */}
            <div className="md:col-span-5">
              {rows.length > 0 && (
                <div className="card-surface p-7 md:p-8">
                  <h2 className="text-h4 font-semibold text-ink">
                    {t("infoTitle")}
                  </h2>
                  {rows.length > 0 && (
                    <dl className="mt-7 space-y-6">
                      {rows.map((row) => (
                        <div key={row.label}>
                          <dt className="text-caption font-medium uppercase tracking-[0.06em] text-sea-800">
                            {row.label}
                          </dt>
                          <dd className="mt-2 text-body leading-relaxed text-ink">
                            {row.value}
                          </dd>
                        </div>
                      ))}
                    </dl>
                  )}
                </div>
              )}

              {ways.length > 0 && (
                <div className={rows.length > 0 ? "mt-8" : undefined}>
                  <h2 className="text-caption font-semibold uppercase tracking-[0.06em] text-grey-500">
                    {t("waysTitle")}
                  </h2>
                  <ul className="mt-4 divide-y divide-grey-100 border-y border-grey-100">
                    {ways.map((way) => (
                      <li key={way.label}>
                        <Link
                          href={way.href}
                          className="flex items-center justify-between py-3.5 text-body text-ink transition-colors hover:text-sea-800"
                        >
                          {way.label}
                          <span aria-hidden className="text-grey-300">
                            →
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Enquiry form */}
            <div className="md:col-span-7">
              <h2 className="text-h4 font-semibold text-ink">
                {t("formTitle")}
              </h2>
              <div className="mt-8">
                {/* Rendered inline (no Suspense): the form reads ?topic=
                    after mount, so the static export carries the full
                    markup. */}
                <ContactForm />
              </div>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
