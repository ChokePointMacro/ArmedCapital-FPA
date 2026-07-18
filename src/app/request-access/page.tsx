import type { Metadata } from "next";
import { SectionHeading } from "@/components/SectionHeading";
import { RequestAccessForm } from "@/components/portal/RequestAccessForm";

export const metadata: Metadata = {
  title: "Request Portal Access",
  description:
    "Request access to your Armed Capital client workspace — your live inventory, purchase orders and lead times.",
  alternates: { canonical: "/request-access" },
};

export default function RequestAccessPage() {
  return (
    <section className="mx-auto max-w-2xl px-5 pt-20 pb-24 sm:pt-24">
      <SectionHeading
        kicker="// client workspace"
        title="Request access"
        subtitle="The client portal shows your own numbers — inventory position, PO pipeline and lead times, updated as we run your model. Access is granted per company."
      />
      <div className="mt-8">
        <RequestAccessForm />
      </div>
    </section>
  );
}
