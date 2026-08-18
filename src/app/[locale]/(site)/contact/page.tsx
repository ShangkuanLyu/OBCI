import { setRequestLocale, getTranslations } from "next-intl/server";
import { Container } from "@/components/ui/Container";
import { PageHero } from "@/components/ui/PageHero";
import { ContactForm } from "@/components/forms/ContactForm";
import { getSiteSettings, settingString } from "@/services/settings";
import type { Locale } from "@/i18n/routing";
import type { Metadata } from "next";

export const revalidate = 300;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "contact" });
  return { title: t("title"), description: t("standfirst") };
}

export default async function ContactPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: rawLocale } = await params;
  setRequestLocale(rawLocale);
  const locale = rawLocale as Locale;
  const t = await getTranslations("contact");

  const settings = await getSiteSettings().catch(() => ({}));
  const address = settingString(
    settings,
    "contact",
    locale === "zh" ? "address_zh" : "address_en",
    "Melbourne VIC, Australia",
  );
  const phone = settingString(settings, "contact", "phone", "");
  const email = settingString(settings, "contact", "email", "");

  const rows: { label: string; value: React.ReactNode }[] = [
    { label: t("address"), value: address },
    ...(phone ? [{ label: t("phone"), value: phone }] : []),
    ...(email
      ? [
          {
            label: t("email"),
            value: (
              <a
                href={`mailto:${email}`}
                className="text-navy-800 transition-colors duration-200 hover:underline"
              >
                {email}
              </a>
            ),
          },
        ]
      : []),
  ];

  return (
    <>
      <PageHero
        label="Contact"
        title={t("title")}
        standfirst={t("standfirst")}
      />

      <section className="bg-white py-16 md:py-24">
        <Container>
          <div className="grid gap-y-16 md:grid-cols-12 md:gap-x-10">
            {/* Contact details */}
            <div className="md:col-span-5">
              <h2 className="text-h4 font-semibold text-ink">
                {t("infoTitle")}
              </h2>
              <dl className="mt-8 border-t border-grey-300">
                {rows.map((row) => (
                  <div
                    key={row.label}
                    className="border-b border-grey-300 py-5"
                  >
                    <dt className="text-caption font-medium uppercase tracking-[0.08em] text-rose-600">
                      {row.label}
                    </dt>
                    <dd className="mt-2 max-w-[42rem] text-body leading-relaxed text-ink">
                      {row.value}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>

            {/* Enquiry form */}
            <div className="md:col-span-7">
              <h2 className="text-h4 font-semibold text-ink">
                {t("formTitle")}
              </h2>
              <div className="mt-8">
                <ContactForm />
              </div>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
