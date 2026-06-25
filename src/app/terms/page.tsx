import type { Metadata } from "next";
import { SectionHeading } from "@/components/SectionHeading";
import { SITE } from "@/lib/content";

export const metadata: Metadata = {
  title: "Terms of Service",
  description:
    "The terms governing your use of the Armed Capital website.",
  alternates: { canonical: "/terms" },
  robots: { index: true, follow: true },
};

const UPDATED = "June 2026"; // TODO(client): bump when terms are revised.

export default function TermsPage() {
  return (
    <section className="mx-auto max-w-3xl px-5 pt-16 sm:pt-20">
      <SectionHeading kicker="// legal" title="Terms of Service" />
      <p className="mt-4 font-mono text-xs text-muted">Last updated: {UPDATED}</p>

      <div className="mt-10 space-y-8 text-sm leading-relaxed text-muted">
        <div className="rounded-lg border border-dashed border-accent/40 bg-accent/5 p-4 font-mono text-xs text-fg/80">
          {"// "}TODO(client): replace bracketed items with your legal entity and
          governing jurisdiction, and have counsel review before publishing.
        </div>

        <Block title="Acceptance">
          By accessing {SITE.url} you agree to these terms. If you do not agree,
          please do not use the site.
        </Block>

        <Block title="Use of the site">
          This site is provided for informational purposes about {SITE.name}
          &apos;s services. You agree not to misuse it, attempt to disrupt it, or
          access non-public areas without authorization.
        </Block>

        <Block title="No professional advice">
          Content on this site is general information, not financial, investment,
          tax, or legal advice, and does not create a client relationship.
          Engagements are governed by a separate signed agreement.
        </Block>

        <Block title="Inquiries & communications">
          Submitting the inquiry form does not obligate either party. We may
          contact you in response. Do not submit confidential information through
          the form.
        </Block>

        <Block title="Intellectual property">
          The site, its content, and the {SITE.name} brand are owned by us and
          may not be copied or reused without permission.
        </Block>

        <Block title="Disclaimers & liability">
          The site is provided &quot;as is&quot; without warranties of any kind.
          To the maximum extent permitted by law, {SITE.name} is not liable for
          any indirect or consequential damages arising from use of the site
          [limitations subject to your governing jurisdiction: ___].
        </Block>

        <Block title="Contact">
          Questions about these terms?{" "}
          <a href={`mailto:${SITE.email}`} className="text-cyan hover:underline">
            {SITE.email}
          </a>
          .
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
