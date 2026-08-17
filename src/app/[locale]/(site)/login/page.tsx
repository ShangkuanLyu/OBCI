import { setRequestLocale } from "next-intl/server";
import { Container } from "@/components/ui/Container";
import { LoginForm } from "@/components/forms/LoginForm";

export default async function LoginPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <section className="bg-grey-50 py-24 md:py-32">
      <Container>
        <div className="mx-auto max-w-sm bg-white px-8 py-10">
          <h1 className="text-h4 font-semibold text-ink">
            {locale === "zh" ? "会员登录" : "Sign in"}
          </h1>
          <p className="mt-2 text-small text-grey-600">
            {locale === "zh"
              ? "登录以访问会员与管理功能。"
              : "Sign in to access member and admin features."}
          </p>
          <div className="mt-8">
            <LoginForm locale={locale} />
          </div>
        </div>
      </Container>
    </section>
  );
}
