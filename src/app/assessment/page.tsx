import type { Metadata } from "next";
import { SectionHeading } from "@/components/SectionHeading";
import { Assessment } from "@/components/Assessment";
import { Reveal } from "@/components/Reveal";

export const metadata: Metadata = {
  title: "Forecast-Readiness Assessment",
  description:
    "Answer ten quick questions to see how forecast-ready your data is — and the right first step for your business.",
  alternates: { canonical: "/assessment" },
};

export default function AssessmentPage() {
  return (
    <section className="mx-auto max-w-2xl px-5 pb-20 pt-16 sm:pt-20">
      <SectionHeading
        align="center"
        kicker="// f08 · readiness check"
        title="Is your data forecast-ready?"
        subtitle="Ten quick questions, about a minute. You'll get a readiness score and the right next step — whether that's building a forecast now or starting with a Stage 1 data pass."
        className="mb-10"
      />
      <Reveal>
        <Assessment />
      </Reveal>
    </section>
  );
}
