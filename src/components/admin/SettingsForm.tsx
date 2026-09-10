"use client";

import { FormStatus } from "@/components/admin/Field";

import { useActionState } from "react";
import {
  Field,
  TextInput,
  TextArea,
  Select,
  AdminButton,
} from "@/components/admin/Field";
import {
  saveSettings,
  type SettingsActionState,
} from "@/app/[locale]/admin/settings/actions";
import type { ContactField } from "@/lib/review";

export type ContactSettings = {
  address_label_zh: string;
  address_label_en: string;
  address_zh: string;
  address_en: string;
  address2_label_zh: string;
  address2_label_en: string;
  address2_zh: string;
  address2_en: string;
  phone: string;
  fax: string;
  mobile: string;
  email: string;
  wechat_zh: string;
  wechat_en: string;
  membership_contact_name: string;
  membership_contact_phone: string;
  /** Fields confirmed for publication (site_settings.contact.confirmed_fields). */
  confirmed_fields: string[];
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
  validity_note_zh: string;
  validity_note_en: string;
};

export type BilingualTextSettings = {
  text_zh: string;
  text_en: string;
};

/** Two textareas, one item per line, matched by line index (member
 *  benefits, main objectives). */
export type LineListSettings = {
  zh: string;
  en: string;
};

export type OutlookSettings = {
  title_zh: string;
  title_en: string;
  paragraphs: BilingualTextSettings[];
};

/** Council roster textarea: one member per line
 *  `name_en | name_zh | note_en | note_zh` (lib/utils/council-lines.mjs). */
export type CouncilSettings = {
  lines: string;
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

export type OrgUnitSettings = {
  key: string;
  kind: string;
  name_zh: string;
  name_en: string;
  note_zh: string;
  note_en: string;
};

export type GallerySettings = {
  image_path: string;
  news_slug: string;
  event_slug: string;
  caption_zh: string;
  caption_en: string;
};

export type LegalSettings = {
  constitution_version: string;
  terms_version: string;
  privacy_version: string;
};

/** Council bank account published on the application page for manual fee
 *  payment (site_settings.bank). Values print exactly as stored. */
export type BankSettings = {
  account_name: string;
  bank_name: string;
  bsb: string;
  account_number: string;
  cards: string;
};

/* Option lists mirror the enums validated in settings/actions.ts; contact
   values are typed against lib/review.ts CONTACT_FIELDS. */
const CONTACT_FIELD_OPTIONS: { value: ContactField; zh: string; en: string }[] = [
  { value: "address", zh: "地址", en: "Address" },
  { value: "address2", zh: "第二地址", en: "Second address" },
  { value: "phone", zh: "电话", en: "Phone" },
  { value: "fax", zh: "传真", en: "Fax" },
  { value: "email", zh: "邮箱", en: "Email" },
  { value: "wechat", zh: "微信", en: "WeChat" },
  { value: "membership_contact", zh: "会员联络", en: "Membership contact" },
];

const ORG_KIND_OPTIONS: { value: string; zh: string; en: string }[] = [
  { value: "leadership", zh: "领导团队", en: "Leadership" },
  { value: "committee", zh: "委员会", en: "Committee" },
  { value: "chapters", zh: "专业分会（自动展开）", en: "Professional committees (auto-expanded)" },
  { value: "secretariat", zh: "秘书处", en: "Secretariat" },
  { value: "other", zh: "其他", en: "Other" },
];

const REVIEW_MODULE_OPTIONS: { value: string; zh: string; en: string }[] = [
  { value: "partners", zh: "合作伙伴机构名单", en: "Partner institutions list" },
];

const initialState: SettingsActionState = { status: "idle" };

const sectionClass = "rounded-lg border border-grey-300 bg-white p-6";
const checkboxClass = "size-4 accent-sea-900";

function BilingualTextSection({
  title,
  hint,
  name,
  labelZh,
  labelEn,
  value,
  rows = 3,
  maxLength = 1000,
}: {
  title: string;
  hint?: string;
  name: string;
  labelZh: string;
  labelEn: string;
  value: BilingualTextSettings;
  rows?: number;
  maxLength?: number;
}) {
  return (
    <section className={sectionClass}>
      <h2 className="text-h4 font-semibold text-ink">{title}</h2>
      {hint && <p className="mt-1 text-caption text-grey-500">{hint}</p>}
      <div className="mt-5 grid gap-5 md:grid-cols-2">
        <Field label={labelZh} htmlFor={`${name}_zh`}>
          <TextArea
            id={`${name}_zh`}
            name={`${name}_zh`}
            rows={rows}
            maxLength={maxLength}
            defaultValue={value.text_zh}
          />
        </Field>
        <Field label={labelEn} htmlFor={`${name}_en`}>
          <TextArea
            id={`${name}_en`}
            name={`${name}_en`}
            rows={rows}
            maxLength={maxLength}
            defaultValue={value.text_en}
          />
        </Field>
      </div>
    </section>
  );
}

function LineListSection({
  title,
  hint,
  name,
  labelZh,
  labelEn,
  value,
  rows = 6,
}: {
  title: string;
  hint: string;
  name: string;
  labelZh: string;
  labelEn: string;
  value: LineListSettings;
  rows?: number;
}) {
  return (
    <section className={sectionClass}>
      <h2 className="text-h4 font-semibold text-ink">{title}</h2>
      <p className="mt-1 text-caption text-grey-500">{hint}</p>
      <div className="mt-5 grid gap-5 md:grid-cols-2">
        <Field label={labelZh} htmlFor={`${name}_zh`}>
          <TextArea
            id={`${name}_zh`}
            name={`${name}_zh`}
            rows={rows}
            maxLength={5000}
            defaultValue={value.zh}
          />
        </Field>
        <Field label={labelEn} htmlFor={`${name}_en`}>
          <TextArea
            id={`${name}_en`}
            name={`${name}_en`}
            rows={rows}
            maxLength={5000}
            defaultValue={value.en}
          />
        </Field>
      </div>
    </section>
  );
}

function TitledItemFields({
  prefix,
  item,
  zh,
}: {
  prefix: string;
  item: PillarSettings;
  zh: boolean;
}) {
  return (
    <div className="grid gap-5 md:grid-cols-2">
      <Field label={zh ? "标题 中文" : "Title 中文"} htmlFor={`${prefix}_title_zh`}>
        <TextInput
          id={`${prefix}_title_zh`}
          name={`${prefix}_title_zh`}
          maxLength={200}
          defaultValue={item.title_zh}
        />
      </Field>
      <Field label={zh ? "标题 EN" : "Title EN"} htmlFor={`${prefix}_title_en`}>
        <TextInput
          id={`${prefix}_title_en`}
          name={`${prefix}_title_en`}
          maxLength={200}
          defaultValue={item.title_en}
        />
      </Field>
      <Field label={zh ? "内容 中文" : "Text 中文"} htmlFor={`${prefix}_text_zh`}>
        <TextArea
          id={`${prefix}_text_zh`}
          name={`${prefix}_text_zh`}
          rows={3}
          maxLength={1000}
          defaultValue={item.text_zh}
        />
      </Field>
      <Field label={zh ? "内容 EN" : "Text EN"} htmlFor={`${prefix}_text_en`}>
        <TextArea
          id={`${prefix}_text_en`}
          name={`${prefix}_text_en`}
          rows={3}
          maxLength={1000}
          defaultValue={item.text_en}
        />
      </Field>
    </div>
  );
}

export function SettingsForm({
  locale,
  contact,
  identity,
  membership,
  vision,
  mission,
  coreValues,
  objectives,
  revenueNote,
  memberBenefits,
  pillars,
  outlook,
  banners,
  orgStructure,
  strategyCommittee,
  secretariat,
  council,
  gallery,
  confirmedModules,
  bank,
  legal,
}: {
  locale: string;
  contact: ContactSettings;
  identity: IdentitySettings;
  membership: MembershipSettings;
  vision: BilingualTextSettings;
  mission: BilingualTextSettings;
  coreValues: PillarSettings[];
  objectives: LineListSettings;
  revenueNote: BilingualTextSettings;
  memberBenefits: LineListSettings;
  pillars: PillarSettings[];
  outlook: OutlookSettings;
  banners: BannerSettings[];
  orgStructure: OrgUnitSettings[];
  strategyCommittee: BilingualTextSettings;
  secretariat: BilingualTextSettings;
  council: CouncilSettings;
  gallery: GallerySettings[];
  confirmedModules: string[];
  bank: BankSettings;
  legal: LegalSettings;
}) {
  const zh = locale === "zh";
  const [state, formAction, pending] = useActionState(
    saveSettings,
    initialState,
  );

  return (
    <form action={formAction} className="space-y-8">
      <input type="hidden" name="locale" value={locale} />

      <section className={sectionClass}>
        <h2 className="text-h4 font-semibold text-ink">
          {zh ? "联系方式" : "Contact"}
        </h2>
        <p className="mt-1 text-caption text-grey-500">
          {zh
            ? "所有字段均可留空；留空的字段不会在网站上显示。"
            : "Every field may be left empty; empty fields are not shown on the site."}
        </p>
        <div className="mt-5 grid gap-5 md:grid-cols-2">
          <Field
            label={zh ? "地址标签 中文" : "Address label 中文"}
            htmlFor="address_label_zh"
            hint={zh ? "显示在地址前的名称；留空则显示「地址」" : "Row heading for the address; leave empty to show “Address”"}
          >
            <TextInput
              id="address_label_zh"
              name="address_label_zh"
              maxLength={200}
              defaultValue={contact.address_label_zh}
            />
          </Field>
          <Field
            label={zh ? "地址标签 EN" : "Address label EN"}
            htmlFor="address_label_en"
          >
            <TextInput
              id="address_label_en"
              name="address_label_en"
              maxLength={200}
              defaultValue={contact.address_label_en}
            />
          </Field>
          <Field label={zh ? "地址 中文" : "Address 中文"} htmlFor="address_zh">
            <TextArea
              id="address_zh"
              name="address_zh"
              rows={2}
              maxLength={500}
              defaultValue={contact.address_zh}
            />
          </Field>
          <Field label={zh ? "地址 EN" : "Address EN"} htmlFor="address_en">
            <TextArea
              id="address_en"
              name="address_en"
              rows={2}
              maxLength={500}
              defaultValue={contact.address_en}
            />
          </Field>
          <Field
            label={zh ? "第二地址标签 中文" : "Second address label 中文"}
            htmlFor="address2_label_zh"
            hint={zh ? "第二地址须同时填写标签才会显示" : "The second address is shown only when it also has a label"}
          >
            <TextInput
              id="address2_label_zh"
              name="address2_label_zh"
              maxLength={200}
              defaultValue={contact.address2_label_zh}
            />
          </Field>
          <Field
            label={zh ? "第二地址标签 EN" : "Second address label EN"}
            htmlFor="address2_label_en"
          >
            <TextInput
              id="address2_label_en"
              name="address2_label_en"
              maxLength={200}
              defaultValue={contact.address2_label_en}
            />
          </Field>
          <Field label={zh ? "第二地址 中文" : "Second address 中文"} htmlFor="address2_zh">
            <TextArea
              id="address2_zh"
              name="address2_zh"
              rows={2}
              maxLength={500}
              defaultValue={contact.address2_zh}
            />
          </Field>
          <Field label={zh ? "第二地址 EN" : "Second address EN"} htmlFor="address2_en">
            <TextArea
              id="address2_en"
              name="address2_en"
              rows={2}
              maxLength={500}
              defaultValue={contact.address2_en}
            />
          </Field>
          <Field label={zh ? "电话" : "Phone"} htmlFor="phone">
            <TextInput
              id="phone"
              name="phone"
              type="tel"
              maxLength={50}
              defaultValue={contact.phone}
            />
          </Field>
          <Field label={zh ? "传真" : "Fax"} htmlFor="fax">
            <TextInput
              id="fax"
              name="fax"
              type="tel"
              maxLength={50}
              defaultValue={contact.fax}
            />
          </Field>
          <Field label={zh ? "手机" : "Mobile"} htmlFor="mobile">
            <TextInput
              id="mobile"
              name="mobile"
              type="tel"
              maxLength={50}
              defaultValue={contact.mobile}
            />
          </Field>
          <Field label={zh ? "邮箱" : "Email"} htmlFor="email">
            <TextInput
              id="email"
              name="email"
              type="email"
              maxLength={320}
              defaultValue={contact.email}
            />
          </Field>
          <Field label={zh ? "微信 中文" : "WeChat 中文"} htmlFor="wechat_zh">
            <TextInput
              id="wechat_zh"
              name="wechat_zh"
              maxLength={200}
              defaultValue={contact.wechat_zh}
            />
          </Field>
          <Field label={zh ? "微信 EN" : "WeChat EN"} htmlFor="wechat_en">
            <TextInput
              id="wechat_en"
              name="wechat_en"
              maxLength={200}
              defaultValue={contact.wechat_en}
            />
          </Field>
          <Field
            label={zh ? "会员联络人" : "Membership contact name"}
            htmlFor="membership_contact_name"
          >
            <TextInput
              id="membership_contact_name"
              name="membership_contact_name"
              maxLength={200}
              defaultValue={contact.membership_contact_name}
            />
          </Field>
          <Field
            label={zh ? "会员联络电话" : "Membership contact phone"}
            htmlFor="membership_contact_phone"
          >
            <TextInput
              id="membership_contact_phone"
              name="membership_contact_phone"
              type="tel"
              maxLength={50}
              defaultValue={contact.membership_contact_phone}
            />
          </Field>
        </div>
        <fieldset className="mt-6">
          <legend className="text-small font-medium text-ink">
            {zh ? "已确认可公开的字段" : "Fields confirmed for publication"}
          </legend>
          <p className="mt-1 text-caption text-grey-500">
            {zh
              ? "仅勾选的字段会在网站上显示；其余字段保存在后台但不公开。"
              : "Only ticked fields appear on the site; the rest stay in the CMS unpublished."}
          </p>
          <p className="mt-1 text-caption text-grey-500">
            {zh
              ? "未勾选的字段仅在本地内部审查版本中以「待确认」标记显示，不会出现在生产环境或公开预览中。"
              : "Unticked fields appear only in the local internal review build, marked as pending — never in production or the public preview."}
          </p>
          <div className="mt-3 flex flex-wrap gap-x-6 gap-y-2">
            {CONTACT_FIELD_OPTIONS.map((option) => (
              <label
                key={option.value}
                className="flex items-center gap-2 text-small text-ink"
              >
                <input
                  type="checkbox"
                  name="contact_confirmed"
                  value={option.value}
                  defaultChecked={contact.confirmed_fields.includes(option.value)}
                  className={checkboxClass}
                />
                {zh ? option.zh : option.en}
              </label>
            ))}
          </div>
        </fieldset>
      </section>

      <section className={sectionClass}>
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

      <section className={sectionClass}>
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
          <Field
            label={zh ? "会费有效期说明 中文" : "Fee validity note 中文"}
            htmlFor="validity_note_zh"
            hint={zh ? "显示在入会申请页；留空则使用默认文案" : "Shown on the application page; leave empty to use the default wording"}
            className="md:col-span-2"
          >
            <TextArea
              id="validity_note_zh"
              name="validity_note_zh"
              rows={2}
              maxLength={500}
              defaultValue={membership.validity_note_zh}
            />
          </Field>
          <Field
            label={zh ? "会费有效期说明 EN" : "Fee validity note EN"}
            htmlFor="validity_note_en"
            className="md:col-span-2"
          >
            <TextArea
              id="validity_note_en"
              name="validity_note_en"
              rows={2}
              maxLength={500}
              defaultValue={membership.validity_note_en}
            />
          </Field>
        </div>
        <label className="mt-5 flex items-center gap-2 text-small text-ink">
          <input
            type="checkbox"
            name="fees_published"
            defaultChecked={membership.fees_published}
            className={checkboxClass}
          />
          {zh ? "公开会费标准" : "Fees published"}
        </label>
      </section>

      <BilingualTextSection
        title={zh ? "愿景" : "Vision"}
        name="vision"
        labelZh={zh ? "愿景 中文" : "Vision 中文"}
        labelEn={zh ? "愿景 EN" : "Vision EN"}
        value={vision}
      />

      <BilingualTextSection
        title={zh ? "使命" : "Mission"}
        hint={
          zh
            ? "留空则「关于」页不显示使命模块。"
            : "Leave empty to hide the mission module on the About page."
        }
        name="mission"
        labelZh={zh ? "使命 中文" : "Mission 中文"}
        labelEn={zh ? "使命 EN" : "Mission EN"}
        value={mission}
      />

      <section className={sectionClass}>
        <h2 className="text-h4 font-semibold text-ink">
          {zh ? "核心价值观" : "Core values"}
        </h2>
        <p className="mt-1 text-caption text-grey-500">
          {zh
            ? "最多 4 条；没有标题的条目不会显示。"
            : "Up to 4 items; items without a title are not shown."}
        </p>
        <div className="mt-5 space-y-5">
          {coreValues.map((value, index) => {
            const n = index + 1;
            return (
              <fieldset key={n} className="rounded-md border border-grey-300 p-4">
                <legend className="px-1 text-small font-medium text-ink">
                  {zh ? `价值观 ${n}` : `Value ${n}`}
                </legend>
                <TitledItemFields prefix={`value_${n}`} item={value} zh={zh} />
              </fieldset>
            );
          })}
        </div>
      </section>

      <LineListSection
        title={zh ? "主要宗旨" : "Main objectives"}
        hint={
          zh
            ? "每行一条，中英文按行一一对应；留空则「关于」页不显示宗旨模块。"
            : "One item per line; zh and en lines are matched by line index. Leave empty to hide the objectives module on the About page."
        }
        name="objectives"
        labelZh={zh ? "宗旨（每行一条）中文" : "Objectives (one per line) 中文"}
        labelEn={zh ? "宗旨（每行一条）EN" : "Objectives (one per line) EN"}
        value={objectives}
      />

      <BilingualTextSection
        title={zh ? "营收说明" : "Revenue note"}
        name="revenue_note"
        labelZh={zh ? "说明 中文" : "Note 中文"}
        labelEn={zh ? "说明 EN" : "Note EN"}
        value={revenueNote}
      />

      <LineListSection
        title={zh ? "会员权益" : "Member benefits"}
        hint={
          zh
            ? "每行一条，中英文按行一一对应。"
            : "One item per line; zh and en lines are matched by line index."
        }
        name="member_benefits"
        labelZh={zh ? "权益（每行一条）中文" : "Benefits (one per line) 中文"}
        labelEn={zh ? "权益（每行一条）EN" : "Benefits (one per line) EN"}
        value={memberBenefits}
      />

      <section className={sectionClass}>
        <h2 className="text-h4 font-semibold text-ink">
          {zh ? "四大支柱" : "Pillars"}
        </h2>
        <div className="mt-5 space-y-5">
          {pillars.map((pillar, index) => {
            const n = index + 1;
            return (
              <fieldset key={n} className="rounded-md border border-grey-300 p-4">
                <legend className="px-1 text-small font-medium text-ink">
                  {zh ? `支柱 ${n}` : `Pillar ${n}`}
                </legend>
                <TitledItemFields prefix={`pillar_${n}`} item={pillar} zh={zh} />
              </fieldset>
            );
          })}
        </div>
      </section>

      <section className={sectionClass}>
        <h2 className="text-h4 font-semibold text-ink">
          {zh ? "年度回顾与展望" : "Review and outlook"}
        </h2>
        <p className="mt-1 text-caption text-grey-500">
          {zh
            ? "标题与最多 3 段正文；没有任何段落时「关于」页不显示该模块。"
            : "A title and up to 3 paragraphs; the About page hides the module while no paragraph is set."}
        </p>
        <div className="mt-5 grid gap-5 md:grid-cols-2">
          <Field label={zh ? "标题 中文" : "Title 中文"} htmlFor="outlook_title_zh">
            <TextInput
              id="outlook_title_zh"
              name="outlook_title_zh"
              maxLength={200}
              defaultValue={outlook.title_zh}
            />
          </Field>
          <Field label={zh ? "标题 EN" : "Title EN"} htmlFor="outlook_title_en">
            <TextInput
              id="outlook_title_en"
              name="outlook_title_en"
              maxLength={200}
              defaultValue={outlook.title_en}
            />
          </Field>
        </div>
        <div className="mt-5 space-y-5">
          {outlook.paragraphs.map((paragraph, index) => {
            const n = index + 1;
            const prefix = `outlook_${n}`;
            return (
              <fieldset key={n} className="rounded-md border border-grey-300 p-4">
                <legend className="px-1 text-small font-medium text-ink">
                  {zh ? `段落 ${n}` : `Paragraph ${n}`}
                </legend>
                <div className="grid gap-5 md:grid-cols-2">
                  <Field label={zh ? "正文 中文" : "Text 中文"} htmlFor={`${prefix}_zh`}>
                    <TextArea
                      id={`${prefix}_zh`}
                      name={`${prefix}_zh`}
                      rows={4}
                      maxLength={2000}
                      defaultValue={paragraph.text_zh}
                    />
                  </Field>
                  <Field label={zh ? "正文 EN" : "Text EN"} htmlFor={`${prefix}_en`}>
                    <TextArea
                      id={`${prefix}_en`}
                      name={`${prefix}_en`}
                      rows={4}
                      maxLength={2000}
                      defaultValue={paragraph.text_en}
                    />
                  </Field>
                </div>
              </fieldset>
            );
          })}
        </div>
      </section>

      <section className={sectionClass}>
        <h2 className="text-h4 font-semibold text-ink">
          {zh ? "组织架构" : "Organisational structure"}
        </h2>
        <p className="mt-1 text-caption text-grey-500">
          {zh
            ? "最多 6 个单位，按顺序显示在架构图中；需同时填写 Key 与名称。类型为「专业分会」的单位会自动展开为当前启用的分会。"
            : "Up to 6 units, shown in the chart in this order; a unit needs both a key and a name. A unit of kind “Professional committees” expands to the active committees automatically."}
        </p>
        <div className="mt-5 space-y-5">
          {orgStructure.map((unit, index) => {
            const n = index + 1;
            const prefix = `org_${n}`;
            return (
              <fieldset key={n} className="rounded-md border border-grey-300 p-4">
                <legend className="px-1 text-small font-medium text-ink">
                  {zh ? `单位 ${n}` : `Unit ${n}`}
                </legend>
                <div className="grid gap-5 md:grid-cols-2">
                  <Field
                    label="Key"
                    htmlFor={`${prefix}_key`}
                    hint={
                      zh
                        ? "短标识，小写字母、数字与连字符"
                        : "Short slug: lowercase letters, digits and hyphens"
                    }
                  >
                    <TextInput
                      id={`${prefix}_key`}
                      name={`${prefix}_key`}
                      maxLength={50}
                      pattern="[a-z0-9-]*"
                      defaultValue={unit.key}
                    />
                  </Field>
                  <Field label={zh ? "类型" : "Kind"} htmlFor={`${prefix}_kind`}>
                    <Select
                      id={`${prefix}_kind`}
                      name={`${prefix}_kind`}
                      defaultValue={unit.kind || "other"}
                    >
                      {ORG_KIND_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {zh ? option.zh : option.en}
                        </option>
                      ))}
                    </Select>
                  </Field>
                  <Field label={zh ? "名称 中文" : "Name 中文"} htmlFor={`${prefix}_name_zh`}>
                    <TextInput
                      id={`${prefix}_name_zh`}
                      name={`${prefix}_name_zh`}
                      maxLength={200}
                      defaultValue={unit.name_zh}
                    />
                  </Field>
                  <Field label={zh ? "名称 EN" : "Name EN"} htmlFor={`${prefix}_name_en`}>
                    <TextInput
                      id={`${prefix}_name_en`}
                      name={`${prefix}_name_en`}
                      maxLength={200}
                      defaultValue={unit.name_en}
                    />
                  </Field>
                  <Field label={zh ? "说明 中文" : "Note 中文"} htmlFor={`${prefix}_note_zh`}>
                    <TextArea
                      id={`${prefix}_note_zh`}
                      name={`${prefix}_note_zh`}
                      rows={2}
                      maxLength={500}
                      defaultValue={unit.note_zh}
                    />
                  </Field>
                  <Field label={zh ? "说明 EN" : "Note EN"} htmlFor={`${prefix}_note_en`}>
                    <TextArea
                      id={`${prefix}_note_en`}
                      name={`${prefix}_note_en`}
                      rows={2}
                      maxLength={500}
                      defaultValue={unit.note_en}
                    />
                  </Field>
                </div>
              </fieldset>
            );
          })}
        </div>
      </section>

      <BilingualTextSection
        title={zh ? "中国企业出海战略委员会" : "China Enterprise Going-Global Strategy Committee"}
        hint={
          zh
            ? "委员会介绍；留空则「关于」页不显示该模块。"
            : "Committee description; leave empty to hide the module on the About page."
        }
        name="strategy_committee"
        labelZh={zh ? "介绍 中文" : "Description 中文"}
        labelEn={zh ? "介绍 EN" : "Description EN"}
        value={strategyCommittee}
        rows={4}
        maxLength={2000}
      />

      <BilingualTextSection
        title={zh ? "秘书处" : "Secretariat"}
        hint={
          zh
            ? "秘书处介绍；留空则「关于」页不显示该模块。"
            : "Secretariat description; leave empty to hide the module on the About page."
        }
        name="secretariat"
        labelZh={zh ? "介绍 中文" : "Description 中文"}
        labelEn={zh ? "介绍 EN" : "Description EN"}
        value={secretariat}
        rows={4}
        maxLength={2000}
      />

      <section className={sectionClass}>
        <h2 className="text-h4 font-semibold text-ink">
          {zh ? "执委会议员" : "Councillors"}
        </h2>
        <p className="mt-1 text-caption text-grey-500">
          {zh
            ? "每行一位，按名录顺序：英文名 | 中文名 | 英文备注 | 中文备注。备注可省略；只填一种语言的姓名时另一种沿用同名。最多 60 位；留空则领导团队与组织架构页不显示议员名单。"
            : "One member per line, in roster order: name_en | name_zh | note_en | note_zh. Notes are optional; a name given in one language only is reused for the other. Up to 60 members; leave empty to hide the roster on the leadership and structure pages."}
        </p>
        <Field
          label={zh ? "议员名录" : "Roster"}
          htmlFor="council_lines"
          hint="Hon. Ken Smith AM | 肯·史密斯 | Founding President | 创会会长"
          className="mt-5"
        >
          <TextArea
            id="council_lines"
            name="council_lines"
            rows={12}
            maxLength={10000}
            defaultValue={council.lines}
          />
        </Field>
      </section>

      <section className={sectionClass}>
        <h2 className="text-h4 font-semibold text-ink">
          {zh ? "资质与政商活动图集" : "Credentials and activity gallery"}
        </h2>
        <p className="mt-1 text-caption text-grey-500">
          {zh
            ? "最多 8 张。填写资讯或活动的 slug 后，标题与链接会自动取自该已发布内容；否则使用此处的说明文字。没有图片路径或说明的条目不显示。"
            : "Up to 8 items. With a news or event slug, the caption and link come from that published item; otherwise the caption below is used. Items without an image path or caption are not shown."}
        </p>
        <div className="mt-5 space-y-5">
          {gallery.map((item, index) => {
            const n = index + 1;
            const prefix = `gallery_${n}`;
            return (
              <fieldset key={n} className="rounded-md border border-grey-300 p-4">
                <legend className="px-1 text-small font-medium text-ink">
                  {zh ? `图片 ${n}` : `Image ${n}`}
                </legend>
                <div className="grid gap-5 md:grid-cols-2">
                  <Field
                    label={zh ? "图片路径" : "Image path"}
                    htmlFor={`${prefix}_image_path`}
                    hint={zh ? "media 存储桶中的路径" : "Path within the media bucket"}
                    className="md:col-span-2"
                  >
                    <TextInput
                      id={`${prefix}_image_path`}
                      name={`${prefix}_image_path`}
                      maxLength={300}
                      defaultValue={item.image_path}
                    />
                  </Field>
                  <Field label={zh ? "资讯 slug" : "News slug"} htmlFor={`${prefix}_news_slug`}>
                    <TextInput
                      id={`${prefix}_news_slug`}
                      name={`${prefix}_news_slug`}
                      maxLength={200}
                      pattern="[a-z0-9-]*"
                      defaultValue={item.news_slug}
                    />
                  </Field>
                  <Field label={zh ? "活动 slug" : "Event slug"} htmlFor={`${prefix}_event_slug`}>
                    <TextInput
                      id={`${prefix}_event_slug`}
                      name={`${prefix}_event_slug`}
                      maxLength={200}
                      pattern="[a-z0-9-]*"
                      defaultValue={item.event_slug}
                    />
                  </Field>
                  <Field label={zh ? "说明 中文" : "Caption 中文"} htmlFor={`${prefix}_caption_zh`}>
                    <TextInput
                      id={`${prefix}_caption_zh`}
                      name={`${prefix}_caption_zh`}
                      maxLength={300}
                      defaultValue={item.caption_zh}
                    />
                  </Field>
                  <Field label={zh ? "说明 EN" : "Caption EN"} htmlFor={`${prefix}_caption_en`}>
                    <TextInput
                      id={`${prefix}_caption_en`}
                      name={`${prefix}_caption_en`}
                      maxLength={300}
                      defaultValue={item.caption_en}
                    />
                  </Field>
                </div>
              </fieldset>
            );
          })}
        </div>
      </section>

      <section className={sectionClass}>
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
              <fieldset key={n} className="rounded-md border border-grey-300 p-4">
                <legend className="px-1 text-small font-medium text-ink">
                  Banner {n}
                </legend>
                <label className="flex items-center gap-2 text-small text-ink">
                  <input
                    type="checkbox"
                    name={`banner_${n}_is_active`}
                    defaultChecked={banner.is_active}
                    className={checkboxClass}
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

      <section className={sectionClass}>
        <h2 className="text-h4 font-semibold text-ink">
          {zh ? "审查发布" : "Review gates"}
        </h2>
        <p className="mt-1 text-caption text-grey-500">
          {zh
            ? "已存在于后台但需商会确认的模块，勾选后才会在网站上显示。"
            : "Modules whose data exists in the CMS but needs the chamber's confirmation; they appear on the site only once ticked."}
        </p>
        <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2">
          {REVIEW_MODULE_OPTIONS.map((option) => (
            <label
              key={option.value}
              className="flex items-center gap-2 text-small text-ink"
            >
              <input
                type="checkbox"
                name="review_confirmed"
                value={option.value}
                defaultChecked={confirmedModules.includes(option.value)}
                className={checkboxClass}
              />
              {zh ? option.zh : option.en}
            </label>
          ))}
        </div>
      </section>

      <section className={sectionClass}>
        <h2 className="text-h4 font-semibold text-ink">
          {zh ? "银行账户" : "Bank account"}
        </h2>
        <p className="mt-1 text-caption text-grey-500">
          {zh
            ? "显示在入会申请页「缴费方式」中，供会员线下缴纳会费；内容按原样显示（BSB 等不会自动加格式）。账户名称须为法定名称，同时作为支票抬头。四项账户信息齐全后才会显示。"
            : "Shown under “Payment” on the application page for manual fee payment; values print exactly as typed (the BSB is not reformatted). The account name is the legal name and doubles as the cheque payee. The block appears only when the four account fields are all filled."}
        </p>
        <div className="mt-5 grid gap-5 md:grid-cols-2">
          <Field
            label={zh ? "账户名称" : "Account name"}
            htmlFor="bank_account_name"
            className="md:col-span-2"
          >
            <TextInput
              id="bank_account_name"
              name="bank_account_name"
              maxLength={200}
              defaultValue={bank.account_name}
            />
          </Field>
          <Field label={zh ? "开户银行" : "Bank"} htmlFor="bank_name">
            <TextInput
              id="bank_name"
              name="bank_name"
              maxLength={200}
              defaultValue={bank.bank_name}
            />
          </Field>
          <Field label="BSB" htmlFor="bank_bsb">
            <TextInput
              id="bank_bsb"
              name="bank_bsb"
              maxLength={20}
              inputMode="numeric"
              defaultValue={bank.bsb}
            />
          </Field>
          <Field label={zh ? "账号" : "Account number"} htmlFor="bank_account_number">
            <TextInput
              id="bank_account_number"
              name="bank_account_number"
              maxLength={50}
              inputMode="numeric"
              defaultValue={bank.account_number}
            />
          </Field>
          <Field
            label={zh ? "受理卡种" : "Cards accepted"}
            htmlFor="bank_cards"
            hint={zh ? "如 VISA / MasterCard；留空则不显示" : "e.g. VISA / MasterCard; empty = not shown"}
          >
            <TextInput
              id="bank_cards"
              name="bank_cards"
              maxLength={200}
              defaultValue={bank.cards}
            />
          </Field>
        </div>
      </section>

      <section className={sectionClass}>
        <h2 className="text-h4 font-semibold text-ink">
          {zh ? "法律文本版本" : "Legal text versions"}
        </h2>
        <p className="mt-1 text-caption text-grey-500">
          {zh
            ? "填写已批准文本的版本号（如 2026-10）。三项齐全后入会申请表才会开放；任一为空即视为未批准。"
            : "Version stamps of the approved texts (e.g. 2026-10). The application form opens only when all three are set; an empty field means not approved."}
        </p>
        <div className="mt-5 grid gap-5 md:grid-cols-3">
          <Field label={zh ? "章程版本" : "Constitution version"} htmlFor="constitution_version">
            <TextInput
              id="constitution_version"
              name="constitution_version"
              maxLength={50}
              defaultValue={legal.constitution_version}
            />
          </Field>
          <Field label={zh ? "条款版本" : "Terms version"} htmlFor="terms_version">
            <TextInput
              id="terms_version"
              name="terms_version"
              maxLength={50}
              defaultValue={legal.terms_version}
            />
          </Field>
          <Field label={zh ? "隐私政策版本" : "Privacy policy version"} htmlFor="privacy_version">
            <TextInput
              id="privacy_version"
              name="privacy_version"
              maxLength={50}
              defaultValue={legal.privacy_version}
            />
          </Field>
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
        <FormStatus state={state} className="mt-3" />
      </div>
    </form>
  );
}
