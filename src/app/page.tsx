import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ButtonLink } from "@/components/Button";
import { TerminalHero } from "@/components/TerminalHero";
import { KpiCounter } from "@/components/KpiCounter";
import { RollingChart } from "@/components/RollingChart";
import { FeatureCard } from "@/components/FeatureCard";
import { StageCard } from "@/components/StageCard";
import { PlatformGrid } from "@/components/PlatformGrid";
import { InquiryForm } from "@/components/InquiryForm";
import { SectionHeading } from "@/components/SectionHeading";
import { CtaBand } from "@/components/CtaBand";
import { Reveal } from "@/components/Reveal";
import { FEATURES, STAGES, ICP, KPI_TICKERS } from "@/lib/content";
import type { Metadata } from "next";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

export default function Home() {
  return (
    <>
      {/* ---------- HERO ---------- */}
      <section className="mx-auto max-w-6xl px-5 pb-12 pt-12 sm:pt-20">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div className="flex flex-col gap-6">
            <Reveal>
              <span className="inline-flex items-center gap-2 rounded-full border border-border-hair bg-surface/60 px-3 py-1 font-mono text-xs text-muted">
                <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                FP&amp;A · demand forecasting · supply-chain modeling
              </span>
            </Reveal>
            <Reveal delay={0.05}>
              <h1 className="font-mono text-3xl font-bold leading-[1.1] tracking-tight text-fg sm:text-4xl md:text-5xl">
                FP&amp;A &amp; demand forecasting for companies that{" "}
                <span className="text-accent">make real things</span>.
              </h1>
            </Reveal>
            <Reveal delay={0.1}>
              <p className="max-w-xl text-base leading-relaxed text-muted">
                We turn your messy data into a rolling 12-month forecast with
                order recommendations, ABC classifications, and days-on-hand
                KPIs — so you stop guessing what to buy.
              </p>
            </Reveal>
            <Reveal delay={0.15}>
              <div className="flex flex-wrap items-center gap-3">
                <ButtonLink href="/contact" variant="primary">
                  Start an Inquiry
                </ButtonLink>
                <ButtonLink href="/services" variant="secondary">
                  See how it works <ArrowRight className="h-4 w-4" />
                </ButtonLink>
              </div>
            </Reveal>
          </div>

          <Reveal delay={0.2}>
            <TerminalHero />
          </Reveal>
        </div>

        {/* KPI tickers */}
        <div className="mt-16 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {KPI_TICKERS.map((k) => (
            <KpiCounter
              key={k.label}
              value={k.value}
              prefix={k.prefix}
              suffix={k.suffix}
              label={k.label}
            />
          ))}
        </div>
      </section>

      {/* ---------- COOL FEATURES ---------- */}
      <section className="mx-auto max-w-6xl px-5 py-20">
        <SectionHeading
          kicker="// what you get"
          title="Forecasting that pays for itself"
          subtitle="The capabilities founders and finance leaders ask us for — delivered as a living model, not a one-off slide deck."
        />
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f, i) => (
            <FeatureCard
              key={f.key}
              index={i}
              featureKey={f.key}
              title={f.title}
              desc={f.desc}
            />
          ))}
        </div>
      </section>

      {/* ---------- ROLLING FORECAST MOTIF ---------- */}
      <section className="mx-auto max-w-6xl px-5 py-16">
        <div className="grid items-center gap-10 lg:grid-cols-2">
          <SectionHeading
            kicker="// 12-month roll-forward"
            title="A forecast that moves with you"
            subtitle="Every month, the latest actuals roll in and the forecast rolls forward. Purchase orders get adjusted to what's actually happening — not what you assumed in January."
          />
          <Reveal delay={0.1}>
            <RollingChart />
          </Reveal>
        </div>
      </section>

      {/* ---------- FOUR-STAGE MODEL SUMMARY ---------- */}
      <section className="mx-auto max-w-6xl px-5 py-20">
        <SectionHeading
          kicker="// the engagement"
          title="A four-stage service model"
          subtitle="Sequential by design — Stage 3 recurs monthly and Stage 4 is on-demand."
        />
        <div className="mt-10 grid gap-5 md:grid-cols-2">
          {STAGES.map((s, i) => (
            <StageCard key={s.id} stage={s} index={i} />
          ))}
        </div>
        <Reveal className="mt-8">
          <Link
            href="/services"
            className="inline-flex items-center gap-2 font-mono text-sm text-accent hover:underline"
          >
            Explore the full model <ArrowRight className="h-4 w-4" />
          </Link>
        </Reveal>
      </section>

      {/* ---------- WHO WE SERVE ---------- */}
      <section className="mx-auto max-w-6xl px-5 py-16">
        <SectionHeading
          kicker="// who we serve"
          title="Built for sub-$500M physical-product companies"
          subtitle="The $10M–$500M band is the general sweet spot — not a hard wall. Smaller founders are explicitly welcome; pricing scales with the size of the business."
        />
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {ICP.slice(0, 3).map((row, i) => (
            <Reveal key={row.criterion} delay={i * 0.06}>
              <div className="glass glow-hover h-full rounded-xl p-5">
                <div className="font-mono text-xs uppercase tracking-wider text-cyan">
                  {row.criterion}
                </div>
                <div className="mt-2 text-sm text-fg/90">{row.target}</div>
              </div>
            </Reveal>
          ))}
        </div>
        <Reveal className="mt-6">
          <Link
            href="/services#icp"
            className="inline-flex items-center gap-2 font-mono text-sm text-accent hover:underline"
          >
            See the full client profile <ArrowRight className="h-4 w-4" />
          </Link>
        </Reveal>
      </section>

      {/* ---------- PLATFORMS ---------- */}
      <section className="mx-auto max-w-6xl px-5 py-16">
        <SectionHeading
          kicker="// integrations"
          title="Works natively with the tools you already use"
        />
        <div className="mt-10">
          <PlatformGrid />
        </div>
      </section>

      {/* ---------- INLINE INQUIRY ---------- */}
      <section id="inquire" className="mx-auto max-w-3xl px-5 py-20">
        <SectionHeading
          align="center"
          kicker="// sign up to inquire"
          title="Tell us what you're trying to figure out"
          subtitle="A few details is all we need to get started. Prefer the full form? Head to Contact."
          className="mb-10"
        />
        <Reveal>
          <InquiryForm variant="compact" sourcePage="home" />
        </Reveal>
      </section>

      {/* ---------- CLOSING CTA ---------- */}
      <CtaBand />
    </>
  );
}
