import { getTranslations } from "next-intl/server";
import { Container } from "@/components/ui/Container";
import { ButtonLink } from "@/components/ui/Button";

/** A translated string, or the bilingual fallback pair. */
type Copy = string | { zh: string; en: string };

/**
 * Renders a Copy value; the fallback pair is split into two language-tagged
 * halves so assistive technology switches voice per language.
 */
function Bilingual({
  copy,
  separator = " · ",
}: {
  copy: Copy;
  separator?: string;
}) {
  if (typeof copy === "string") return <>{copy}</>;
  return (
    <>
      <span lang="zh">{copy.zh}</span>
      <span aria-hidden>{separator}</span>
      <span lang="en">{copy.en}</span>
    </>
  );
}

/**
 * Not-found boundary for the site segment. Translations are resolved from the
 * current request locale; if the next-intl request context is unavailable in
 * this boundary, we fall back to calm bilingual copy.
 */
export default async function NotFound() {
  let title: Copy = { zh: "页面不存在", en: "Page not found" };
  let text: Copy = {
    zh: "您访问的页面不存在或已移除。",
    en: "The page you are looking for does not exist or has been removed.",
  };
  let cta: Copy = { zh: "返回首页", en: "Back to home" };

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
        <p className="text-caption font-medium uppercase tracking-[0.08em] text-sea-800">
          404
        </p>
        <h1 className="mt-4 text-[1.75rem] font-semibold leading-[1.15] tracking-[-0.015em] text-ink md:text-h2">
          <Bilingual copy={title} />
        </h1>
        <p className="mx-auto mt-6 max-w-[36rem] text-body text-grey-600">
          <Bilingual copy={text} separator=" " />
        </p>
        <div className="mt-10 flex justify-center">
          <ButtonLink href="/" variant="secondary">
            <Bilingual copy={cta} />
          </ButtonLink>
        </div>
      </Container>
    </section>
  );
}
