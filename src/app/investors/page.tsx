import type { Metadata } from "next";
import { TrendingUp, Layers, Repeat } from "lucide-react";
import { SectionHeading } from "@/components/SectionHeading";
import { InquiryForm } from "@/components/InquiryForm";
import { Reveal } from "@/components/Reveal";

export const metadata: Metadata = {
  title: "Investors",
  description:
    "The Armed Capital thesis: a large, underserved market of sub-$500M physical-product companies that need FP&A rigor but can't justify a full in-house team. Recurring maintenance revenue layered on project-based engagements.",
  alternates: { canonical: "/investors" },
};

const THESIS = [
  {
    icon: TrendingUp,
    title: "The opportunity",
    body: "A large, underserved market of sub-$500M physical-product companies that need FP&A rigor but can't justify a full in-house team.",
  },
  {
    icon: Layers,
    title: "The model",
    body: "Recurring monthly maintenance revenue (Stage 3) layered on project-based engagements (Stages 1, 2, 4) — a stable base plus upside.",
  },
  {
    icon: Repeat,
    title: "Scalability",
    body: "A repeatable four-stage process and native platform integrations make onboarding efficient and margins predictable.",
  },
];

export default function InvestorsPage() {
  return (
    <>
      <section className="mx-auto max-w-6xl px-5 pt-16 sm:pt-20">
        <SectionHeading
          kicker="// investors"
          title="Recurring revenue on a repeatable process"
          subtitle="Armed Capital pairs sticky monthly maintenance contracts with higher-ticket project work — in a market most FP&A firms ignore."
        />
      </section>

      <section className="mx-auto max-w-6xl px-5 py-12">
        <div className="grid gap-5 md:grid-cols-3">
          {THESIS.map((t, i) => (
            <Reveal key={t.title} delay={i * 0.08} className="h-full">
              <article className="glass glow-hover flex h-full flex-col gap-4 rounded-xl p-6">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-border-hair bg-bg/60 text-accent">
                  <t.icon className="h-5 w-5" aria-hidden />
                </span>
                <h3 className="font-mono text-lg font-semibold text-fg">
                  {t.title}
                </h3>
                <p className="text-sm leading-relaxed text-muted">{t.body}</p>
              </article>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Financials TODO */}
      <section className="mx-auto max-w-6xl px-5 py-12">
        <Reveal>
          <div className="rounded-xl border-2 border-dashed border-violet/40 bg-violet/5 p-8">
            <div className="font-mono text-xs uppercase tracking-[0.2em] text-violet">
              TODO — client to supply
            </div>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted">
              Financial specifics go here: traction, ARR / MRR, retention,
              margins, raise terms, and any unit economics you want to share.
              Replace this block in{" "}
              <code className="rounded bg-bg/60 px-1.5 py-0.5 font-mono text-fg/80">
                src/app/investors/page.tsx
              </code>
              .
            </p>
            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              {["MRR", "Net retention", "Gross margin"].map((m) => (
                <div
                  key={m}
                  className="rounded-lg border border-border-hair bg-bg/40 p-5 text-center"
                >
                  <div className="font-mono text-2xl font-bold text-muted">
                    —
                  </div>
                  <div className="mt-1 font-mono text-xs uppercase tracking-wider text-muted">
                    {m}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Reveal>
      </section>

      {/* Request investor materials */}
      <section className="mx-auto max-w-3xl px-5 py-16">
        <SectionHeading
          align="center"
          kicker="// request access"
          title="Request investor materials"
          subtitle="Tell us a little about your fund or interest and we'll follow up with the deck and data room."
          className="mb-10"
        />
        <Reveal>
          <InquiryForm
            variant="full"
            sourcePage="investors"
            defaultType="investor"
          />
        </Reveal>
      </section>
    </>
  );
}
