import type { Metadata } from "next";
import { StageCard } from "@/components/StageCard";
import { PlatformGrid } from "@/components/PlatformGrid";
import { SectionHeading } from "@/components/SectionHeading";
import { CtaBand } from "@/components/CtaBand";
import { Reveal } from "@/components/Reveal";
import { STAGES, ICP } from "@/lib/content";

export const metadata: Metadata = {
  title: "Services",
  description:
    "The Armed Capital four-stage service model: data structuring, a 12-month rolling forecast, monthly maintenance, and ad-hoc modeling — for physical-product companies under 2,000 SKUs.",
  alternates: { canonical: "/services" },
};

export default function ServicesPage() {
  return (
    <>
      <section className="mx-auto max-w-6xl px-5 pt-16 sm:pt-20">
        <SectionHeading level={1}
          kicker="05 / services"
          title="The four-stage service model"
          subtitle="This is the core of the offering. Stages are sequential, but Stage 3 is recurring (monthly) and Stage 4 is on-demand. Pricing scales with the size of the business — no fixed numbers until we scope your data."
        />
      </section>

      {/* Four-stage model */}
      <section className="mx-auto max-w-6xl px-5 py-12">
        <div className="grid gap-5 md:grid-cols-2">
          {STAGES.map((s, i) => (
            <StageCard key={s.id} stage={s} index={i} />
          ))}
        </div>
        <Reveal className="mt-6">
          <p className="rounded-lg border border-dashed border-violet/40 bg-violet/5 px-5 py-4 font-mono text-sm leading-relaxed text-fg/90">
            <span className="text-violet">{"// note: "}</span>
            Stage 3 is billed as a monthly maintenance fee; Stages 1, 2, and 4
            are project-based. Pricing scales with business size — smaller
            startups that can&apos;t yet justify an in-house analyst are welcome.
          </p>
        </Reveal>
      </section>

      {/* ICP */}
      <section id="icp" className="mx-auto max-w-6xl px-5 py-16 scroll-mt-24">
        <SectionHeading
          kicker="06 / ideal client profile"
          title="Who we're built for"
          subtitle="Smaller businesses are often easier to win than a $500M enterprise — the band below is a general range, not a hard wall."
        />
        <Reveal className="mt-10">
          <div className="glass overflow-hidden rounded-xl">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-border-hair font-mono text-xs uppercase tracking-wider text-muted">
                  <th className="px-5 py-3.5 font-medium">Criterion</th>
                  <th className="px-5 py-3.5 font-medium">Target</th>
                </tr>
              </thead>
              <tbody>
                {ICP.map((row) => (
                  <tr
                    key={row.criterion}
                    className="border-b border-border-hair/60 last:border-0"
                  >
                    <td className="px-5 py-4 align-top font-mono text-cyan">
                      {row.criterion}
                    </td>
                    <td className="px-5 py-4 align-top text-fg/90">
                      {row.target}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Reveal>
      </section>

      {/* Platforms */}
      <section className="mx-auto max-w-6xl px-5 py-16">
        <SectionHeading
          kicker="// compatibility"
          title="Native integrations — and a way in for everything else"
          subtitle="We have native experience on the platforms below. Any platform works as long as data can be exported."
        />
        <div className="mt-10">
          <PlatformGrid />
        </div>
      </section>

      <CtaBand
        title="Let's scope your model."
        subtitle="Tell us your platforms, SKU count, and the question you're trying to answer. We'll take it from there."
      />
    </>
  );
}
