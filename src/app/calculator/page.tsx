import type { Metadata } from "next";
import { SectionHeading } from "@/components/SectionHeading";
import { SavingsCalculator } from "@/components/SavingsCalculator";
import { CtaBand } from "@/components/CtaBand";
import { Reveal } from "@/components/Reveal";

export const metadata: Metadata = {
  title: "Inventory Savings Calculator",
  description:
    "Estimate the working capital and carrying-cost savings you'd release by hitting a tighter target days-on-hand — in about 30 seconds.",
  alternates: { canonical: "/calculator" },
};

export default function CalculatorPage() {
  return (
    <>
      <section className="mx-auto max-w-6xl px-5 pt-16 sm:pt-20">
        <SectionHeading level={1}
          kicker="// f07 · working-capital calculator"
          title="See the cash trapped in your inventory"
          subtitle="Drag the sliders to your numbers. We estimate the one-time working-capital release and the recurring carrying-cost savings from hitting a tighter days-on-hand — the core of what a rolling forecast unlocks."
        />
      </section>

      <section className="mx-auto max-w-6xl px-5 py-12">
        <Reveal>
          <SavingsCalculator />
        </Reveal>
      </section>

      <CtaBand
        title="Want the real number?"
        subtitle="The calculator is a back-of-envelope estimate. A scoped model uses your actuals, lead times, and ABC mix — that's Stages 1 & 2."
        primaryLabel="Start an Inquiry"
        secondaryLabel="See the service model"
        secondaryHref="/services"
      />
    </>
  );
}
