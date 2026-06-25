import { Plug } from "lucide-react";
import { PLATFORMS, COMPATIBILITY_STATEMENT } from "@/lib/content";
import { Reveal } from "@/components/Reveal";

export function PlatformGrid({ showStatement = true }: { showStatement?: boolean }) {
  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {PLATFORMS.map((name, i) => (
          <Reveal key={name} delay={i * 0.03}>
            <div className="glass glow-hover flex items-center gap-2.5 rounded-lg px-4 py-3">
              <Plug className="h-4 w-4 shrink-0 text-cyan" aria-hidden />
              <span className="font-mono text-sm text-fg/90">{name}</span>
            </div>
          </Reveal>
        ))}
      </div>

      {showStatement && (
        <Reveal>
          <p className="rounded-lg border border-dashed border-accent/40 bg-accent/5 px-5 py-4 font-mono text-sm leading-relaxed text-fg/90">
            <span className="text-accent">{"// "}</span>
            {COMPATIBILITY_STATEMENT}
          </p>
        </Reveal>
      )}
    </div>
  );
}
