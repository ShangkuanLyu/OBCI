import { setRequestLocale, getTranslations } from "next-intl/server";
import { Container } from "@/components/ui/Container";
import { PageHero } from "@/components/ui/PageHero";
import { getSiteSettings } from "@/services/settings";
import { legalDocumentVersion } from "@/lib/review";
import { pageMetadata } from "@/lib/seo";
import type { Locale } from "@/i18n/routing";
import type { Metadata } from "next";

export const revalidate = 300;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const [t, settings] = await Promise.all([
    getTranslations({ locale, namespace: "legal" }),
    getSiteSettings().catch(() => ({})),
  ]);
  const approved = legalDocumentVersion(settings, "accessibility") !== null;
  return {
    ...pageMetadata({
      locale,
      path: "/accessibility",
      title: t("accessibilityTitle"),
      description:
        locale === "zh"
          ? "大洋洲工商业委员会（OBCI）网站的无障碍访问承诺与措施。"
          : "The Oceania Business Council's commitment to an accessible website.",
    }),
    // An unpublished placeholder must never be indexed.
    ...(approved ? {} : { robots: { index: false, follow: false } }),
  };
}

type LegalSection = { heading: string; body: string[] };

// No audit has been carried out: every section describes practice or a
// target, never a conformance result. `scope` is legal.accessibilityScope.
const sectionsZh = (scope: string): LegalSection[] => [
  {
    heading: "1. 我们的承诺",
    body: [
      "大洋洲工商协会（Oceania Business Association Incorporated）致力于让尽可能多的用户无障碍地使用本网站，无论其能力或所用技术如何。本网站以《网页内容无障碍指南》（WCAG）2.1 AA 级为设计与开发目标。",
    ],
  },
  {
    heading: "2. 声明范围",
    body: [scope],
  },
  {
    heading: "3. 键盘操作",
    body: [
      "网站的导航、链接与表单均可通过键盘完成操作。交互元素在获得焦点时提供清晰可见的焦点状态。",
    ],
  },
  {
    heading: "4. 色彩与对比度",
    body: [
      "网站配色以 AA 级对比度为目标设计：正文与界面文字相对其背景，均以 AA 级对比度为目标。信息的传达不单独依赖颜色。",
    ],
  },
  {
    heading: "5. 文字与结构",
    body: [
      "页面使用语义化的标题层级与地标区域，便于屏幕阅读器用户浏览；图片配有替代文字；文字放大至 200% 而不丢失内容或功能是本网站的设计目标。",
    ],
  },
  {
    heading: "6. 动效",
    body: [
      "网站动效克制，并尊重操作系统的“减少动态效果”偏好设置：启用该设置的用户将看到静态内容。",
    ],
  },
  {
    heading: "7. 已知局限",
    body: [
      "部分由第三方提供或历史归档的内容可能尚未完全达到上述目标。我们正在逐步排查并改进。",
    ],
  },
  {
    heading: "8. 反馈",
    body: [
      "如您在使用本网站时遇到无障碍方面的障碍，或有改进建议，欢迎通过网站所列联系方式与本会秘书处联系。您的反馈将帮助我们持续改进。",
    ],
  },
];

const sectionsEn = (scope: string): LegalSection[] => [
  {
    heading: "1. Our commitment",
    body: [
      "Oceania Business Association Incorporated is committed to making this website accessible to the widest possible audience, regardless of ability or technology. The site is designed and built with the Web Content Accessibility Guidelines (WCAG) 2.1 Level AA as its target.",
    ],
  },
  {
    heading: "2. Scope of this statement",
    body: [scope],
  },
  {
    heading: "3. Keyboard navigation",
    body: [
      "Navigation, links and forms across the site can be operated with a keyboard alone. Interactive elements show a clearly visible focus state.",
    ],
  },
  {
    heading: "4. Colour and contrast",
    body: [
      "The site's colour palette is designed with AA-level contrast as its target for body and interface text against their backgrounds. Colour is not used as the sole means of conveying information.",
    ],
  },
  {
    heading: "5. Text and structure",
    body: [
      "Pages use semantic heading levels and landmark regions to aid screen-reader navigation; images carry alternative text; and the site is designed with the aim that text can be enlarged to 200% without loss of content or function.",
    ],
  },
  {
    heading: "6. Motion",
    body: [
      "Animation on the site is restrained and respects the operating system's reduced-motion preference: users with that setting enabled see static content.",
    ],
  },
  {
    heading: "7. Known limitations",
    body: [
      "Some third-party or archived content may not yet fully meet the targets above. We are progressively reviewing and improving it.",
    ],
  },
  {
    heading: "8. Feedback",
    body: [
      "If you encounter an accessibility barrier on this website, or have suggestions for improvement, please contact the secretariat using the contact details listed on this website. Your feedback helps us improve.",
    ],
  },
];

export default async function AccessibilityPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: rawLocale } = await params;
  setRequestLocale(rawLocale);
  const locale = rawLocale as Locale;
  const [t, settings] = await Promise.all([
    getTranslations("legal"),
    getSiteSettings().catch(() => ({})),
  ]);

  // The text is published only once the chamber records a version
  // (site_settings.legal.accessibility_version). Until then the draft
  // body is visible solely in the review deployment; production shows
  // the unpublished notice and nothing else.
  const version = legalDocumentVersion(settings, "accessibility");
  const showBody = version !== null;
  const scope = t("accessibilityScope");
  const sections = locale === "zh" ? sectionsZh(scope) : sectionsEn(scope);

  return (
    <>
      <PageHero label={t("label")} title={t("accessibilityTitle")} />

      <section className="bg-white py-16 md:py-24">
        <Container>
          <div className="max-w-[42rem]">
            {version ? (
              <p className="text-small text-grey-600">
                <span className="font-semibold text-sea-800">
                  {t("versionLabel")}
                </span>{" "}
                {version}
              </p>
            ) : (
              <p className="text-body leading-relaxed text-grey-600">
                {t("unpublishedNotice")}
              </p>
            )}
            {showBody &&
              sections.map((section) => (
                <div key={section.heading}>
                  <h2 className="mt-10 text-h4 font-semibold text-ink">
                    {section.heading}
                  </h2>
                  {section.body.map((paragraph, i) => (
                    <p
                      key={i}
                      className="mt-4 text-body leading-relaxed text-grey-600"
                    >
                      {paragraph}
                    </p>
                  ))}
                </div>
              ))}
          </div>
        </Container>
      </section>
    </>
  );
}
