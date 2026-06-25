import { Reveal } from "@/components/Reveal";

type FeatureCardProps = {
  index: number;
  featureKey: string;
  title: string;
  desc: string;
};

/**
 * "Code-style data card" — renders a feature like a syntax-highlighted
 * object literal, per the design brief.
 */
export function FeatureCard({
  index,
  featureKey,
  title,
  desc,
}: FeatureCardProps) {
  return (
    <Reveal delay={index * 0.06} className="h-full">
      <article className="glass glow-hover h-full rounded-xl p-5 font-mono text-sm">
        <div className="text-muted">
          <span className="text-violet">const</span>{" "}
          <span className="text-cyan">{featureKey}</span>{" "}
          <span className="text-muted">= {"{"}</span>
        </div>
        <div className="mt-2 space-y-1 pl-4">
          <div>
            <span className="text-accent">title</span>
            <span className="text-muted">: </span>
            <span className="text-fg">&quot;{title}&quot;</span>
            <span className="text-muted">,</span>
          </div>
          <div className="flex flex-wrap">
            <span className="text-accent">detail</span>
            <span className="text-muted">: </span>
            <span className="text-muted">&quot;</span>
            <span className="text-fg/80">{desc}</span>
            <span className="text-muted">&quot;,</span>
          </div>
        </div>
        <div className="mt-2 text-muted">{"}"}</div>
      </article>
    </Reveal>
  );
}
