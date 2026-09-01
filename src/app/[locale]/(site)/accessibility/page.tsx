import { setRequestLocale, getTranslations } from "next-intl/server";
import { Container } from "@/components/ui/Container";
import { PageHero } from "@/components/ui/PageHero";
import { pageMetadata } from "@/lib/seo";
import type { Locale } from "@/i18n/routing";
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "legal" });
  return pageMetadata({
    locale,
    path: "/accessibility",
    title: t("accessibilityTitle"),
    description:
      locale === "zh"
        ? "大洋洲工商协会网站的无障碍访问承诺与措施。"
        : "The Oceania Business Association's commitment to an accessible website.",
  });
}

type LegalSection = { heading: string; body: string[] };

const sectionsZh: LegalSection[] = [
  {
    heading: "1. 我们的承诺",
    body: [
      "大洋洲工商协会（Oceania Business Association Incorporated）致力于让尽可能多的用户无障碍地使用本网站，无论其能力或所用技术如何。我们以《网页内容无障碍指南》（WCAG）2.1 AA 级为目标持续改进。",
    ],
  },
  {
    heading: "2. 符合状态",
    body: [
      "本网站按照 WCAG 2.1 AA 级的要求设计与开发。我们定期审查网站内容与功能，并在发现问题时及时修复。",
    ],
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
      "网站配色经过对比度校验，正文与界面文字与其背景之间保持符合 AA 级要求的对比度。信息的传达不单独依赖颜色。",
    ],
  },
  {
    heading: "5. 文字与结构",
    body: [
      "页面使用语义化的标题层级与地标区域，便于屏幕阅读器用户浏览；图片配有替代文字；文字可放大至 200% 而不丢失内容或功能。",
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
      "部分由第三方提供或历史归档的内容可能尚未完全达到上述标准。我们正在逐步排查并改进。",
    ],
  },
  {
    heading: "8. 反馈",
    body: [
      "如您在使用本网站时遇到无障碍方面的障碍，或有改进建议，欢迎通过网站所列联系方式与本会秘书处联系。您的反馈将帮助我们持续改进。",
    ],
  },
];

const sectionsEn: LegalSection[] = [
  {
    heading: "1. Our commitment",
    body: [
      "Oceania Business Association Incorporated is committed to making this website accessible to the widest possible audience, regardless of ability or technology. We work towards conformance with the Web Content Accessibility Guidelines (WCAG) 2.1 at Level AA.",
    ],
  },
  {
    heading: "2. Conformance status",
    body: [
      "This website is designed and built with WCAG 2.1 Level AA as its target. We review content and functionality regularly and remediate issues as they are found.",
    ],
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
      "The site's colour palette has been checked for contrast, and body and interface text maintain AA-level contrast against their backgrounds. Colour is never the sole means of conveying information.",
    ],
  },
  {
    heading: "5. Text and structure",
    body: [
      "Pages use semantic heading levels and landmark regions to aid screen-reader navigation; images carry alternative text; and text can be enlarged to 200% without loss of content or function.",
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
      "Some third-party or archived content may not yet fully meet the standards above. We are progressively reviewing and improving it.",
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
  const t = await getTranslations("legal");

  const sections = locale === "zh" ? sectionsZh : sectionsEn;

  return (
    <>
      <PageHero label={t("label")} title={t("accessibilityTitle")} />

      <section className="bg-white py-16 md:py-24">
        <Container>
          <div className="max-w-[42rem]">
            <p className="text-caption text-grey-500">
              {t("lastUpdated")} · 2026-08
            </p>
            {sections.map((section) => (
              <div key={section.heading}>
                <h3 className="mt-10 text-h4 font-semibold text-ink">
                  {section.heading}
                </h3>
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
