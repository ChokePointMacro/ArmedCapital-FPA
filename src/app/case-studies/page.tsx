import type { Metadata } from "next";
import { Quote } from "lucide-react";
import { SectionHeading } from "@/components/SectionHeading";
import { CtaBand } from "@/components/CtaBand";
import { Reveal } from "@/components/Reveal";
import { CASE_STUDIES, TESTIMONIALS } from "@/lib/caseStudies";
import { SITE } from "@/lib/content";

export const metadata: Metadata = {
  title: "Case Studies",
  description:
    "How Armed Capital turns messy inventory data into rolling forecasts and order intelligence — by stage, with quantified outcomes.",
  alternates: { canonical: "/case-studies" },
};

// f12 — Review structured data for testimonials.
function reviewsJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE.name,
    url: SITE.url,
    review: TESTIMONIALS.map((t) => ({
      "@type": "Review",
      reviewBody: t.quote,
      author: { "@type": "Person", name: `${t.author}, ${t.role}` },
    })),
  };
}

export default function CaseStudiesPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(reviewsJsonLd()) }}
      />

      <section className="mx-auto max-w-6xl px-5 pt-16 sm:pt-20">
        <SectionHeading
          kicker="// f12 · proof"
          title="Outcomes, by stage"
          subtitle="Structured the way we work: the challenge, the approach across our four stages, and the result. Numbers are filled in from real, approved engagements."
        />
        <Reveal className="mt-4">
          <p className="rounded-lg border border-dashed border-violet/40 bg-violet/5 px-4 py-3 font-mono text-xs text-fg/80">
            <span className="text-violet">{"// "}</span>
            Placeholder studies below — TODO(client): swap in approved names and
            quantified results.
          </p>
        </Reveal>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-12">
        <div className="flex flex-col gap-6">
          {CASE_STUDIES.map((cs, i) => (
            <Reveal key={cs.slug} delay={i * 0.06}>
              <article className="glass glow-hover rounded-xl p-6 sm:p-8">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border-hair pb-4">
                  <div>
                    <h3 className="font-mono text-lg font-semibold text-fg">
                      {cs.client}
                    </h3>
                    <div className="mt-0.5 font-mono text-xs text-muted">
                      {cs.industry}
                    </div>
                  </div>
                  {cs.placeholder && (
                    <span className="rounded-full border border-violet/40 px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-wider text-violet">
                      sample
                    </span>
                  )}
                </div>

                <div className="mt-5 grid gap-6 md:grid-cols-3">
                  <div>
                    <div className="font-mono text-xs uppercase tracking-wider text-cyan">
                      Challenge
                    </div>
                    <p className="mt-2 text-sm leading-relaxed text-muted">
                      {cs.challenge}
                    </p>
                  </div>
                  <div>
                    <div className="font-mono text-xs uppercase tracking-wider text-cyan">
                      Approach
                    </div>
                    <ul className="mt-2 flex flex-col gap-2">
                      {cs.approach.map((a) => (
                        <li key={a.stage} className="text-sm text-fg/90">
                          <span className="font-mono text-accent">
                            {a.stage}
                          </span>{" "}
                          <span className="text-muted">— {a.detail}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <div className="font-mono text-xs uppercase tracking-wider text-cyan">
                      Results
                    </div>
                    <div className="mt-2 flex flex-col gap-2">
                      {cs.results.map((r) => (
                        <div
                          key={r.metric}
                          className="flex items-baseline justify-between gap-2 border-b border-border-hair/60 pb-1.5"
                        >
                          <span className="text-xs text-muted">{r.metric}</span>
                          <span className="font-mono text-sm font-semibold text-accent">
                            {r.value}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="mx-auto max-w-6xl px-5 py-12">
        <SectionHeading kicker="// testimonials" title="In their words" />
        <div className="mt-8 grid gap-5 md:grid-cols-2">
          {TESTIMONIALS.map((t, i) => (
            <Reveal key={i} delay={i * 0.08}>
              <figure className="glass h-full rounded-xl p-6">
                <Quote className="h-6 w-6 text-accent" aria-hidden />
                <blockquote className="mt-3 text-sm leading-relaxed text-fg/90">
                  &ldquo;{t.quote}&rdquo;
                </blockquote>
                <figcaption className="mt-4 font-mono text-xs text-muted">
                  — {t.author}, {t.role}
                  {t.placeholder && (
                    <span className="ml-2 text-violet">[sample]</span>
                  )}
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
      </section>

      <CtaBand
        title="Your story next."
        subtitle="Let's build the model that becomes your case study."
      />
    </>
  );
}
