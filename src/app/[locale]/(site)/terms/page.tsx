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
    path: "/terms",
    title: t("termsTitle"),
    description:
      locale === "zh"
        ? "大洋洲工商协会网站的使用条款与条件。"
        : "Terms and conditions governing the use of the Oceania Business Association website.",
  });
}

type LegalSection = { heading: string; body: string[] };

const sectionsZh: LegalSection[] = [
  {
    heading: "1. 条款的接受",
    body: [
      "本网站由大洋洲工商协会（Oceania Business Association Incorporated，以下简称“本会”）运营。访问或使用本网站，即表示您同意受本条款与条件的约束。如您不同意本条款，请勿使用本网站。",
    ],
  },
  {
    heading: "2. 网站使用",
    body: [
      "本网站内容仅供一般参考之用。您承诺仅出于合法目的使用本网站，不得从事任何可能损害网站运行、干扰其他用户或违反适用法律的行为。",
    ],
  },
  {
    heading: "3. 知识产权",
    body: [
      "除另有注明外，本网站的文字、标识、版式及其他内容的知识产权归本会或相应权利人所有。未经事先书面许可，不得复制、传播或用于商业用途；合理范围内的个人查阅与引用（注明来源）除外。",
    ],
  },
  {
    heading: "4. 会员申请",
    body: [
      "通过本网站提交会员申请并不构成会员资格的自动取得。所有申请须经本会按其章程及内部程序审核，本会保留接受或婉拒任何申请的权利。",
    ],
  },
  {
    heading: "5. 第三方链接",
    body: [
      "本网站可能包含指向第三方网站的链接。此类链接仅为方便用户而提供，不代表本会对其内容的认可。本会对第三方网站的内容及做法不承担责任。",
    ],
  },
  {
    heading: "6. 免责声明",
    body: [
      "本会尽力保证网站信息的准确与及时，但不对其完整性、准确性或适用性作出任何明示或默示的保证。网站内容不构成法律、财务或投资建议。",
    ],
  },
  {
    heading: "7. 责任限制",
    body: [
      "在适用法律允许的最大范围内，本会不对因使用或无法使用本网站而产生的任何直接或间接损失承担责任。",
    ],
  },
  {
    heading: "8. 条款的变更",
    body: [
      "本会可不时修订本条款并在本页发布更新版本。继续使用本网站即视为接受修订后的条款。",
    ],
  },
  {
    heading: "9. 适用法律",
    body: [
      "本条款受澳大利亚维多利亚州法律管辖，并按其解释。因本条款引起的争议受维多利亚州法院的非专属管辖。",
    ],
  },
];

const sectionsEn: LegalSection[] = [
  {
    heading: "1. Acceptance of these terms",
    body: [
      "This website is operated by Oceania Business Association Incorporated (“the Association”). By accessing or using this website you agree to be bound by these terms and conditions. If you do not agree, please do not use the site.",
    ],
  },
  {
    heading: "2. Use of the website",
    body: [
      "The content of this website is provided for general information only. You agree to use the site for lawful purposes and not to engage in any conduct that could damage its operation, interfere with other users, or breach applicable law.",
    ],
  },
  {
    heading: "3. Intellectual property",
    body: [
      "Unless otherwise noted, the text, marks, layout and other content of this website are the intellectual property of the Association or their respective owners. They may not be reproduced, distributed or used commercially without prior written permission, other than reasonable personal viewing and attributed quotation.",
    ],
  },
  {
    heading: "4. Membership applications",
    body: [
      "Submitting a membership application through this website does not of itself confer membership. All applications are assessed under the Association's rules and internal procedures, and the Association reserves the right to accept or decline any application.",
    ],
  },
  {
    heading: "5. Third-party links",
    body: [
      "This website may contain links to third-party websites. Such links are provided for convenience only and do not imply endorsement. The Association is not responsible for the content or practices of third-party sites.",
    ],
  },
  {
    heading: "6. Disclaimer",
    body: [
      "The Association takes care to keep the information on this website accurate and current, but gives no express or implied warranty as to its completeness, accuracy or fitness for purpose. Nothing on this site constitutes legal, financial or investment advice.",
    ],
  },
  {
    heading: "7. Limitation of liability",
    body: [
      "To the maximum extent permitted by law, the Association is not liable for any direct or indirect loss arising from the use of, or inability to use, this website.",
    ],
  },
  {
    heading: "8. Changes to these terms",
    body: [
      "The Association may revise these terms from time to time by publishing an updated version on this page. Continued use of the website constitutes acceptance of the revised terms.",
    ],
  },
  {
    heading: "9. Governing law",
    body: [
      "These terms are governed by and construed in accordance with the laws of Victoria, Australia. Disputes arising from them are subject to the non-exclusive jurisdiction of the courts of Victoria.",
    ],
  },
];

export default async function TermsPage({
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
      <PageHero label={t("label")} title={t("termsTitle")} />

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
