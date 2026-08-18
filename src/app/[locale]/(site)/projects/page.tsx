import { setRequestLocale, getTranslations } from "next-intl/server";
import { Container } from "@/components/ui/Container";
import { PageHero } from "@/components/ui/PageHero";
import { getPublishedProjects } from "@/services/projects";
import { loc, formatDate } from "@/lib/utils/l10n";
import type { Locale } from "@/i18n/routing";
import type { Metadata } from "next";

export const revalidate = 300;

const KNOWN_KINDS = ["investment", "requirement", "cooperation"] as const;

function isKnownKind(
  kind: string,
): kind is (typeof KNOWN_KINDS)[number] {
  return (KNOWN_KINDS as readonly string[]).includes(kind);
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "projects" });
  return { title: t("title"), description: t("standfirst") };
}

export default async function ProjectsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: rawLocale } = await params;
  setRequestLocale(rawLocale);
  const locale = rawLocale as Locale;
  const t = await getTranslations("projects");

  const projects = await getPublishedProjects().catch(() => []);

  return (
    <>
      <PageHero
        label="Projects"
        title={t("title")}
        standfirst={t("standfirst")}
      />

      <section className="bg-white py-16 md:py-24">
        <Container>
          {projects.length === 0 && (
            <p className="py-20 text-body text-grey-500">{t("empty")}</p>
          )}

          {projects.length > 0 && (
            <div>
              {projects.map((project) => (
                <article
                  key={project.id}
                  className="border-t border-grey-300 py-8 last:border-b md:py-10"
                >
                  <p className="flex flex-wrap items-baseline gap-x-3 gap-y-1 text-caption">
                    <span className="font-medium uppercase tracking-[0.08em] text-rose-600">
                      {isKnownKind(project.kind)
                        ? t(`kinds.${project.kind}`)
                        : project.kind}
                    </span>
                    <span className="text-grey-500">
                      {formatDate(project.published_at, locale)}
                    </span>
                  </p>
                  <h2 className="mt-4 max-w-[32em] text-h4 font-semibold leading-snug text-ink">
                    {loc(project, "title", locale)}
                  </h2>
                  {loc(project, "summary", locale) && (
                    <p className="mt-3 max-w-[42rem] text-body leading-relaxed text-grey-600">
                      {loc(project, "summary", locale)}
                    </p>
                  )}
                </article>
              ))}
            </div>
          )}
        </Container>
      </section>
    </>
  );
}
