import type { Metadata } from "next";
import { SectionHeading } from "@/components/SectionHeading";
import { ExecDashboard } from "@/components/ExecDashboard";
import { CtaBand } from "@/components/CtaBand";
import { Reveal } from "@/components/Reveal";

export const metadata: Metadata = {
  title: "Executive Dashboard",
  description:
    "The whole business on one page: demand, supply and cash. Inventory, in-transit and on-order value mapped against forward demand, plus margin bridge, cash conversion cycle and flow-through by SKU.",
  alternates: { canonical: "/dashboard" },
};

export default function DashboardPage() {
  return (
    <>
      <section className="mx-auto max-w-6xl px-5 pt-16 sm:pt-20">
        <SectionHeading level={1}
          kicker="// f27 · demand → supply → cash"
          title="The whole business on one page"
          subtitle="Where the money is, what it's tied up in, and when it comes back. Every figure here is computed from the same dataset behind the Reports and Pipeline pages — so the exec view and the operating detail always agree."
        />
      </section>

      <section className="mx-auto max-w-6xl px-5 py-10">
        <Reveal>
          <ExecDashboard />
        </Reveal>
      </section>

      <CtaBand
        title="This, on your numbers."
        subtitle="One model connecting demand, inventory, purchasing and cash — updated every month."
        secondaryLabel="See the pipeline"
        secondaryHref="/pipeline"
      />
    </>
  );
}
