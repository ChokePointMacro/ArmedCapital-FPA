"use client";

import { useState } from "react";
import { REVENUE_RANGES, SKU_COUNTS } from "@/lib/content";

type Band = {
  key: string;
  label: string;
  blurb: string;
  tone: string;
};

function bandFor(revenue: string, sku: string): Band {
  const big = revenue === "200-500M" || revenue === "500M+";
  const mid = revenue === "10-50M" || revenue === "50-200M";
  const small = revenue === "<1M" || revenue === "1-10M";
  const manySkus = sku === "2000+";

  if (small) {
    return {
      key: "starter",
      label: "Starter band",
      blurb:
        "Scaled pricing for earlier-stage businesses that can't yet justify an in-house analyst. You're explicitly welcome — we right-size the engagement.",
      tone: "text-cyan",
    };
  }
  if (mid) {
    return {
      key: "core",
      label: "Core band — the sweet spot",
      blurb: manySkus
        ? "Right in our wheelhouse, with a larger catalog. Expect Stage 1 to spend a little longer on aggregation and ABC structuring."
        : "Right in our wheelhouse. The four-stage model fits cleanly; onboarding is efficient.",
      tone: "text-accent",
    };
  }
  if (big) {
    return {
      key: "enterprise",
      label: "Enterprise band",
      blurb:
        "Toward the top of our range. Engagements are scoped to the complexity of your catalog and data sources.",
      tone: "text-violet",
    };
  }
  return {
    key: "core",
    label: "Core band",
    blurb: "Tell us a bit more and we'll point you to the right starting tier.",
    tone: "text-accent",
  };
}

export function PricingEstimator() {
  const [revenue, setRevenue] = useState("");
  const [sku, setSku] = useState("");
  const ready = revenue && sku;
  const band = ready ? bandFor(revenue, sku) : null;

  const selectCls =
    "w-full rounded-md border border-border-hair bg-bg/60 px-3.5 py-2.5 text-sm text-fg focus:border-accent/60 focus:outline-none";

  return (
    <div className="glass rounded-xl p-6">
      <div className="mb-5 flex items-center gap-2 border-b border-border-hair pb-4 font-mono text-xs text-muted">
        <span className="text-accent">$</span> estimate --tier
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block font-mono text-xs uppercase tracking-wider text-muted">
            Annual revenue
          </label>
          <select
            className={selectCls}
            value={revenue}
            onChange={(e) => setRevenue(e.target.value)}
          >
            <option value="">Select…</option>
            {REVENUE_RANGES.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1.5 block font-mono text-xs uppercase tracking-wider text-muted">
            SKU count
          </label>
          <select
            className={selectCls}
            value={sku}
            onChange={(e) => setSku(e.target.value)}
          >
            <option value="">Select…</option>
            {SKU_COUNTS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
      </div>

      {band && (
        <div className="mt-5 rounded-lg border border-border-hair bg-bg/40 p-5">
          <div className={`font-mono text-sm font-semibold ${band.tone}`}>
            {band.label}
          </div>
          <p className="mt-2 text-sm leading-relaxed text-muted">{band.blurb}</p>
          <p className="mt-3 font-mono text-xs text-fg/80">
            {"// "}suggested path: Build (Stage 1+2) → monthly Maintenance (Stage
            3) → Ad-hoc (Stage 4) as needed.
          </p>
        </div>
      )}
    </div>
  );
}
