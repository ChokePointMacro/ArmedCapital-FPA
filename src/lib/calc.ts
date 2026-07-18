// f07 — working-capital / inventory savings model.
// Deliberately simple and transparent; clearly an estimate, not a quote.

export type VerticalKey =
  | "all"
  | "outdoor"
  | "apparel"
  | "furniture"
  | "housewares"
  | "marine"
  | "mattress";

export type CalcInputs = {
  annualRevenue: number; // $/yr
  skuCount: number;
  currentDaysOnHand: number;
  targetDaysOnHand: number;
  carryingCostPct: number; // % per year
  vertical: VerticalKey;
};

export type CalcResult = {
  workingCapitalRelease: number; // one-time cash freed
  carryingCostSavings: number; // recurring annual savings
  currentInventoryValue: number;
  targetInventoryValue: number;
  reductionPct: number;
  riskNote: string;
  // Peer benchmark (vs public comps)
  verticalLabel: string;
  verticalMedian: number; // days
  verticalP75: number; // days
  verticalN: number; // sample size
  daysVsP75: number; // current − vertical p75 (negative = below peers)
  trappedVsPeers: number; // one-time cash carried above the vertical p75
  benchmarkNote: string;
  benchmarkStatus: "overstocked" | "elevated" | "healthy";
};

// Assumed cost of goods as a share of revenue for a physical-product company.
// A reasonable mid-point when the user hasn't shared gross margin.
const COGS_RATIO = 0.65;

// Peer days-on-hand benchmarks, computed from SEC EDGAR XBRL (FY2025 10-Ks)
// across 26 public physical-product brands. DIH = Inventory ÷ (COGS ÷ 365).
// Small public samples per vertical — directional, not a census.
export const VERTICAL_BENCHMARKS: Record<
  VerticalKey,
  { label: string; median: number; p75: number; n: number }
> = {
  all: { label: "All physical-product brands", median: 110, p75: 161, n: 26 },
  outdoor: { label: "Outdoor & sporting goods", median: 162, p75: 186, n: 7 },
  apparel: { label: "Apparel & footwear", median: 158, p75: 188, n: 5 },
  furniture: { label: "Furniture & home", median: 138, p75: 149, n: 4 },
  housewares: { label: "Housewares & appliances", median: 112, p75: 142, n: 3 },
  marine: { label: "Marine (build-to-order)", median: 78, p75: 93, n: 3 },
  mattress: { label: "Mattress (build-to-order)", median: 54, p75: 66, n: 3 },
};

export const CALC_DEFAULTS: CalcInputs = {
  annualRevenue: 25_000_000,
  skuCount: 800,
  currentDaysOnHand: 90,
  targetDaysOnHand: 65,
  carryingCostPct: 22,
  vertical: "all",
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

  // Peer benchmark
  const b = VERTICAL_BENCHMARKS[i.vertical] ?? VERTICAL_BENCHMARKS.all;
  const daysVsP75 = i.currentDaysOnHand - b.p75;
  const trappedVsPeers = Math.max(0, daysVsP75) * dailyCogs;

  let benchmarkStatus: CalcResult["benchmarkStatus"];
  let benchmarkNote: string;
  if (i.currentDaysOnHand > b.p75) {
    benchmarkStatus = "overstocked";
    benchmarkNote = `You're carrying ${Math.round(daysVsP75)} days more than the ${b.label.toLowerCase()} p75 (${b.p75} days). That gap alone is ${usd(trappedVsPeers)} of working capital sitting above your peers.`;
  } else if (i.currentDaysOnHand > b.median) {
    benchmarkStatus = "elevated";
    benchmarkNote = `You're above the ${b.label.toLowerCase()} median (${b.median} days) but below the p75 (${b.p75}). Room to tighten before you hit the structurally-overstocked tier.`;
  } else {
    benchmarkStatus = "healthy";
    benchmarkNote = `You're at or below the ${b.label.toLowerCase()} median (${b.median} days) — lean for your vertical. The release below comes from your own target, not a peer gap.`;
  }

  return {
    workingCapitalRelease,
    carryingCostSavings,
    currentInventoryValue,
    targetInventoryValue,
    reductionPct,
    riskNote,
    verticalLabel: b.label,
    verticalMedian: b.median,
    verticalP75: b.p75,
    verticalN: b.n,
    daysVsP75,
    trappedVsPeers,
    benchmarkNote,
    benchmarkStatus,
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
