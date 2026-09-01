"use client";

import { useActionState } from "react";
import {
  Field,
  TextInput,
  TextArea,
  AdminButton,
} from "@/components/admin/Field";
import {
  saveSettings,
  type SettingsActionState,
} from "@/app/[locale]/admin/settings/actions";

export type ContactSettings = {
  address_zh: string;
  address_en: string;
  phone: string;
  email: string;
  email_confirmed: boolean;
};

export type IdentitySettings = {
  name_zh: string;
  name_en: string;
  acronym: string;
  tagline_zh: string;
  tagline_en: string;
};

export type MembershipSettings = {
  review_days: number;
  fees_published: boolean;
};

export type BilingualTextSettings = {
  text_zh: string;
  text_en: string;
};

export type MemberBenefitsSettings = {
  zh: string;
  en: string;
};

export type PillarSettings = {
  title_zh: string;
  title_en: string;
  text_zh: string;
  text_en: string;
};

export type BannerSettings = {
  key: string;
  title_zh: string;
  title_en: string;
  text_zh: string;
  text_en: string;
  cta_label_zh: string;
  cta_label_en: string;
  cta_href: string;
  image_path: string;
  is_active: boolean;
};

const initialState: SettingsActionState = { status: "idle" };

export function SettingsForm({
  locale,
  contact,
  identity,
  membership,
  vision,
  revenueNote,
  memberBenefits,
  pillars,
  banners,
}: {
  locale: string;
  contact: ContactSettings;
  identity: IdentitySettings;
  membership: MembershipSettings;
  vision: BilingualTextSettings;
  revenueNote: BilingualTextSettings;
  memberBenefits: MemberBenefitsSettings;
  pillars: PillarSettings[];
  banners: BannerSettings[];
}) {
  const zh = locale === "zh";
  const [state, formAction, pending] = useActionState(
    saveSettings,
    initialState,
  );

  return (
    <form action={formAction} className="space-y-8">
      <input type="hidden" name="locale" value={locale} />

      <section className="rounded-lg border border-grey-300 bg-white p-6">
        <h2 className="text-h4 font-semibold text-ink">
          {zh ? "联系方式" : "Contact"}
        </h2>
        <div className="mt-5 grid gap-5 md:grid-cols-2">
          <Field label={zh ? "地址 中文" : "Address 中文"} htmlFor="address_zh">
            <TextArea
              id="address_zh"
              name="address_zh"
              rows={2}
              required
              defaultValue={contact.address_zh}
            />
          </Field>
          <Field label={zh ? "地址 EN" : "Address EN"} htmlFor="address_en">
            <TextArea
              id="address_en"
              name="address_en"
              rows={2}
              required
              defaultValue={contact.address_en}
            />
          </Field>
          <Field label={zh ? "电话" : "Phone"} htmlFor="phone">
            <TextInput
              id="phone"
              name="phone"
              required
              defaultValue={contact.phone}
            />
          </Field>
          <Field label={zh ? "邮箱" : "Email"} htmlFor="email">
            <TextInput
              id="email"
              name="email"
              type="email"
              required
              defaultValue={contact.email}
            />
          </Field>
        </div>
        <label className="mt-5 flex items-center gap-2 text-small text-ink">
          <input
            type="checkbox"
            name="email_confirmed"
            defaultChecked={contact.email_confirmed}
            className="size-4 accent-sea-900"
          />
          {zh ? "邮箱已确认" : "Email confirmed"}
        </label>
      </section>

      <section className="rounded-lg border border-grey-300 bg-white p-6">
        <h2 className="text-h4 font-semibold text-ink">
          {zh ? "品牌信息" : "Identity"}
        </h2>
        <div className="mt-5 grid gap-5 md:grid-cols-2">
          <Field label={zh ? "名称 中文" : "Name 中文"} htmlFor="name_zh">
            <TextInput
              id="name_zh"
              name="name_zh"
              required
              defaultValue={identity.name_zh}
            />
          </Field>
          <Field label={zh ? "名称 EN" : "Name EN"} htmlFor="name_en">
            <TextInput
              id="name_en"
              name="name_en"
              required
              defaultValue={identity.name_en}
            />
          </Field>
          <Field
            label={zh ? "缩写" : "Acronym"}
            htmlFor="acronym"
            className="md:col-span-2"
          >
            <TextInput
              id="acronym"
              name="acronym"
              required
              defaultValue={identity.acronym}
              className="md:max-w-48"
            />
          </Field>
          <Field label={zh ? "标语 中文" : "Tagline 中文"} htmlFor="tagline_zh">
            <TextInput
              id="tagline_zh"
              name="tagline_zh"
              required
              defaultValue={identity.tagline_zh}
            />
          </Field>
          <Field label={zh ? "标语 EN" : "Tagline EN"} htmlFor="tagline_en">
            <TextInput
              id="tagline_en"
              name="tagline_en"
              required
              defaultValue={identity.tagline_en}
            />
          </Field>
        </div>
      </section>

      <section className="rounded-lg border border-grey-300 bg-white p-6">
        <h2 className="text-h4 font-semibold text-ink">
          {zh ? "会员设置" : "Membership"}
        </h2>
        <div className="mt-5 grid gap-5 md:grid-cols-2">
          <Field
            label={zh ? "审核天数" : "Review days"}
            htmlFor="review_days"
            hint={zh ? "申请审核所需的工作日天数" : "Working days needed to review an application"}
          >
            <TextInput
              id="review_days"
              name="review_days"
              type="number"
              min={0}
              max={365}
              step={1}
              required
              defaultValue={membership.review_days}
            />
          </Field>
        </div>
        <label className="mt-5 flex items-center gap-2 text-small text-ink">
          <input
            type="checkbox"
            name="fees_published"
            defaultChecked={membership.fees_published}
            className="size-4 accent-sea-900"
          />
          {zh ? "公开会费标准" : "Fees published"}
        </label>
      </section>

      <section className="rounded-lg border border-grey-300 bg-white p-6">
        <h2 className="text-h4 font-semibold text-ink">
          {zh ? "愿景" : "Vision"}
        </h2>
        <div className="mt-5 grid gap-5 md:grid-cols-2">
          <Field label={zh ? "愿景 中文" : "Vision 中文"} htmlFor="vision_zh">
            <TextArea
              id="vision_zh"
              name="vision_zh"
              rows={3}
              maxLength={1000}
              defaultValue={vision.text_zh}
            />
          </Field>
          <Field label={zh ? "愿景 EN" : "Vision EN"} htmlFor="vision_en">
            <TextArea
              id="vision_en"
              name="vision_en"
              rows={3}
              maxLength={1000}
              defaultValue={vision.text_en}
            />
          </Field>
        </div>
      </section>

      <section className="rounded-lg border border-grey-300 bg-white p-6">
        <h2 className="text-h4 font-semibold text-ink">
          {zh ? "营收说明" : "Revenue note"}
        </h2>
        <div className="mt-5 grid gap-5 md:grid-cols-2">
          <Field
            label={zh ? "说明 中文" : "Note 中文"}
            htmlFor="revenue_note_zh"
          >
            <TextArea
              id="revenue_note_zh"
              name="revenue_note_zh"
              rows={3}
              maxLength={1000}
              defaultValue={revenueNote.text_zh}
            />
          </Field>
          <Field label={zh ? "说明 EN" : "Note EN"} htmlFor="revenue_note_en">
            <TextArea
              id="revenue_note_en"
              name="revenue_note_en"
              rows={3}
              maxLength={1000}
              defaultValue={revenueNote.text_en}
            />
          </Field>
        </div>
      </section>

      <section className="rounded-lg border border-grey-300 bg-white p-6">
        <h2 className="text-h4 font-semibold text-ink">
          {zh ? "会员权益" : "Member benefits"}
        </h2>
        <p className="mt-1 text-caption text-grey-500">
          {zh
            ? "每行一条，中英文按行一一对应。"
            : "One item per line; zh and en lines are matched by line index."}
        </p>
        <div className="mt-5 grid gap-5 md:grid-cols-2">
          <Field
            label={zh ? "权益（每行一条）中文" : "Benefits (one per line) 中文"}
            htmlFor="member_benefits_zh"
          >
            <TextArea
              id="member_benefits_zh"
              name="member_benefits_zh"
              rows={6}
              maxLength={5000}
              defaultValue={memberBenefits.zh}
            />
          </Field>
          <Field
            label={zh ? "权益（每行一条）EN" : "Benefits (one per line) EN"}
            htmlFor="member_benefits_en"
          >
            <TextArea
              id="member_benefits_en"
              name="member_benefits_en"
              rows={6}
              maxLength={5000}
              defaultValue={memberBenefits.en}
            />
          </Field>
        </div>
      </section>

      <section className="rounded-lg border border-grey-300 bg-white p-6">
        <h2 className="text-h4 font-semibold text-ink">
          {zh ? "四大支柱" : "Pillars"}
        </h2>
        <div className="mt-5 space-y-5">
          {pillars.map((pillar, index) => {
            const n = index + 1;
            return (
              <fieldset
                key={n}
                className="rounded-md border border-grey-300 p-4"
              >
                <legend className="px-1 text-small font-medium text-ink">
                  {zh ? `支柱 ${n}` : `Pillar ${n}`}
                </legend>
                <div className="grid gap-5 md:grid-cols-2">
                  <Field
                    label={zh ? "标题 中文" : "Title 中文"}
                    htmlFor={`pillar_${n}_title_zh`}
                  >
                    <TextInput
                      id={`pillar_${n}_title_zh`}
                      name={`pillar_${n}_title_zh`}
                      maxLength={200}
                      defaultValue={pillar.title_zh}
                    />
                  </Field>
                  <Field
                    label={zh ? "标题 EN" : "Title EN"}
                    htmlFor={`pillar_${n}_title_en`}
                  >
                    <TextInput
                      id={`pillar_${n}_title_en`}
                      name={`pillar_${n}_title_en`}
                      maxLength={200}
                      defaultValue={pillar.title_en}
                    />
                  </Field>
                  <Field
                    label={zh ? "内容 中文" : "Text 中文"}
                    htmlFor={`pillar_${n}_text_zh`}
                  >
                    <TextArea
                      id={`pillar_${n}_text_zh`}
                      name={`pillar_${n}_text_zh`}
                      rows={3}
                      maxLength={1000}
                      defaultValue={pillar.text_zh}
                    />
                  </Field>
                  <Field
                    label={zh ? "内容 EN" : "Text EN"}
                    htmlFor={`pillar_${n}_text_en`}
                  >
                    <TextArea
                      id={`pillar_${n}_text_en`}
                      name={`pillar_${n}_text_en`}
                      rows={3}
                      maxLength={1000}
                      defaultValue={pillar.text_en}
                    />
                  </Field>
                </div>
              </fieldset>
            );
          })}
        </div>
      </section>

      <section className="rounded-lg border border-grey-300 bg-white p-6">
        <h2 className="text-h4 font-semibold text-ink">
          {zh ? "首页横幅" : "Banners"}
        </h2>
        <p className="mt-1 text-caption text-grey-500">
          {zh
            ? "未启用的横幅将作为草稿保存，站点仅展示已启用且内容完整的横幅。"
            : "Disabled banners are kept as drafts; the site only shows complete, enabled banners."}
        </p>
        <div className="mt-5 space-y-5">
          {banners.map((banner, index) => {
            const n = index + 1;
            return (
              <fieldset
                key={n}
                className="rounded-md border border-grey-300 p-4"
              >
                <legend className="px-1 text-small font-medium text-ink">
                  Banner {n}
                </legend>
                <label className="flex items-center gap-2 text-small text-ink">
                  <input
                    type="checkbox"
                    name={`banner_${n}_is_active`}
                    defaultChecked={banner.is_active}
                    className="size-4 accent-sea-900"
                  />
                  {zh ? "启用" : "Enabled"}
                </label>
                <div className="mt-4 grid gap-5 md:grid-cols-2">
                  <Field
                    label="Key"
                    htmlFor={`banner_${n}_key`}
                    hint={
                      zh
                        ? "短标识，小写字母、数字与连字符"
                        : "Short slug: lowercase letters, digits and hyphens"
                    }
                  >
                    <TextInput
                      id={`banner_${n}_key`}
                      name={`banner_${n}_key`}
                      maxLength={50}
                      pattern="[a-z0-9-]*"
                      defaultValue={banner.key}
                    />
                  </Field>
                  <Field
                    label={zh ? "图片路径" : "Image path"}
                    htmlFor={`banner_${n}_image_path`}
                    hint={zh ? "存储路径，可留空" : "Storage path, optional"}
                  >
                    <TextInput
                      id={`banner_${n}_image_path`}
                      name={`banner_${n}_image_path`}
                      maxLength={300}
                      defaultValue={banner.image_path}
                    />
                  </Field>
                  <Field
                    label={zh ? "标题 中文" : "Title 中文"}
                    htmlFor={`banner_${n}_title_zh`}
                  >
                    <TextInput
                      id={`banner_${n}_title_zh`}
                      name={`banner_${n}_title_zh`}
                      maxLength={200}
                      defaultValue={banner.title_zh}
                    />
                  </Field>
                  <Field
                    label={zh ? "标题 EN" : "Title EN"}
                    htmlFor={`banner_${n}_title_en`}
                  >
                    <TextInput
                      id={`banner_${n}_title_en`}
                      name={`banner_${n}_title_en`}
                      maxLength={200}
                      defaultValue={banner.title_en}
                    />
                  </Field>
                  <Field
                    label={zh ? "文案 中文" : "Text 中文"}
                    htmlFor={`banner_${n}_text_zh`}
                  >
                    <TextArea
                      id={`banner_${n}_text_zh`}
                      name={`banner_${n}_text_zh`}
                      rows={3}
                      maxLength={1000}
                      defaultValue={banner.text_zh}
                    />
                  </Field>
                  <Field
                    label={zh ? "文案 EN" : "Text EN"}
                    htmlFor={`banner_${n}_text_en`}
                  >
                    <TextArea
                      id={`banner_${n}_text_en`}
                      name={`banner_${n}_text_en`}
                      rows={3}
                      maxLength={1000}
                      defaultValue={banner.text_en}
                    />
                  </Field>
                  <Field
                    label={zh ? "按钮文字 中文" : "CTA label 中文"}
                    htmlFor={`banner_${n}_cta_label_zh`}
                  >
                    <TextInput
                      id={`banner_${n}_cta_label_zh`}
                      name={`banner_${n}_cta_label_zh`}
                      maxLength={200}
                      defaultValue={banner.cta_label_zh}
                    />
                  </Field>
                  <Field
                    label={zh ? "按钮文字 EN" : "CTA label EN"}
                    htmlFor={`banner_${n}_cta_label_en`}
                  >
                    <TextInput
                      id={`banner_${n}_cta_label_en`}
                      name={`banner_${n}_cta_label_en`}
                      maxLength={200}
                      defaultValue={banner.cta_label_en}
                    />
                  </Field>
                  <Field
                    label={zh ? "按钮链接" : "CTA link"}
                    htmlFor={`banner_${n}_cta_href`}
                    hint={
                      zh
                        ? "站内路径，如 /membership/apply"
                        : "Site path, e.g. /membership/apply"
                    }
                    className="md:col-span-2"
                  >
                    <TextInput
                      id={`banner_${n}_cta_href`}
                      name={`banner_${n}_cta_href`}
                      maxLength={300}
                      defaultValue={banner.cta_href}
                    />
                  </Field>
                </div>
              </fieldset>
            );
          })}
        </div>
      </section>

      <div>
        <AdminButton type="submit" disabled={pending}>
          {pending
            ? zh
              ? "保存中…"
              : "Saving…"
            : zh
              ? "保存设置"
              : "Save settings"}
        </AdminButton>
        {state.status === "error" && (
          <p className="mt-3 text-small text-red-700">{state.message}</p>
        )}
        {state.status === "success" && (
          <p className="mt-3 text-small text-green-700">{state.message}</p>
        )}
      </div>
    </form>
  );
}
