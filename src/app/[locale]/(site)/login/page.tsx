import { getTranslations, setRequestLocale } from "next-intl/server";
import { Container } from "@/components/ui/Container";
import { LoginForm } from "@/components/forms/LoginForm";

export default async function LoginPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("login");

  return (
    <section className="bg-grey-50 py-24 md:py-32">
      <Container>
        <div className="card-surface mx-auto max-w-sm px-8 py-10">
          <h1 className="text-h4 font-semibold text-ink">{t("title")}</h1>
          <p className="mt-2 text-small text-grey-600">{t("text")}</p>
          <div className="mt-8">
            <LoginForm locale={locale} />
          </div>
        </div>
      </Container>
    </section>
  );
}
