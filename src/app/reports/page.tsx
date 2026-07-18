import type { Metadata } from "next";
import { SectionHeading } from "@/components/SectionHeading";
import { ReportsBoard } from "@/components/ReportsBoard";
import { CtaBand } from "@/components/CtaBand";
import { Reveal } from "@/components/Reveal";

export const metadata: Metadata = {
  title: "Reports",
  description:
    "A sample-data look at the recurring deliverables: weekly run-out by SKU, forecast-to-actuals history, a forecast-driven monthly schedule, and the future PO pipeline by timing and value.",
  alternates: { canonical: "/reports" },
};

export default function ReportsPage() {
  return (
    <>
      <section className="mx-auto max-w-6xl px-5 pt-16 sm:pt-20">
        <SectionHeading
          kicker="// f25 · the recurring deliverables"
          title="The reports you get every month"
          subtitle="Sample data, not your business — but the exact shape of what lands in your inbox: run-out by SKU with inventory schedule, forecast-to-actuals history, a forecast-driven monthly build/buy schedule, and future POs by timing and value."
        />
      </section>

      <section className="mx-auto max-w-6xl px-5 py-10">
        <Reveal>
          <ReportsBoard />
        </Reveal>
      </section>

      <CtaBand
        title="Now imagine it on your data."
        subtitle="Same engine, your actuals — lead times, country-sourcing, ABC mix, and PO timing included."
        secondaryLabel="Estimate your savings"
        secondaryHref="/calculator"
      />
    </>
  );
}
