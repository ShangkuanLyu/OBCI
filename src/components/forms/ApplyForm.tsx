"use client";

import { useActionState } from "react";
import { useLocale, useTranslations } from "next-intl";
import {
  submitMembershipApplication,
  type ActionState,
} from "@/app/actions/public";
import { Button } from "@/components/ui/Button";

const initialState: ActionState = { status: "idle" };

const inputClass =
  "h-11 w-full rounded-md border border-grey-300 bg-white px-4 text-small outline-none transition-colors focus:border-navy-800";

const labelClass = "mb-2 block text-small font-medium text-ink";

export function ApplyForm({
  types,
}: {
  types: { code: string; label: string }[];
}) {
  const t = useTranslations("apply");
  const tCommon = useTranslations("common");
  const locale = useLocale();
  const [state, formAction, pending] = useActionState(
    submitMembershipApplication,
    initialState,
  );

  if (state.status === "success") {
    return (
      <div className="border-t border-grey-300 pt-8">
        <h3 className="text-h3 font-semibold tracking-[-0.01em] text-ink">
          {t("successTitle")}
        </h3>
        <p className="mt-4 max-w-[42rem] text-body leading-relaxed text-grey-600">
          {t("successText")}
        </p>
        {state.message === "upload_partial" && (
          <p className="mt-6 text-caption text-grey-500">{t("uploadError")}</p>
        )}
      </div>
    );
  }

  return (
    <form action={formAction} className="grid gap-6 md:grid-cols-2">
      <input type="hidden" name="locale" value={locale} />

      <div>
        <label htmlFor="apply-type" className={labelClass}>
          {t("type")}
        </label>
        <select
          id="apply-type"
          name="membership_type_code"
          required
          defaultValue=""
          className={inputClass}
        >
          <option value="" disabled>
            {t("type")}
          </option>
          {types.map((type) => (
            <option key={type.code} value={type.code}>
              {type.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="apply-name" className={labelClass}>
          {t("name")}
        </label>
        <input
          id="apply-name"
          name="applicant_name"
          type="text"
          required
          autoComplete="name"
          className={inputClass}
        />
      </div>

      <div>
        <label htmlFor="apply-email" className={labelClass}>
          {t("email")}
        </label>
        <input
          id="apply-email"
          name="email"
          type="email"
          required
          autoComplete="email"
          className={inputClass}
        />
      </div>

      <div>
        <label htmlFor="apply-phone" className={labelClass}>
          {t("phone")}
        </label>
        <input
          id="apply-phone"
          name="phone"
          type="tel"
          autoComplete="tel"
          className={inputClass}
        />
      </div>

      <div>
        <label htmlFor="apply-organisation" className={labelClass}>
          {t("organisation")}
        </label>
        <input
          id="apply-organisation"
          name="organisation_name"
          type="text"
          autoComplete="organization"
          className={inputClass}
        />
      </div>

      <div>
        <label htmlFor="apply-position" className={labelClass}>
          {t("position")}
        </label>
        <input
          id="apply-position"
          name="position"
          type="text"
          autoComplete="organization-title"
          className={inputClass}
        />
      </div>

      <div className="md:col-span-2">
        <label htmlFor="apply-message" className={labelClass}>
          {t("message")}
        </label>
        <textarea
          id="apply-message"
          name="message"
          rows={5}
          placeholder={t("messagePlaceholder")}
          className="w-full rounded-md border border-grey-300 bg-white px-4 py-3 text-small outline-none transition-colors focus:border-navy-800"
        />
      </div>

      <div className="md:col-span-2">
        <label htmlFor="apply-documents" className={labelClass}>
          {t("documents")}
        </label>
        <input
          id="apply-documents"
          name="documents"
          type="file"
          multiple
          accept=".pdf,.doc,.docx,image/jpeg,image/png"
          className="block w-full text-small text-grey-600 file:mr-3 file:h-9 file:rounded-md file:border file:border-grey-300 file:bg-white file:px-4 file:text-small file:font-medium file:text-navy-900 file:transition-colors hover:file:bg-grey-50"
        />
        <p className="mt-2 text-caption text-grey-500">{t("documentsHint")}</p>
      </div>

      <div className="md:col-span-2 mt-2">
        <Button
          type="submit"
          disabled={pending}
          className="w-full md:w-auto"
        >
          {pending ? tCommon("submitting") : t("submit")}
        </Button>
        {state.status === "error" && (
          <p className="mt-4 text-small text-red-700">{t("errorGeneric")}</p>
        )}
      </div>
    </form>
  );
}
