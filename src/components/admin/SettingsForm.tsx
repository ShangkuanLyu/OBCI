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

const initialState: SettingsActionState = { status: "idle" };

export function SettingsForm({
  locale,
  contact,
  identity,
  membership,
}: {
  locale: string;
  contact: ContactSettings;
  identity: IdentitySettings;
  membership: MembershipSettings;
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
            className="size-4 accent-navy-900"
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
            className="size-4 accent-navy-900"
          />
          {zh ? "公开会费标准" : "Fees published"}
        </label>
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
