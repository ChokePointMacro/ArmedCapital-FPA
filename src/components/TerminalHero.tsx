"use client";

import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";

type Line = {
  /** Rendered with a leading `$ ` prompt when true. */
  prompt?: boolean;
  text: string;
  tone?: "default" | "accent" | "cyan" | "muted" | "violet";
};

// Faux session: an analyst rolling a 12-month forecast and getting order recs.
const SCRIPT: Line[] = [
  { prompt: true, text: "armed-capital --forecast --rolling 12mo", tone: "accent" },
  { text: "→ loading actuals ........... 1,847 SKUs ingested", tone: "muted" },
  { text: "→ cleaning + normalizing .... done", tone: "muted" },
  { text: "→ rolling forecast .......... 12 months forward", tone: "muted" },
  { text: "", tone: "default" },
  { text: "ABC   SKU            on_hand   days   reorder", tone: "cyan" },
  { text: "A     HW-CORE-001        420     22    +1,800", tone: "default" },
  { text: "A     HW-CORE-014        180     11    +2,400", tone: "default" },
  { text: "B     ACC-STRAP-203    1,260     58       hold", tone: "default" },
  { text: "C     PKG-BOX-09         940     74       hold", tone: "default" },
  { text: "", tone: "default" },
  { text: "✓ 3 reorders flagged · lead-time + origin applied", tone: "accent" },
  { text: "✓ next roll-forward scheduled: +30d", tone: "violet" },
];

const TONE: Record<NonNullable<Line["tone"]>, string> = {
  default: "text-fg/90",
  accent: "text-accent",
  cyan: "text-cyan",
  muted: "text-muted",
  violet: "text-violet",
};

export function TerminalHero() {
  const reduce = useReducedMotion();
  const [done, setDone] = useState<number>(reduce ? SCRIPT.length : 0);
  const [typed, setTyped] = useState<string>("");
  const lineIdx = useRef(0);
  const charIdx = useRef(0);

  useEffect(() => {
    if (reduce) return;
    let timer: ReturnType<typeof setTimeout>;

    const tick = () => {
      const i = lineIdx.current;
      if (i >= SCRIPT.length) return;
      const full = SCRIPT[i].text;

      if (charIdx.current < full.length) {
        charIdx.current += 1;
        setTyped(full.slice(0, charIdx.current));
        // Prompt lines type slower for that "typed by a human" feel.
        timer = setTimeout(tick, SCRIPT[i].prompt ? 38 : 9);
      } else {
        setDone(i + 1);
        setTyped("");
        lineIdx.current += 1;
        charIdx.current = 0;
        // Pause longer after the command line and blank lines.
        const pause = SCRIPT[i].prompt ? 360 : full === "" ? 120 : 60;
        timer = setTimeout(tick, pause);
      }
    };

    timer = setTimeout(tick, 500);
    return () => clearTimeout(timer);
  }, [reduce]);

  const typingLine = !reduce && lineIdx.current < SCRIPT.length;

  return (
    <div className="glass glow-hover overflow-hidden rounded-xl shadow-2xl shadow-black/40">
      {/* title bar */}
      <div className="flex items-center gap-2 border-b border-border-hair bg-bg/60 px-4 py-3">
        <span className="h-3 w-3 rounded-full bg-[#ff5f56]" />
        <span className="h-3 w-3 rounded-full bg-[#ffbd2e]" />
        <span className="h-3 w-3 rounded-full bg-[#27c93f]" />
        <span className="ml-3 font-mono text-xs text-muted">
          armed_capital — forecast.sh
        </span>
      </div>

      {/* body */}
      <div className="min-h-[320px] px-5 py-4 font-mono text-[13px] leading-relaxed sm:text-sm">
        {SCRIPT.slice(0, done).map((line, i) => (
          <pre
            key={i}
            className={`whitespace-pre-wrap break-words ${
              TONE[line.tone ?? "default"]
            }`}
          >
            {line.prompt ? <span className="text-accent">$ </span> : null}
            {line.text || " "}
          </pre>
        ))}

        {typingLine && (
          <pre
            className={`whitespace-pre-wrap break-words ${
              TONE[SCRIPT[lineIdx.current]?.tone ?? "default"]
            }`}
          >
            {SCRIPT[lineIdx.current]?.prompt ? (
              <span className="text-accent">$ </span>
            ) : null}
            {typed}
            <span className="caret" aria-hidden />
          </pre>
        )}
      </div>
    </div>
  );
}
