import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Rss } from "lucide-react";
import { SectionHeading } from "@/components/SectionHeading";
import { Reveal } from "@/components/Reveal";
import { getAllPostMeta } from "@/lib/posts";

export const metadata: Metadata = {
  title: "Insights",
  description:
    "Notes on FP&A, demand forecasting, ABC analysis, days-on-hand, and supply-chain risk for physical-product companies.",
  alternates: { canonical: "/insights" },
};

export default function InsightsPage() {
  const posts = getAllPostMeta();

  return (
    <section className="mx-auto max-w-4xl px-5 pt-16 sm:pt-20">
      <div className="flex items-start justify-between gap-4">
        <SectionHeading level={1}
          kicker="// f11 · insights"
          title="Field notes on forecasting & inventory"
          subtitle="Practical writing on rolling forecasts, ABC analysis, days-on-hand, lead-time buffers, and country-sourcing risk."
        />
        <a
          href="/insights/rss.xml"
          className="mt-2 hidden shrink-0 items-center gap-1.5 font-mono text-xs text-muted hover:text-accent sm:inline-flex"
        >
          <Rss className="h-3.5 w-3.5" /> RSS
        </a>
      </div>

      <div className="mt-10 flex flex-col gap-4 pb-8">
        {posts.length === 0 && (
          <div className="rounded-xl border-2 border-dashed border-border-hair p-8 text-center font-mono text-sm text-muted">
            No posts yet — drop an .mdx file in{" "}
            <code className="text-fg/80">content/insights/</code>.
          </div>
        )}
        {posts.map((p, i) => (
          <Reveal key={p.slug} delay={i * 0.05}>
            <Link
              href={`/insights/${p.slug}`}
              className="glass glow-hover block rounded-xl p-6"
            >
              <div className="flex flex-wrap items-center gap-3 font-mono text-xs text-muted">
                <span className="text-accent">{p.category}</span>
                <span>·</span>
                <time dateTime={p.date}>
                  {new Date(p.date).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </time>
                <span>·</span>
                <span>{p.readingTime}</span>
              </div>
              <h2 className="mt-2 font-mono text-lg font-semibold text-fg">
                {p.title}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-muted">
                {p.excerpt}
              </p>
              <span className="mt-3 inline-flex items-center gap-2 font-mono text-sm text-accent">
                Read <ArrowRight className="h-4 w-4" />
              </span>
            </Link>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
