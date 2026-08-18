import { cn } from "@/lib/utils/cn";

/**
 * The standard section header: gold caption label → heading → optional
 * standfirst. `align` and `tone` must stay consistent within a page.
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
            "text-caption font-medium uppercase",
            dark ? "text-rose-400" : "text-rose-600",
          )}
        >
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
            "mt-6 text-body-lg",
            dark ? "text-navy-100/85" : "text-grey-600",
          )}
        >
          {standfirst}
        </p>
      )}
    </div>
  );
}
