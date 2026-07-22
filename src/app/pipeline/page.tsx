import type { Metadata } from "next";
import { SectionHeading } from "@/components/SectionHeading";
import { PipelineBoard } from "@/components/PipelineBoard";
import { CtaBand } from "@/components/CtaBand";
import { Reveal } from "@/components/Reveal";

export const metadata: Metadata = {
  title: "Pipeline Tracker",
  description:
    "Live procurement pipeline: inventory by SKU, in-transit shipments, confirmed POs on order, requisitions awaiting approval, and a stage-by-stage progress tracker from PO issue to receipt with lead time by SKU.",
  alternates: { canonical: "/pipeline" },
};

export default function PipelinePage() {
  return (
    <>
      <section className="mx-auto max-w-6xl px-5 pt-16 sm:pt-20">
        <SectionHeading level={1}
          kicker="// f26 · order-to-receipt visibility"
          title="Where every unit is, right now"
          subtitle="The model doesn't stop at a forecast. Each requisition it proposes is tracked through approval, PO issue, production, transit and receipt — so you can see what's covered, what's slipping, and exactly how much lead time each SKU really needs."
        />
      </section>

      <section className="mx-auto max-w-6xl px-5 py-10">
        <Reveal>
          <PipelineBoard />
        </Reveal>
      </section>

      <CtaBand
        title="Know what's landing, and when."
        subtitle="Your SKUs, your suppliers, your lead times — tracked from requisition to receipt."
        secondaryLabel="See the reports"
        secondaryHref="/reports"
      />
    </>
  );
}
