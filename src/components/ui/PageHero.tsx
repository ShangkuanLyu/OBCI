import { Container } from "@/components/ui/Container";

/** Standard interior-page hero: light blue band, royal label, ink title. */
export function PageHero({
  label,
  title,
  standfirst,
}: {
  label?: string;
  title: string;
  standfirst?: string;
}) {
  return (
    <section className="border-b border-grey-100 bg-royal-50">
      <Container className="pb-12 pt-12 md:pb-16 md:pt-16">
        {label && (
          <p className="flex items-center gap-3 text-caption font-semibold uppercase tracking-[0.08em] text-royal-600">
            <span className="h-0.5 w-6 rounded-full bg-rose-500" aria-hidden />
            {label}
          </p>
        )}
        <h1 className="mt-4 max-w-[20em] text-[2rem] font-semibold leading-[1.12] tracking-[-0.02em] text-ink md:text-h1">
          {title}
        </h1>
        {standfirst && (
          <p className="mt-5 max-w-[36rem] text-body-lg text-grey-600">
            {standfirst}
          </p>
        )}
      </Container>
    </section>
  );
}
