import { setRequestLocale, getTranslations } from "next-intl/server";
import { Container } from "@/components/ui/Container";
import { PageHero } from "@/components/ui/PageHero";
import { ApplyForm } from "@/components/forms/ApplyForm";
import { getMembershipTypes } from "@/services/membership";
import { loc } from "@/lib/utils/l10n";
import type { Locale } from "@/i18n/routing";
import type { Metadata } from "next";

export const revalidate = 300;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "apply" });
  return { title: t("title"), description: t("standfirst") };
}

export default async function MembershipApplyPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: rawLocale } = await params;
  setRequestLocale(rawLocale);
  const locale = rawLocale as Locale;
  const t = await getTranslations("apply");

  const types = (await getMembershipTypes().catch(() => [])).map((type) => ({
    code: type.code,
    label: loc(type, "name", locale),
  }));

  return (
    <>
      <PageHero
        label="Membership"
        title={t("title")}
        standfirst={t("standfirst")}
      />

      <section className="bg-white py-16 md:py-24">
        <Container>
          <div className="card-surface max-w-[46rem] p-8 md:p-10">
            <ApplyForm types={types} />
          </div>
        </Container>
      </section>
    </>
  );
}
