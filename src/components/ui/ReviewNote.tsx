import { getTranslations } from "next-intl/server";
import { isPreviewDeployment } from "@/lib/preview";
import { cn } from "@/lib/utils/cn";

/**
 * Module-level review note. Renders ONLY in the review-preview deployment,
 * explaining why a module is hidden or provisional; never part of a
 * production build. Defaults to the generic "content pending chamber
 * confirmation" line.
 */
export async function ReviewNote({
  children,
  className,
}: {
  children?: React.ReactNode;
  className?: string;
}) {
  if (!isPreviewDeployment()) return null;
  const t = await getTranslations("common");
  return (
    <div
      role="note"
      className={cn(
        "rounded-md border border-dashed border-grey-300 bg-grey-50 px-4 py-3 text-small leading-relaxed text-grey-600",
        className,
      )}
    >
      <span className="font-semibold text-sea-800">{t("reviewNoteLabel")}</span>
      <span aria-hidden> · </span>
      <span>{children ?? t("reviewPending")}</span>
    </div>
  );
}
