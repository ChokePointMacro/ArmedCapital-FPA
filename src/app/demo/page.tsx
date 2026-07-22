import type { Metadata } from "next";
import { SectionHeading } from "@/components/SectionHeading";
import { ForecastDemo } from "@/components/ForecastDemo";
import { RollingChart } from "@/components/RollingChart";
import { CtaBand } from "@/components/CtaBand";
import { Reveal } from "@/components/Reveal";

export const metadata: Metadata = {
  title: "Live Demo",
  description:
    "A sample-data taste of the deliverable: a rolling 12-month forecast, an ABC Pareto chart, and a days-on-hand gauge you can nudge.",
  alternates: { canonical: "/demo" },
};

export default function DemoPage() {
  return (
    <>
      <section className="mx-auto max-w-6xl px-5 pt-16 sm:pt-20">
        <SectionHeading level={1}
          kicker="// f10 · show, don't tell"
          title="A live taste of the deliverable"
          subtitle="This is sample data, not your business — but it's the shape of what a finished model looks like: a rolling forecast, ABC-classified SKUs, and a days-on-hand target you can move."
        />
      </section>

      <section className="mx-auto max-w-6xl px-5 py-12">
        <Reveal className="mb-6">
          <RollingChart />
        </Reveal>
        <Reveal delay={0.05}>
          <ForecastDemo />
        </Reveal>
      </section>

      <CtaBand
        title="Now imagine it on your data."
        subtitle="Same engine, your actuals — lead times, country-sourcing, and ABC mix included."
        secondaryLabel="Estimate your savings"
        secondaryHref="/calculator"
      />
    </>
  );
}
