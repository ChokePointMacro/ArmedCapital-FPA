// f07 — working-capital / inventory savings model.
// Deliberately simple and transparent; clearly an estimate, not a quote.

export type CalcInputs = {
  annualRevenue: number; // $/yr
  skuCount: number;
  currentDaysOnHand: number;
  targetDaysOnHand: number;
  carryingCostPct: number; // % per year
};

export type CalcResult = {
  workingCapitalRelease: number; // one-time cash freed
  carryingCostSavings: number; // recurring annual savings
  currentInventoryValue: number;
  targetInventoryValue: number;
  reductionPct: number;
  riskNote: string;
};

// Assumed cost of goods as a share of revenue for a physical-product company.
// A reasonable mid-point when the user hasn't shared gross margin.
const COGS_RATIO = 0.65;

export const CALC_DEFAULTS: CalcInputs = {
  annualRevenue: 25_000_000,
  skuCount: 800,
  currentDaysOnHand: 90,
  targetDaysOnHand: 65,
  carryingCostPct: 22,
};

export function computeSavings(i: CalcInputs): CalcResult {
  const annualCogs = Math.max(0, i.annualRevenue) * COGS_RATIO;
  const dailyCogs = annualCogs / 365;

  const currentInventoryValue = dailyCogs * Math.max(0, i.currentDaysOnHand);
  const targetInventoryValue = dailyCogs * Math.max(0, i.targetDaysOnHand);

  const workingCapitalRelease = Math.max(
    0,
    currentInventoryValue - targetInventoryValue,
  );
  const carryingCostSavings =
    workingCapitalRelease * (Math.max(0, i.carryingCostPct) / 100);

  const reductionPct =
    i.currentDaysOnHand > 0
      ? Math.max(
          0,
          (i.currentDaysOnHand - i.targetDaysOnHand) / i.currentDaysOnHand,
        )
      : 0;

  let riskNote: string;
  if (i.targetDaysOnHand >= i.currentDaysOnHand) {
    riskNote =
      "No reduction modeled — set a target below your current days-on-hand to see capital release.";
  } else if (reductionPct > 0.4) {
    riskNote =
      "Aggressive target. Releases the most cash, but validate lead times and country-sourcing buffers first to avoid stockouts — exactly what Stage 2 models.";
  } else if (reductionPct > 0.2) {
    riskNote =
      "Balanced target. A realistic glide-path most teams can hit with ABC-aware reorder logic and lead-time buffers.";
  } else {
    riskNote =
      "Conservative target. Low stockout risk; there is likely more capital to release as the forecast tightens.";
  }

  return {
    workingCapitalRelease,
    carryingCostSavings,
    currentInventoryValue,
    targetInventoryValue,
    reductionPct,
    riskNote,
  };
}

export function usd(n: number): string {
  if (!isFinite(n)) return "$0";
  if (n >= 1_000_000)
    return `$${(n / 1_000_000).toLocaleString("en-US", { maximumFractionDigits: 2 })}M`;
  if (n >= 1_000)
    return `$${(n / 1_000).toLocaleString("en-US", { maximumFractionDigits: 0 })}K`;
  return `$${Math.round(n).toLocaleString("en-US")}`;
}
