"use client";

import { useMemo, useState } from "react";

// f10 — interactive, sample-data demo: ABC Pareto + days-on-hand gauge.
// Clearly labeled sample data; no real client information.

const SKUS = [
  { sku: "A", units: 4200 },
  { sku: "B", units: 2600 },
  { sku: "C", units: 1500 },
  { sku: "D", units: 980 },
  { sku: "E", units: 640 },
  { sku: "F", units: 420 },
  { sku: "G", units: 300 },
  { sku: "H", units: 180 },
];

function classify() {
  const total = SKUS.reduce((s, r) => s + r.units, 0);
  let cum = 0;
  return SKUS.map((r) => {
    cum += r.units;
    const cumPct = cum / total;
    const cls = cumPct <= 0.7 ? "A" : cumPct <= 0.9 ? "B" : "C";
    return { ...r, cumPct, cls };
  });
}

const CLS_COLOR: Record<string, string> = {
  A: "var(--color-accent)",
  B: "var(--color-cyan)",
  C: "var(--color-violet)",
};

export function ForecastDemo() {
  const [target, setTarget] = useState(60);
  const rows = useMemo(classify, []);
  const maxUnits = Math.max(...rows.map((r) => r.units));

  // Gauge: how aggressive is the chosen target vs a 90-day baseline.
  const baseline = 90;
  const reduction = Math.max(0, (baseline - target) / baseline);
  const reorderFlags = rows.filter((r) => r.cls === "A").length + (target < 45 ? 2 : target < 70 ? 1 : 0);

  const W = 520;
  const H = 240;
  const PAD = 32;
  const barW = (W - PAD * 2) / rows.length;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-2 rounded-md border border-dashed border-violet/40 bg-violet/5 px-4 py-2 font-mono text-xs text-violet">
        {"// "}sample data — illustrative only
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.3fr_1fr]">
        {/* ABC Pareto */}
        <div className="glass rounded-xl p-5">
          <div className="mb-3 flex items-center justify-between font-mono text-xs text-muted">
            <span className="text-cyan">abc_pareto()</span>
            <span>
              <span className="text-accent">A</span>{" "}
              <span className="text-cyan">B</span>{" "}
              <span className="text-violet">C</span>
            </span>
          </div>
          <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
            {[0.25, 0.5, 0.75, 1].map((g) => (
              <line
                key={g}
                x1={PAD}
                x2={W - PAD}
                y1={PAD + (1 - g) * (H - PAD * 2)}
                y2={PAD + (1 - g) * (H - PAD * 2)}
                stroke="var(--color-border-hair)"
                strokeWidth={1}
              />
            ))}
            {rows.map((r, i) => {
              const h = (r.units / maxUnits) * (H - PAD * 2);
              return (
                <g key={r.sku}>
                  <rect
                    x={PAD + i * barW + 4}
                    y={H - PAD - h}
                    width={barW - 8}
                    height={h}
                    rx={2}
                    fill={CLS_COLOR[r.cls]}
                    opacity={0.85}
                  />
                  <text
                    x={PAD + i * barW + barW / 2}
                    y={H - PAD + 14}
                    textAnchor="middle"
                    fontSize="10"
                    fill="var(--color-muted)"
                    fontFamily="monospace"
                  >
                    {r.sku}
                  </text>
                </g>
              );
            })}
            {/* cumulative line */}
            <polyline
              fill="none"
              stroke="var(--color-fg)"
              strokeWidth={2}
              strokeDasharray="4 4"
              points={rows
                .map((r, i) => {
                  const x = PAD + i * barW + barW / 2;
                  const y = PAD + (1 - r.cumPct) * (H - PAD * 2);
                  return `${x},${y}`;
                })
                .join(" ")}
            />
          </svg>
          <p className="mt-2 font-mono text-[11px] text-muted">
            70% of volume in class A · the SKUs that earn the tightest planning.
          </p>
        </div>

        {/* Days-on-hand gauge + slider */}
        <div className="glass rounded-xl p-5">
          <div className="mb-3 font-mono text-xs text-cyan">days_on_hand()</div>
          <div className="flex flex-col items-center">
            <div className="relative flex h-36 w-36 items-center justify-center">
              <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90">
                <circle cx="60" cy="60" r="50" fill="none" stroke="var(--color-border-hair)" strokeWidth="12" />
                <circle
                  cx="60"
                  cy="60"
                  r="50"
                  fill="none"
                  stroke="var(--color-accent)"
                  strokeWidth="12"
                  strokeLinecap="round"
                  strokeDasharray={2 * Math.PI * 50}
                  strokeDashoffset={2 * Math.PI * 50 * (1 - Math.min(target, 120) / 120)}
                  style={{ transition: "stroke-dashoffset 0.3s ease" }}
                />
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className="font-mono text-3xl font-bold text-accent">
                  {target}
                </span>
                <span className="font-mono text-[10px] uppercase tracking-wider text-muted">
                  days target
                </span>
              </div>
            </div>

            <input
              type="range"
              min={20}
              max={120}
              value={target}
              onChange={(e) => setTarget(Number(e.target.value))}
              className="mt-5 w-full accent-[var(--color-accent)]"
              aria-label="Target days on hand"
            />

            <div className="mt-4 grid w-full grid-cols-2 gap-3">
              <div className="rounded-lg border border-border-hair bg-bg/40 p-3 text-center">
                <div className="font-mono text-lg font-semibold text-violet">
                  {Math.round(reduction * 100)}%
                </div>
                <div className="font-mono text-[10px] uppercase text-muted">
                  vs 90-day base
                </div>
              </div>
              <div className="rounded-lg border border-border-hair bg-bg/40 p-3 text-center">
                <div className="font-mono text-lg font-semibold text-accent">
                  {reorderFlags}
                </div>
                <div className="font-mono text-[10px] uppercase text-muted">
                  reorders flagged
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
