"use client";

import { motion, useReducedMotion } from "framer-motion";

// A recurring brand motif: a 12-month roll-forward line chart.
// Actuals (solid, to the left) hand off to forecast (dashed, to the right).
const MONTHS = 12;
const W = 720;
const H = 240;
const PAD = 28;

// Deterministic-ish series so the curve reads as a real forecast.
const ACTUALS = [38, 42, 40, 47, 52, 49, 58];
const FORECAST = [58, 63, 61, 69, 74, 78];

function points(values: number[], startIdx: number) {
  const max = 90;
  const stepX = (W - PAD * 2) / (MONTHS - 1);
  return values.map((v, i) => {
    const x = PAD + (startIdx + i) * stepX;
    const y = H - PAD - (v / max) * (H - PAD * 2);
    return [x, y] as const;
  });
}

function toPath(pts: ReadonlyArray<readonly [number, number]>) {
  return pts
    .map(([x, y], i) => `${i === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`)
    .join(" ");
}

export function RollingChart({ className = "" }: { className?: string }) {
  const reduce = useReducedMotion();
  const actualPts = points(ACTUALS, 0);
  const forecastPts = points(FORECAST, ACTUALS.length - 1);
  const handoff = actualPts[actualPts.length - 1];

  return (
    <div
      className={`glass rounded-xl p-4 ${className}`}
      role="img"
      aria-label="A 12-month rolling forecast chart: solid actuals handing off to a dashed forward forecast."
    >
      <div className="mb-3 flex items-center justify-between font-mono text-xs text-muted">
        <span className="text-cyan">units_by_month()</span>
        <span>
          <span className="text-accent">●</span> actuals{"  "}
          <span className="text-violet">┄</span> forecast
        </span>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
        {/* gridlines */}
        {Array.from({ length: 4 }).map((_, i) => {
          const y = PAD + (i * (H - PAD * 2)) / 3;
          return (
            <line
              key={i}
              x1={PAD}
              x2={W - PAD}
              y1={y}
              y2={y}
              stroke="var(--color-border-hair)"
              strokeWidth={1}
            />
          );
        })}

        {/* area fill under actuals */}
        <motion.path
          d={`${toPath(actualPts)} L ${handoff[0]} ${H - PAD} L ${actualPts[0][0]} ${
            H - PAD
          } Z`}
          fill="url(#fc-fill)"
          initial={reduce ? false : { opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1, delay: 0.5 }}
        />

        {/* actuals line */}
        <motion.path
          d={toPath(actualPts)}
          fill="none"
          stroke="var(--color-accent)"
          strokeWidth={2.5}
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={reduce ? false : { pathLength: 0 }}
          whileInView={{ pathLength: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1.1, ease: "easeInOut" }}
        />

        {/* forecast line (dashed) */}
        <motion.path
          d={toPath(forecastPts)}
          fill="none"
          stroke="var(--color-violet)"
          strokeWidth={2.5}
          strokeDasharray="6 6"
          strokeLinecap="round"
          initial={reduce ? false : { pathLength: 0 }}
          whileInView={{ pathLength: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1.1, delay: 1, ease: "easeInOut" }}
        />

        {/* handoff marker */}
        <motion.circle
          cx={handoff[0]}
          cy={handoff[1]}
          r={4.5}
          fill="var(--color-bg)"
          stroke="var(--color-accent)"
          strokeWidth={2.5}
          initial={reduce ? false : { scale: 0 }}
          whileInView={{ scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.3, delay: 1.05 }}
        />

        <defs>
          <linearGradient id="fc-fill" x1="0" y1="0" x2="0" y2="1">
            <stop
              offset="0%"
              stopColor="var(--color-accent)"
              stopOpacity={0.22}
            />
            <stop
              offset="100%"
              stopColor="var(--color-accent)"
              stopOpacity={0}
            />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}
