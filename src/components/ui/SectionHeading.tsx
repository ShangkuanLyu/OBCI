import { cn } from "@/lib/utils/cn";

/**
 * The standard section header: royal label with short rule → heading →
 * optional standfirst. `align` must stay consistent within a page.
 */
export function SectionHeading({
  label,
  title,
  standfirst,
  align = "left",
  tone = "light",
  className,
}: {
  label?: string;
  title: string;
  standfirst?: string;
  align?: "left" | "center";
  tone?: "light" | "dark";
  className?: string;
}) {
  const dark = tone === "dark";
  return (
    <div
      className={cn(
        "max-w-[42rem]",
        align === "center" && "mx-auto text-center",
        className,
      )}
    >
      {label && (
        <p
          className={cn(
            "flex items-center gap-3 text-caption font-semibold uppercase tracking-[0.08em]",
            align === "center" && "justify-center",
            dark ? "text-royal-200" : "text-royal-600",
          )}
        >
          <span
            className={cn(
              "h-0.5 w-6 rounded-full",
              dark ? "bg-rose-400" : "bg-rose-500",
            )}
            aria-hidden
          />
          {label}
        </p>
      )}
      <h2
        className={cn(
          "mt-4 text-[1.75rem] leading-[1.15] font-semibold tracking-[-0.015em] md:text-h2",
          dark ? "text-white" : "text-ink",
        )}
      >
        {title}
      </h2>
      {standfirst && (
        <p
          className={cn(
            "mt-5 text-body-lg",
            dark ? "text-white/75" : "text-grey-600",
          )}
        >
          {standfirst}
        </p>
      )}
    </div>
  );
}
