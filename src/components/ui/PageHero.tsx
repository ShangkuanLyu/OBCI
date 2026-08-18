import { Container } from "@/components/ui/Container";

/** Standard interior-page hero: navy band, caption label, h1, standfirst. */
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
    <section className="bg-navy-900 text-white">
      <Container className="pb-16 pt-14 md:pb-20 md:pt-16">
        {label && (
          <p className="text-caption font-medium uppercase tracking-[0.08em] text-rose-400">
            {label}
          </p>
        )}
        <h1 className="mt-4 max-w-[20em] text-[2rem] font-semibold leading-[1.12] tracking-[-0.02em] md:text-h1">
          {title}
        </h1>
        {standfirst && (
          <p className="mt-6 max-w-[36rem] text-body-lg text-navy-100/85">
            {standfirst}
          </p>
        )}
      </Container>
    </section>
  );
}
