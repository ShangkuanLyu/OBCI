import { getTranslations } from "next-intl/server";
import { Container } from "@/components/ui/Container";
import { ButtonLink } from "@/components/ui/Button";

/**
 * Not-found boundary for the site segment. Translations are resolved from the
 * current request locale; if the next-intl request context is unavailable in
 * this boundary, we fall back to calm bilingual copy.
 */
export default async function NotFound() {
  let title = "页面不存在 · Page not found";
  let text =
    "您访问的页面不存在或已移除。 The page you are looking for does not exist or has been removed.";
  let cta = "返回首页 · Back to home";

  try {
    const t = await getTranslations("common");
    title = t("notFound");
    text = t("notFoundText");
    cta = t("backHome");
  } catch {
    // Keep the bilingual fallback copy above.
  }

  return (
    <section className="bg-white py-32 md:py-40">
      <Container className="text-center">
        <p className="text-caption font-medium uppercase tracking-[0.08em] text-gold-600">
          404
        </p>
        <h1 className="mt-4 text-[1.75rem] font-semibold leading-[1.15] tracking-[-0.015em] text-ink md:text-h2">
          {title}
        </h1>
        <p className="mx-auto mt-6 max-w-[36rem] text-body text-grey-600">
          {text}
        </p>
        <div className="mt-10 flex justify-center">
          <ButtonLink href="/" variant="secondary">
            {cta}
          </ButtonLink>
        </div>
      </Container>
    </section>
  );
}
