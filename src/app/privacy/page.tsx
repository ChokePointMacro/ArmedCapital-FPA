import type { Metadata } from "next";
import { SectionHeading } from "@/components/SectionHeading";
import { SITE } from "@/lib/content";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "How Armed Capital collects, uses, and protects the information you share through this site.",
  alternates: { canonical: "/privacy" },
  robots: { index: true, follow: true },
};

const UPDATED = "June 2026"; // TODO(client): bump when policy is revised.

export default function PrivacyPage() {
  return (
    <section className="mx-auto max-w-3xl px-5 pt-16 sm:pt-20">
      <SectionHeading level={1} kicker="// legal" title="Privacy Policy" />
      <p className="mt-4 font-mono text-xs text-muted">Last updated: {UPDATED}</p>

      <div className="prose-legal mt-10 space-y-8 text-sm leading-relaxed text-muted">
        <div className="rounded-lg border border-dashed border-accent/40 bg-accent/5 p-4 font-mono text-xs text-fg/80">
          {"// "}TODO(client): replace bracketed items with your legal entity
          name, registered address, and governing jurisdiction, and have counsel
          review before relying on this document.
        </div>

        <Block title="Who we are">
          {SITE.name} (&quot;we&quot;, &quot;us&quot;) provides FP&amp;A and
          demand-forecasting consulting. This policy explains how we handle
          information collected through {SITE.url}. Contact:{" "}
          <a href={`mailto:${SITE.email}`} className="text-cyan hover:underline">
            {SITE.email}
          </a>{" "}
          [legal entity: ___, registered at ___].
        </Block>

        <Block title="What we collect">
          <ul className="list-disc space-y-1 pl-5">
            <li>
              Information you submit through our inquiry form: name, email,
              company, revenue range, platforms used, SKU count, and your
              message.
            </li>
            <li>
              Privacy-friendly product analytics (page views and interactions)
              via PostHog — only after you accept analytics cookies.
            </li>
            <li>
              Standard server logs (e.g., IP address, user agent) retained by our
              hosting provider, Vercel, for security and reliability.
            </li>
          </ul>
        </Block>

        <Block title="How we use it">
          We use inquiry data to respond to you, scope potential engagements, and
          maintain our records. Analytics help us understand and improve the
          site. We do not sell your personal information.
        </Block>

        <Block title="Where it's stored">
          Inquiries are stored in Supabase (Postgres) with row-level security so
          submissions are write-only from the website. Data is encrypted in
          transit and at rest by our infrastructure providers. See also our{" "}
          security practices on the relevant page.
        </Block>

        <Block title="Cookies & analytics">
          Essential cookies keep the site working. Non-essential analytics
          cookies load only after you click &quot;Accept&quot; on the cookie
          banner; you can decline at any time. We honor your browser&apos;s
          reduced-motion preference for animations.
        </Block>

        <Block title="Your choices">
          You may request access to, correction of, or deletion of the
          information you submitted by emailing{" "}
          <a href={`mailto:${SITE.email}`} className="text-cyan hover:underline">
            {SITE.email}
          </a>
          . Depending on your location, you may have additional rights under laws
          such as the GDPR or CCPA [confirm applicability with counsel].
        </Block>

        <Block title="Changes">
          We may update this policy; material changes will be reflected by the
          &quot;Last updated&quot; date above.
        </Block>
      </div>
    </section>
  );
}

function Block({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <h2 className="font-mono text-base font-semibold text-fg">{title}</h2>
      <div>{children}</div>
    </div>
  );
}
