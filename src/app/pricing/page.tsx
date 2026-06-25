import type { Metadata } from "next";
import { Check, Wrench, RefreshCw, Boxes } from "lucide-react";
import { SectionHeading } from "@/components/SectionHeading";
import { PricingEstimator } from "@/components/PricingEstimator";
import { CtaBand } from "@/components/CtaBand";
import { Reveal } from "@/components/Reveal";

export const metadata: Metadata = {
  title: "Pricing & Packages",
  description:
    "How Armed Capital engagements are priced: a one-time Stage 1+2 build, recurring Stage 3 maintenance, and ad-hoc Stage 4 projects. Pricing scales with the size of your business.",
  alternates: { canonical: "/pricing" },
};

const TIERS = [
  {
    icon: Wrench,
    name: "Build",
    stages: "Stages 1 + 2",
    cadence: "one-time engagement",
    tagline: "Stand up the foundation and the forecast.",
    points: [
      "Secure data access, aggregation, cleaning & structure",
      "Historical baseline model",
      "12-month rolling forecast with order recommendations",
      "ABC classifications + target days-on-hand KPIs",
    ],
    tone: "accent",
  },
  {
    icon: RefreshCw,
    name: "Maintenance",
    stages: "Stage 3",
    cadence: "monthly recurring",
    tagline: "Keep the model living and current.",
    points: [
      "Monthly executive reports & analysis",
      "Roll-forward forecast every month",
      "PO adjustments based on the latest actuals",
      "Ongoing KPI tracking",
    ],
    tone: "cyan",
    featured: true,
  },
  {
    icon: Boxes,
    name: "Ad-Hoc",
    stages: "Stage 4",
    cadence: "project-based",
    tagline: "On-demand modeling for big decisions.",
    points: [
      "Product-launch forecasts",
      "Manufacturing & cost-reduction analysis",
      "Supply-chain reorganization",
      "Vertical-integration & capacity cost-benefit",
    ],
    tone: "violet",
  },
];

const toneText: Record<string, string> = {
  accent: "text-accent",
  cyan: "text-cyan",
  violet: "text-violet",
};

export default function PricingPage() {
  return (
    <>
      <section className="mx-auto max-w-6xl px-5 pt-16 sm:pt-20">
        <SectionHeading
          kicker="// f09 · pricing"
          title="Pricing that scales with your size"
          subtitle="We don't publish fixed numbers — engagements are scoped to your revenue, SKU count, and data complexity. The structure, though, is always the same three pieces."
        />
      </section>

      {/* Tiers */}
      <section className="mx-auto max-w-6xl px-5 py-12">
        <div className="grid gap-5 md:grid-cols-3">
          {TIERS.map((t, i) => (
            <Reveal key={t.name} delay={i * 0.08} className="h-full">
              <article
                className={`glass glow-hover flex h-full flex-col gap-4 rounded-xl p-6 ${
                  t.featured ? "border-accent/40" : ""
                }`}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`inline-flex h-10 w-10 items-center justify-center rounded-lg border border-border-hair bg-bg/60 ${
                      toneText[t.tone]
                    }`}
                  >
                    <t.icon className="h-5 w-5" aria-hidden />
                  </span>
                  {t.featured && (
                    <span className="rounded-full border border-accent/40 bg-accent/10 px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-wider text-accent">
                      recurring base
                    </span>
                  )}
                </div>
                <div>
                  <h3 className="font-mono text-lg font-semibold text-fg">
                    {t.name}
                  </h3>
                  <div className="mt-0.5 font-mono text-xs text-muted">
                    {t.stages} · {t.cadence}
                  </div>
                </div>
                <p className="text-sm text-muted">{t.tagline}</p>
                <ul className="mt-auto flex flex-col gap-2 pt-2">
                  {t.points.map((p) => (
                    <li key={p} className="flex gap-2 text-sm text-fg/90">
                      <Check
                        className={`mt-0.5 h-4 w-4 shrink-0 ${toneText[t.tone]}`}
                        aria-hidden
                      />
                      <span>{p}</span>
                    </li>
                  ))}
                </ul>
              </article>
            </Reveal>
          ))}
        </div>

        {/* size banding */}
        <Reveal className="mt-8">
          <div className="glass rounded-xl p-6">
            <div className="font-mono text-xs uppercase tracking-wider text-muted">
              Scales with your size
            </div>
            <div className="mt-4 flex items-center gap-2">
              {["Startup", "$1–10M", "$10–200M", "$200–500M"].map((b, i) => (
                <div key={b} className="flex flex-1 flex-col items-center gap-2">
                  <div
                    className="h-2 w-full rounded-full"
                    style={{
                      background: `color-mix(in srgb, var(--color-accent) ${
                        25 + i * 22
                      }%, var(--color-border-hair))`,
                    }}
                  />
                  <span className="font-mono text-[11px] text-muted">{b}</span>
                </div>
              ))}
            </div>
            <p className="mt-4 font-mono text-xs leading-relaxed text-fg/80">
              <span className="text-accent">{"// "}</span>
              Smaller businesses get scaled pricing — the $10M–$500M band is the
              general sweet spot, not a hard wall.{" "}
              {/* TODO(client): add concrete pricing bands here when ready. */}
              <span className="text-muted">
                Exact figures provided during scoping.
              </span>
            </p>
          </div>
        </Reveal>
      </section>

      {/* Estimator */}
      <section className="mx-auto max-w-3xl px-5 py-12">
        <SectionHeading
          align="center"
          kicker="// estimator"
          title="Where do you land?"
          subtitle="A rough read on your size band and the right starting point. No commitment — just orientation."
          className="mb-8"
        />
        <Reveal>
          <PricingEstimator />
        </Reveal>
      </section>

      <CtaBand
        title="Let's scope your engagement."
        subtitle="Tell us your revenue, SKU count, and platforms — we'll come back with a right-sized plan."
        secondaryLabel="Run the savings calculator"
        secondaryHref="/calculator"
      />
    </>
  );
}
