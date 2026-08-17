import { cn } from "@/lib/utils/cn";

const inputClass =
  "h-10 w-full rounded-md border border-grey-300 bg-white px-3 text-small outline-none transition-colors focus:border-navy-800";

export function Field({
  label,
  htmlFor,
  hint,
  className,
  children,
}: {
  label: string;
  htmlFor?: string;
  hint?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={className}>
      <label
        htmlFor={htmlFor}
        className="mb-1.5 block text-small font-medium text-ink"
      >
        {label}
      </label>
      {children}
      {hint && <p className="mt-1.5 text-caption text-grey-500">{hint}</p>}
    </div>
  );
}

export function TextInput(props: React.ComponentProps<"input">) {
  return <input {...props} className={cn(inputClass, props.className)} />;
}

export function TextArea(props: React.ComponentProps<"textarea">) {
  return (
    <textarea
      rows={props.rows ?? 6}
      {...props}
      className={cn(
        "w-full rounded-md border border-grey-300 bg-white px-3 py-2 text-small outline-none transition-colors focus:border-navy-800",
        props.className,
      )}
    />
  );
}

export function Select(props: React.ComponentProps<"select">) {
  return (
    <select {...props} className={cn(inputClass, "pr-8", props.className)} />
  );
}

export function AdminButton({
  variant = "primary",
  className,
  ...props
}: React.ComponentProps<"button"> & { variant?: "primary" | "quiet" | "danger" }) {
  return (
    <button
      {...props}
      className={cn(
        "inline-flex h-10 items-center justify-center rounded-md px-4 text-small font-medium transition-colors duration-200 disabled:opacity-50",
        variant === "primary" && "bg-navy-900 text-white hover:bg-navy-800",
        variant === "quiet" && "border border-grey-300 text-ink hover:bg-grey-50",
        variant === "danger" && "border border-red-300 text-red-700 hover:bg-red-50",
        className,
      )}
    />
  );
}
