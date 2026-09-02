"use client";

import { FormStatus } from "@/components/admin/Field";

import { useActionState } from "react";
import {
  Field,
  TextInput,
  TextArea,
  AdminButton,
} from "@/components/admin/Field";
import {
  createMembershipType,
  updateMembershipType,
  type ActionState,
} from "@/app/[locale]/admin/membership-types/actions";
import type { Tables } from "@/types/database.types";

const initialState: ActionState = { status: "idle" };

export function MembershipTypeForm({
  locale,
  item,
}: {
  locale: string;
  item?: Tables<"membership_types">;
}) {
  const zh = locale === "zh";
  const [state, formAction, pending] = useActionState(
    item ? updateMembershipType : createMembershipType,
    initialState,
  );

  return (
    <form action={formAction} className="space-y-5">
      <input type="hidden" name="locale" value={locale} />
      {item && <input type="hidden" name="id" value={item.id} />}

      <Field
        label={zh ? "代码" : "Code"}
        htmlFor="code"
        hint={
          zh
            ? "小写字母、数字与连字符，如 corporate-gold"
            : "Lowercase letters, digits and hyphens, e.g. corporate-gold"
        }
      >
        <TextInput
          id="code"
          name="code"
          required
          maxLength={100}
          pattern="[a-z0-9]+(-[a-z0-9]+)*"
          defaultValue={item?.code}
        />
      </Field>

      <div className="grid gap-5 md:grid-cols-2">
        <Field label={`${zh ? "名称" : "Name"} 中文`} htmlFor="name_zh">
          <TextInput
            id="name_zh"
            name="name_zh"
            required
            maxLength={200}
            defaultValue={item?.name_zh}
          />
        </Field>
        <Field label={`${zh ? "名称" : "Name"} EN`} htmlFor="name_en">
          <TextInput
            id="name_en"
            name="name_en"
            required
            maxLength={200}
            defaultValue={item?.name_en}
          />
        </Field>
        <Field
          label={`${zh ? "营业额区间" : "Turnover"} 中文`}
          htmlFor="turnover_zh"
        >
          <TextInput
            id="turnover_zh"
            name="turnover_zh"
            maxLength={300}
            defaultValue={item?.turnover_zh ?? ""}
          />
        </Field>
        <Field
          label={`${zh ? "营业额区间" : "Turnover"} EN`}
          htmlFor="turnover_en"
        >
          <TextInput
            id="turnover_en"
            name="turnover_en"
            maxLength={300}
            defaultValue={item?.turnover_en ?? ""}
          />
        </Field>
        <Field
          label={`${zh ? "简介" : "Description"} 中文`}
          htmlFor="description_zh"
        >
          <TextArea
            id="description_zh"
            name="description_zh"
            rows={4}
            maxLength={2000}
            defaultValue={item?.description_zh ?? ""}
          />
        </Field>
        <Field
          label={`${zh ? "简介" : "Description"} EN`}
          htmlFor="description_en"
        >
          <TextArea
            id="description_en"
            name="description_en"
            rows={4}
            maxLength={2000}
            defaultValue={item?.description_en ?? ""}
          />
        </Field>
        <Field
          label={`${zh ? "会员权益（每行一条）" : "Benefits (one per line)"} 中文`}
          htmlFor="benefits_zh"
        >
          <TextArea
            id="benefits_zh"
            name="benefits_zh"
            rows={6}
            maxLength={5000}
            defaultValue={(item?.benefits_zh ?? []).join("\n")}
          />
        </Field>
        <Field
          label={`${zh ? "会员权益（每行一条）" : "Benefits (one per line)"} EN`}
          htmlFor="benefits_en"
        >
          <TextArea
            id="benefits_en"
            name="benefits_en"
            rows={6}
            maxLength={5000}
            defaultValue={(item?.benefits_en ?? []).join("\n")}
          />
        </Field>
      </div>

      <div className="grid gap-5 md:grid-cols-3">
        <Field
          label={zh ? "年费" : "Annual price"}
          htmlFor="price_annual"
          hint={zh ? "留空表示面议" : "Leave empty for on request"}
        >
          <TextInput
            id="price_annual"
            name="price_annual"
            type="number"
            min={0}
            step={0.01}
            defaultValue={item?.price_annual ?? ""}
          />
        </Field>
        <Field label={zh ? "货币" : "Currency"} htmlFor="currency">
          <TextInput
            id="currency"
            name="currency"
            maxLength={3}
            pattern="[A-Za-z]{3}"
            defaultValue={item?.currency ?? "AUD"}
          />
        </Field>
        <Field label={zh ? "排序" : "Display order"} htmlFor="display_order">
          <TextInput
            id="display_order"
            name="display_order"
            type="number"
            min={0}
            max={9999}
            defaultValue={item?.display_order ?? 0}
          />
        </Field>
      </div>

      <div className="flex flex-wrap gap-6">
        <label className="flex items-center gap-2 text-small text-ink">
          <input
            type="checkbox"
            name="is_popular"
            defaultChecked={item ? item.is_popular : false}
            className="h-4 w-4 rounded border-grey-300 accent-sea-900"
          />
          {zh ? "推荐档位" : "Popular"}
        </label>
        <label className="flex items-center gap-2 text-small text-ink">
          <input
            type="checkbox"
            name="is_active"
            defaultChecked={item ? item.is_active : true}
            className="h-4 w-4 rounded border-grey-300 accent-sea-900"
          />
          {zh ? "启用显示" : "Active"}
        </label>
      </div>

      <p className="text-caption text-grey-500">
        {zh
          ? "会员与申请引用会员类型，因此不提供删除；如需下架请取消“启用显示”。"
          : "Members and applications reference tiers, so deletion is not available; untick Active to retire a tier."}
      </p>

      <div className="pt-2">
        <AdminButton type="submit" disabled={pending}>
          {pending
            ? zh
              ? "保存中…"
              : "Saving…"
            : zh
              ? "保存"
              : "Save"}
        </AdminButton>
        <FormStatus state={state} />
      </div>
    </form>
  );
}
