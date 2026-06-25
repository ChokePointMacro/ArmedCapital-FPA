"use client";

import { useMemo, useState } from "react";
import { Loader2, CheckCircle2, TrendingDown, AlertCircle } from "lucide-react";
import {
  computeSavings,
  usd,
  CALC_DEFAULTS,
  type CalcInputs,
} from "@/lib/calc";
import { submitCalculatorLead } from "@/app/actions/leads";
import { track } from "@/lib/analytics";

type Field = {
  key: keyof CalcInputs;
  label: string;
  min: number;
  max: number;
  step: number;
  fmt: (n: number) => string;
};

const FIELDS: Field[] = [
  { key: "annualRevenue", label: "Annual revenue", min: 1_000_000, max: 500_000_000, step: 1_000_000, fmt: usd },
  { key: "skuCount", label: "SKU count", min: 50, max: 2000, step: 25, fmt: (n) => n.toLocaleString("en-US") },
  { key: "currentDaysOnHand", label: "Current avg days-on-hand", min: 15, max: 180, step: 1, fmt: (n) => `${n} days` },
  { key: "targetDaysOnHand", label: "Target days-on-hand", min: 15, max: 180, step: 1, fmt: (n) => `${n} days` },
  { key: "carryingCostPct", label: "Annual carrying cost", min: 8, max: 35, step: 1, fmt: (n) => `${n}%` },
];

export function SavingsCalculator() {
  const [inputs, setInputs] = useState<CalcInputs>(CALC_DEFAULTS);
  const [email, setEmail] = useState("");
  const [hp, setHp] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "ok" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  const result = useMemo(() => computeSavings(inputs), [inputs]);

  const set = (key: keyof CalcInputs, value: number) =>
    setInputs((p) => ({ ...p, [key]: value }));

  async function sendBreakdown(e: React.FormEvent) {
    e.preventDefault();
    setStatus("submitting");
    setError(null);
    try {
      const res = await submitCalculatorLead({
        email,
        inputs,
        estimatedSavings: Math.round(result.carryingCostSavings),
        website_hp: hp,
      });
      if (res.ok) {
        track("calculator_completed", {
          working_capital_release: Math.round(result.workingCapitalRelease),
          carrying_cost_savings: Math.round(result.carryingCostSavings),
        });
        setStatus("ok");
      } else {
        setStatus("error");
        setError(res.error);
      }
    } catch {
      setStatus("error");
      setError("Network error. Please try again.");
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
      {/* Inputs */}
      <div className="glass rounded-xl p-6">
        <div className="mb-5 flex items-center gap-2 border-b border-border-hair pb-4 font-mono text-xs text-muted">
          <span className="text-accent">$</span> model --your-inventory
        </div>
        <div className="flex flex-col gap-5">
          {FIELDS.map((f) => (
            <div key={f.key}>
              <div className="mb-1.5 flex items-center justify-between">
                <label
                  htmlFor={`calc-${f.key}`}
                  className="font-mono text-xs uppercase tracking-wider text-muted"
                >
                  {f.label}
                </label>
                <span className="font-mono text-sm text-accent">
                  {f.fmt(inputs[f.key])}
                </span>
              </div>
              <input
                id={`calc-${f.key}`}
                type="range"
                min={f.min}
                max={f.max}
                step={f.step}
                value={inputs[f.key]}
                onChange={(e) => set(f.key, Number(e.target.value))}
                className="w-full accent-[var(--color-accent)]"
              />
            </div>
          ))}
        </div>
        <p className="mt-5 font-mono text-[11px] leading-relaxed text-muted">
          {"// "}estimate only — assumes COGS ≈ 65% of revenue. Your real model
          uses your actuals.
        </p>
      </div>

      {/* Result */}
      <div className="glass glow-hover flex flex-col rounded-xl p-6">
        <div className="mb-4 flex items-center gap-2 font-mono text-xs uppercase tracking-wider text-cyan">
          <TrendingDown className="h-4 w-4" aria-hidden /> Estimated upside
        </div>

        <div className="rounded-lg border border-accent/30 bg-accent/5 p-5">
          <div className="font-mono text-xs uppercase tracking-wider text-muted">
            Working capital released (one-time)
          </div>
          <div className="mt-1 font-mono text-4xl font-bold text-accent transition-all">
            {usd(result.workingCapitalRelease)}
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className="rounded-lg border border-border-hair bg-bg/40 p-4">
            <div className="font-mono text-[11px] uppercase tracking-wider text-muted">
              Annual carrying-cost savings
            </div>
            <div className="mt-1 font-mono text-xl font-semibold text-cyan">
              {usd(result.carryingCostSavings)}
            </div>
          </div>
          <div className="rounded-lg border border-border-hair bg-bg/40 p-4">
            <div className="font-mono text-[11px] uppercase tracking-wider text-muted">
              Days-on-hand reduction
            </div>
            <div className="mt-1 font-mono text-xl font-semibold text-violet">
              {Math.round(result.reductionPct * 100)}%
            </div>
          </div>
        </div>

        <p className="mt-4 rounded-md border border-dashed border-border-hair px-4 py-3 font-mono text-xs leading-relaxed text-fg/80">
          <AlertCircle className="mr-1 inline h-3.5 w-3.5 text-violet" aria-hidden />
          {result.riskNote}
        </p>

        {/* Lead capture */}
        <div className="mt-auto pt-5">
          {status === "ok" ? (
            <div className="flex items-center gap-2 rounded-md border border-accent/40 bg-accent/5 px-4 py-3 text-sm text-accent">
              <CheckCircle2 className="h-4 w-4" aria-hidden />
              Sent — check your inbox for the full breakdown.
            </div>
          ) : (
            <form onSubmit={sendBreakdown} className="flex flex-col gap-2">
              <label htmlFor="calc-email" className="font-mono text-xs text-muted">
                Email me the full breakdown
              </label>
              <div className="flex gap-2">
                <input
                  id="calc-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  className="min-w-0 flex-1 rounded-md border border-border-hair bg-bg/60 px-3.5 py-2.5 text-sm text-fg placeholder:text-muted/60 focus:border-accent/60 focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={status === "submitting"}
                  className="inline-flex shrink-0 items-center gap-2 rounded-md bg-accent px-4 py-2.5 font-mono text-sm font-medium text-bg transition-all hover:brightness-110 disabled:opacity-50"
                >
                  {status === "submitting" ? (
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                  ) : (
                    "Send"
                  )}
                </button>
              </div>
              {/* honeypot */}
              <input
                type="text"
                tabIndex={-1}
                autoComplete="off"
                value={hp}
                onChange={(e) => setHp(e.target.value)}
                className="pointer-events-none absolute -left-[9999px] h-0 w-0"
                aria-hidden
              />
              {status === "error" && error && (
                <p className="font-mono text-xs text-[#ff7a72]">{error}</p>
              )}
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
