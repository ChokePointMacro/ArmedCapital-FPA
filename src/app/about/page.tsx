import type { Metadata } from "next";
import { Target, GitBranch, ShieldCheck } from "lucide-react";
import { SectionHeading } from "@/components/SectionHeading";
import { CtaBand } from "@/components/CtaBand";
import { Reveal } from "@/components/Reveal";

export const metadata: Metadata = {
  title: "About",
  description:
    "Armed Capital gives physical-product companies the financial-planning firepower of a full in-house FP&A team — without the headcount. Data-first, KPI-driven, transparent.",
};

const PILLARS = [
  {
    icon: Target,
    title: "Mission",
    body: "Give physical-product companies the financial-planning firepower of a full in-house FP&A team — without the headcount.",
  },
  {
    icon: GitBranch,
    title: "Approach",
    body: "Data-first, KPI-driven, and transparent. We don't hand you a black box; we build a model you understand.",
  },
  {
    icon: ShieldCheck,
    title: 'Why "Armed Capital"',
    body: "We arm your capital decisions with rigorous, forward-looking analysis.",
  },
];

export default function AboutPage() {
  return (
    <>
      <section className="mx-auto max-w-6xl px-5 pt-16 sm:pt-20">
        <SectionHeading
          kicker="// about us"
          title="The FP&A team you can't yet justify hiring"
          subtitle="Armed Capital exists for the founder who knows their gut isn't a forecasting model — and who'd rather arm their capital decisions with rigor than guess."
        />
      </section>

      <section className="mx-auto max-w-6xl px-5 py-12">
        <div className="grid gap-5 md:grid-cols-3">
          {PILLARS.map((p, i) => (
            <Reveal key={p.title} delay={i * 0.08} className="h-full">
              <article className="glass glow-hover flex h-full flex-col gap-4 rounded-xl p-6">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-border-hair bg-bg/60 text-accent">
                  <p.icon className="h-5 w-5" aria-hidden />
                </span>
                <h3 className="font-mono text-lg font-semibold text-fg">
                  {p.title}
                </h3>
                <p className="text-sm leading-relaxed text-muted">{p.body}</p>
              </article>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Philosophy strip */}
      <section className="mx-auto max-w-4xl px-5 py-12">
        <Reveal>
          <blockquote className="glass rounded-xl p-8 font-mono text-lg leading-relaxed text-fg/90 sm:text-xl">
            <span className="text-accent">{'"'}</span>
            We don&apos;t sell dashboards. We sell decisions you can defend —
            grounded in your own data, your lead times, and your sourcing
            reality.
            <span className="text-accent">{'"'}</span>
          </blockquote>
        </Reveal>
      </section>

      {/* TODO: founder bios — client to supply */}
      <section className="mx-auto max-w-6xl px-5 py-12">
        <SectionHeading kicker="// team" title="The people behind the models" />
        <Reveal className="mt-8">
          <div className="rounded-xl border-2 border-dashed border-accent/40 bg-accent/5 p-8">
            <div className="font-mono text-xs uppercase tracking-[0.2em] text-accent">
              TODO — client to supply
            </div>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted">
              Founder bio(s) and credentials go here: name, background, relevant
              FP&amp;A / supply-chain experience, and a headshot. Replace this
              block in{" "}
              <code className="rounded bg-bg/60 px-1.5 py-0.5 font-mono text-fg/80">
                src/app/about/page.tsx
              </code>
              .
            </p>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {[1, 2].map((n) => (
                <div
                  key={n}
                  className="flex items-center gap-4 rounded-lg border border-border-hair bg-bg/40 p-4"
                >
                  <div className="h-14 w-14 shrink-0 rounded-full border border-border-hair bg-surface" />
                  <div className="space-y-2">
                    <div className="h-3 w-28 rounded bg-border-hair" />
                    <div className="h-2.5 w-40 rounded bg-border-hair/60" />
                    <div className="h-2.5 w-32 rounded bg-border-hair/60" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Reveal>
      </section>

      <CtaBand
        title="Arm your capital decisions."
        subtitle="See the four-stage model, or tell us about your business and we'll scope it."
      />
    </>
  );
}
