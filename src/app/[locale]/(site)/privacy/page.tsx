import { setRequestLocale, getTranslations } from "next-intl/server";
import { Container } from "@/components/ui/Container";
import { PageHero } from "@/components/ui/PageHero";
import { getSiteSettings } from "@/services/settings";
import { legalDocumentVersion } from "@/lib/review";
import { isPreviewDeployment } from "@/lib/preview";
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
  const approved = legalDocumentVersion(settings, "privacy") !== null;
  return {
    ...pageMetadata({
      locale,
      path: "/privacy",
      title: t("privacyTitle"),
      description:
        locale === "zh"
          ? "大洋洲工商协会如何收集、使用与保护您的个人信息。"
          : "How the Oceania Business Association collects, uses and protects your personal information.",
    }),
    // An unpublished placeholder must never be indexed.
    ...(approved ? {} : { robots: { index: false, follow: false } }),
  };
}

type LegalSection = { heading: string; body: string[] };

const sectionsZh: LegalSection[] = [
  {
    heading: "1. 概述",
    body: [
      "大洋洲工商协会（Oceania Business Association Incorporated，以下简称“本会”）尊重并保护您的个人信息。本政策说明我们通过本网站收集哪些信息、如何使用与存储，以及您享有的权利。",
    ],
  },
  {
    heading: "2. 我们收集的信息",
    body: [
      "我们仅收集为提供服务所必需的信息，包括：您通过联系表单提交的姓名与联系方式；会员申请中提供的个人及企业信息；订阅通讯时提供的电子邮箱地址。",
    ],
  },
  {
    heading: "3. 信息的使用",
    body: [
      "所收集的信息仅用于处理您的咨询与会员申请、发送您订阅的通讯，以及开展与本会宗旨相关的必要联络。我们不会将您的信息用于与上述目的无关的用途。",
    ],
  },
  {
    heading: "4. 存储与安全",
    body: [
      "网站数据托管于 Supabase 平台，采用访问控制与加密传输等业界通行的安全措施。我们仅在实现收集目的所需的期间内保留您的信息。",
    ],
  },
  {
    heading: "5. 不出售个人信息",
    body: [
      "本会不会出售、出租或以其他方式交易您的个人信息。除法律要求或为履行上述目的所必需的服务提供方（如邮件发送服务）外，我们不会向第三方披露您的信息。",
    ],
  },
  {
    heading: "6. Cookie",
    body: [
      "本网站的公开页面不会为匿名访客设置任何 Cookie，也不使用第三方广告或跨站跟踪 Cookie。仅工作人员登录管理后台时，使用维持登录状态所必需的会话 Cookie。",
    ],
  },
  {
    heading: "7. 查阅与更正",
    body: [
      "您有权查阅、更正或要求删除我们持有的您的个人信息。如需行使上述权利，或取消订阅通讯，请通过网站所列联系方式与本会秘书处联系，我们将在合理时间内回复。",
    ],
  },
  {
    heading: "8. 政策的更新",
    body: [
      "我们可能不时更新本政策，更新后的版本将在本页发布并注明更新日期。重大变更时我们会以适当方式提示。",
    ],
  },
];

const sectionsEn: LegalSection[] = [
  {
    heading: "1. Overview",
    body: [
      "Oceania Business Association Incorporated (“the Association”) respects and protects your personal information. This policy explains what we collect through this website, how it is used and stored, and the rights you have.",
    ],
  },
  {
    heading: "2. Information we collect",
    body: [
      "We collect only the information needed to provide our services: your name and contact details submitted through contact forms; personal and business details provided in membership applications; and your email address when you subscribe to our newsletter.",
    ],
  },
  {
    heading: "3. How we use information",
    body: [
      "The information collected is used solely to respond to your enquiries, process membership applications, send the newsletter you subscribed to, and carry out necessary communication related to the Association's purposes. We do not use your information for unrelated purposes.",
    ],
  },
  {
    heading: "4. Storage and security",
    body: [
      "Website data is hosted on the Supabase platform and protected by industry-standard measures including access controls and encrypted transmission. We retain your information only for as long as needed to fulfil the purposes for which it was collected.",
    ],
  },
  {
    heading: "5. No sale of personal information",
    body: [
      "The Association does not sell, rent or otherwise trade your personal information. We do not disclose it to third parties except as required by law or to service providers (such as email delivery services) needed to fulfil the purposes above.",
    ],
  },
  {
    heading: "6. Cookies",
    body: [
      "The public website sets no cookies for anonymous visitors, and uses no third-party advertising or cross-site tracking cookies. Session cookies are used only when staff sign in to the administration console, to keep that session signed in.",
    ],
  },
  {
    heading: "7. Access and correction",
    body: [
      "You may request access to, correction of, or deletion of the personal information we hold about you. To exercise these rights, or to unsubscribe from the newsletter, please contact the secretariat using the contact details listed on this website; we will respond within a reasonable time.",
    ],
  },
  {
    heading: "8. Changes to this policy",
    body: [
      "We may update this policy from time to time. Updated versions will be published on this page with a revised date, and material changes will be flagged appropriately.",
    ],
  },
];

export default async function PrivacyPage({
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
  // (site_settings.legal.privacy_version). Until then the draft body is
  // visible solely in the review deployment; production shows the
  // unpublished notice and nothing else.
  const version = legalDocumentVersion(settings, "privacy");
  const showBody = version !== null || isPreviewDeployment();
  const sections = locale === "zh" ? sectionsZh : sectionsEn;

  return (
    <>
      <PageHero label={t("label")} title={t("privacyTitle")} />

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
            ) : showBody ? (
              <div
                role="note"
                className="rounded-md border border-dashed border-grey-300 bg-grey-50 px-5 py-4"
              >
                <span className="inline-block rounded-full border border-sea-200 bg-white px-3 py-1 text-caption font-semibold tracking-[0.04em] text-sea-800">
                  {t("draftBadge")}
                </span>
                <p className="mt-3 text-small leading-relaxed text-grey-600">
                  {t("draftNotice")}
                </p>
              </div>
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
