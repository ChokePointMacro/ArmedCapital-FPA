"use client";

import { useEffect, useRef, useState } from "react";
import {
  useInView,
  useReducedMotion,
  animate,
} from "framer-motion";

type KpiCounterProps = {
  value: number;
  prefix?: string;
  suffix?: string;
  label: string;
};

function format(n: number) {
  return Math.round(n).toLocaleString("en-US");
}

export function KpiCounter({ value, prefix = "", suffix = "", label }: KpiCounterProps) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const reduce = useReducedMotion();
  const [display, setDisplay] = useState(reduce ? value : 0);

  useEffect(() => {
    if (reduce || !inView) return;
    const controls = animate(0, value, {
      duration: 1.4,
      ease: [0.17, 0.67, 0.3, 0.98],
      onUpdate: (v) => setDisplay(v),
    });
    return () => controls.stop();
  }, [inView, value, reduce]);

  return (
    <div
      ref={ref}
      className="glass glow-hover rounded-lg px-5 py-6 text-center"
    >
      <div className="font-mono text-3xl font-bold tracking-tight text-accent sm:text-4xl">
        {prefix}
        {format(display)}
        {suffix}
      </div>
      <div className="mt-2 text-xs uppercase tracking-wider text-muted">
        {label}
      </div>
    </div>
  );
}
