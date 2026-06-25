import { Check } from "lucide-react";
import type { Stage } from "@/lib/content";
import { Reveal } from "@/components/Reveal";

export function StageCard({ stage, index }: { stage: Stage; index: number }) {
  return (
    <Reveal delay={index * 0.08} className="h-full">
      <article className="glass glow-hover flex h-full flex-col gap-4 rounded-xl p-6">
        <header className="flex items-baseline justify-between gap-3 border-b border-border-hair pb-4">
          <span className="font-mono text-sm text-accent">
            {stage.id}
            <span className="text-muted"> //</span>
          </span>
          <span className="rounded-full border border-border-hair px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-wider text-violet">
            {stage.cadence}
          </span>
        </header>

        <h3 className="font-mono text-lg font-semibold leading-snug text-fg">
          {stage.title}
        </h3>

        <p className="text-sm leading-relaxed text-muted">{stage.summary}</p>

        <ul className="mt-auto flex flex-col gap-2.5 pt-2">
          {stage.bullets.map((b) => (
            <li key={b} className="flex gap-2.5 text-sm text-fg/90">
              <Check
                className="mt-0.5 h-4 w-4 shrink-0 text-accent"
                aria-hidden
              />
              <span>{b}</span>
            </li>
          ))}
        </ul>
      </article>
    </Reveal>
  );
}
