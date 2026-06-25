import { ButtonLink } from "@/components/Button";
import { BookingButton } from "@/components/Booking";
import { Reveal } from "@/components/Reveal";

type CtaBandProps = {
  title?: string;
  subtitle?: string;
  primaryLabel?: string;
  primaryHref?: string;
  secondaryLabel?: string;
  secondaryHref?: string;
};

export function CtaBand({
  title = "Stop guessing what to buy.",
  subtitle = "Get a rolling 12-month forecast with order recommendations built on your own data.",
  primaryLabel = "Start an Inquiry",
  primaryHref = "/contact",
  secondaryLabel = "See how it works",
  secondaryHref = "/services",
}: CtaBandProps) {
  return (
    <section className="mx-auto max-w-6xl px-5 py-20">
      <Reveal>
        <div className="glass relative overflow-hidden rounded-2xl px-6 py-14 text-center sm:px-12">
          <div
            className="pointer-events-none absolute inset-0 opacity-60"
            style={{
              background:
                "radial-gradient(600px circle at 50% 0%, color-mix(in srgb, var(--color-accent) 12%, transparent), transparent 70%)",
            }}
            aria-hidden
          />
          <div className="relative">
            <p className="mb-3 font-mono text-xs uppercase tracking-[0.25em] text-accent">
              {"// let's build your model"}
            </p>
            <h2 className="mx-auto max-w-2xl font-mono text-2xl font-semibold text-fg sm:text-4xl">
              {title}
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-sm text-muted sm:text-base">
              {subtitle}
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <ButtonLink href={primaryHref} variant="primary">
                {primaryLabel}
              </ButtonLink>
              <ButtonLink href={secondaryHref} variant="secondary">
                {secondaryLabel}
              </ButtonLink>
              <BookingButton variant="ghost" />
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
