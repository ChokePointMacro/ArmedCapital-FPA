import type { Metadata } from "next";
import { Mail, CalendarClock } from "lucide-react";
import { SectionHeading } from "@/components/SectionHeading";
import { InquiryForm } from "@/components/InquiryForm";
import { Reveal } from "@/components/Reveal";
import { SITE } from "@/lib/content";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Start an inquiry with Armed Capital — client, investor, or general. Tell us your platforms, SKU count, and the question you're trying to answer.",
};

export default function ContactPage() {
  return (
    <>
      <section className="mx-auto max-w-6xl px-5 pt-16 sm:pt-20">
        <SectionHeading
          kicker="// contact"
          title="Start an inquiry"
          subtitle="Client, investor, or general — pick a type, give us the essentials, and we'll be in touch. Submissions are stored securely and write-only."
        />
      </section>

      <section className="mx-auto max-w-6xl px-5 py-12">
        <div className="grid gap-8 lg:grid-cols-[1.4fr_1fr]">
          <Reveal>
            <InquiryForm variant="full" sourcePage="contact" />
          </Reveal>

          <div className="flex flex-col gap-4">
            <Reveal delay={0.05}>
              <div className="glass glow-hover rounded-xl p-6">
                <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-wider text-muted">
                  <Mail className="h-4 w-4 text-accent" aria-hidden />
                  Direct
                </div>
                {/* TODO(client): replace with the real inbound contact address. */}
                <a
                  href={`mailto:${SITE.email}`}
                  className="mt-3 block break-all font-mono text-sm text-fg transition-colors hover:text-accent"
                >
                  {SITE.email}
                </a>
                <p className="mt-2 text-xs text-muted">
                  Placeholder — client to confirm the real address.
                </p>
              </div>
            </Reveal>

            <Reveal delay={0.1}>
              <div className="glass rounded-xl p-6">
                <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-wider text-muted">
                  <CalendarClock className="h-4 w-4 text-cyan" aria-hidden />
                  Book a call
                </div>
                <p className="mt-3 text-sm text-muted">
                  Optional Calendly / booking link goes here once the client
                  provides it.
                </p>
                <div className="mt-4 rounded-lg border-2 border-dashed border-border-hair px-4 py-6 text-center font-mono text-xs text-muted">
                  TODO — embed booking widget
                </div>
              </div>
            </Reveal>

            <Reveal delay={0.15}>
              <div className="glass rounded-xl p-6 font-mono text-xs leading-relaxed text-muted">
                <span className="text-accent">{"// response time"}</span>
                <p className="mt-2 text-fg/80">
                  We typically reply within one business day.
                </p>
              </div>
            </Reveal>
          </div>
        </div>
      </section>
    </>
  );
}
