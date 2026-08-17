import { cn } from "@/lib/utils/cn";

/** The single site container — every section aligns to this box. */
export function Container({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("mx-auto w-full max-w-[69.5rem] px-6 md:px-10", className)}>
      {children}
    </div>
  );
}
