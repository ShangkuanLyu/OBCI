"use client";

import { useTranslations } from "next-intl";

/**
 * Up-front notice rendered above every public form whose submission is
 * disabled (see lib/preview.ts submissionsDisabled). The `id` is referenced
 * by the form's aria-describedby so the disabled state is announced.
 */
export function PreviewFormNotice({ id }: { id: string }) {
  const t = useTranslations("common");
  return (
    <p
      id={id}
      role="note"
      className="rounded-md border border-dashed border-grey-300 bg-grey-50 px-4 py-3 text-small leading-relaxed text-grey-600"
    >
      <span className="font-semibold text-sea-800">{t("reviewNoteLabel")}</span>
      <span aria-hidden> · </span>
      {t("previewFormNotice")}
    </p>
  );
}
