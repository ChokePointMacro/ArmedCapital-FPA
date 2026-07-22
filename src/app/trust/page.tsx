import type { Metadata } from "next";
import { ShieldCheck, Lock, Database, EyeOff, Clock, KeyRound } from "lucide-react";
import { SectionHeading } from "@/components/SectionHeading";
import { CtaBand } from "@/components/CtaBand";
import { Reveal } from "@/components/Reveal";

export const metadata: Metadata = {
  title: "Security & Trust",
  description:
    "How Armed Capital protects your financial and inventory data: encryption in transit and at rest, least-privilege access, and clear data handling.",
  alternates: { canonical: "/trust" },
};

const PILLARS = [
  {
    icon: Lock,
    title: "Encryption in transit & at rest",
    body: "All traffic is served over HTTPS/TLS. Data stored in our database and file storage (Supabase / Postgres) is encrypted at rest by the platform.",
  },
  {
    icon: Database,
    title: "Write-only intake",
    body: "The public inquiry and lead forms can only insert rows — enforced by row-level security. The website's anonymous key cannot read back any submissions.",
  },
  {
    icon: KeyRound,
    title: "Least-privilege access",
    body: "Service-role credentials never touch the browser. Access to client data is limited to the people working your engagement.",
  },
  {
    icon: EyeOff,
    title: "Confidentiality",
    body: "Your data is used only to deliver your engagement. We don't sell it, and we don't share it outside the team working with you.",
  },
  {
    icon: Clock,
    title: "Retention",
    body: "Inquiry and lead records are retained while we evaluate and serve the relationship, and removed on request.",
  },
  {
    icon: ShieldCheck,
    title: "Data handling",
    body: "We work from exports you control, structure them for analysis, and document what's modeled and how — so there's never a black box.",
  },
];

export default function TrustPage() {
  return (
    <>
      <section className="mx-auto max-w-6xl px-5 pt-16 sm:pt-20">
        <SectionHeading level={1}
          kicker="// f22 · security & trust"
          title="We handle your numbers like they're ours"
          subtitle="You're trusting us with financial and inventory data. Here's how we protect it, in plain terms."
        />
      </section>

      <section className="mx-auto max-w-6xl px-5 py-12">
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {PILLARS.map((p, i) => (
            <Reveal key={p.title} delay={i * 0.05} className="h-full">
              <article className="glass glow-hover flex h-full flex-col gap-3 rounded-xl p-6">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-border-hair bg-bg/60 text-accent">
                  <p.icon className="h-5 w-5" aria-hidden />
                </span>
                <h3 className="font-mono text-base font-semibold text-fg">
                  {p.title}
                </h3>
                <p className="text-sm leading-relaxed text-muted">{p.body}</p>
              </article>
            </Reveal>
          ))}
        </div>
      </section>

      <CtaBand
        title="Questions about security?"
        subtitle="Ask us anything about how your data is handled before you share a thing."
        secondaryLabel="Read the privacy policy"
        secondaryHref="/privacy"
      />
    </>
  );
}
