import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils/cn";
import type { ComponentProps } from "react";

type Variant = "primary" | "secondary" | "secondaryDark";

const base =
  "inline-flex h-11 items-center justify-center rounded-md px-6 text-small font-medium transition-colors duration-200";

const variants: Record<Variant, string> = {
  primary: "bg-rose-500 text-white hover:bg-rose-600",
  secondary: "border border-royal-600 text-royal-600 hover:bg-royal-100/60",
  secondaryDark: "border border-white/40 text-white hover:bg-white/10",
};

type ButtonLinkProps = {
  variant?: Variant;
  className?: string;
} & ComponentProps<typeof Link>;

export function ButtonLink({
  variant = "primary",
  className,
  ...props
}: ButtonLinkProps) {
  return (
    <Link className={cn(base, variants[variant], className)} {...props} />
  );
}

type ButtonProps = {
  variant?: Variant;
  className?: string;
} & ComponentProps<"button">;

export function Button({ variant = "primary", className, ...props }: ButtonProps) {
  return (
    <button
      className={cn(base, variants[variant], "disabled:opacity-50", className)}
      {...props}
    />
  );
}
