// f08 — "Is your data forecast-ready?" assessment + lead qualification.
//
// Two sections:
//   1. FIT       — ICP qualifiers. Grade the lead A / B / C. Not scored.
//   2. READINESS — data maturity. Scored 0–20 each → 0–100.
//
// Grade is an INTERNAL classification (stored + notified). It is deliberately
// never shown to the visitor — they see their readiness result and next step.

export type Fit = "core" | "edge" | "out";

export type AssessmentOption = {
  label: string;
  /** Readiness points (readiness questions only). */
  points?: number;
  /** ICP weighting (fit questions only). Omitted = informational. */
  fit?: Fit;
  /** Prompt for a short free-text follow-up when this option is picked. */
  capture?: string;
};

export type AssessmentQuestion = {
  id: string;
  section: "fit" | "readiness";
  prompt: string;
  help?: string;
  options: AssessmentOption[];
};

/* ------------------------------------------------------------------ */
/*  SECTION 1 — ICP fit                                                */
/* ------------------------------------------------------------------ */
const FIT_QUESTIONS: AssessmentQuestion[] = [
  {
    id: "product",
    section: "fit",
    prompt: "What do you sell?",
    options: [
      { label: "Physical products we manufacture or assemble", fit: "core" },
      { label: "Physical products we source and resell", fit: "core" },
      { label: "Physical products plus services or subscriptions", fit: "core" },
      { label: "Mostly services, some physical product", fit: "edge" },
      { label: "Software or services only", fit: "out" },
    ],
  },
  {
    id: "revenue",
    section: "fit",
    prompt: "Roughly what's your annual revenue?",
    help: "The $10M–$500M band is the sweet spot — it's not a hard wall.",
    options: [
      { label: "Under $1M", fit: "edge" },
      { label: "$1M – $10M", fit: "edge" },
      { label: "$10M – $50M", fit: "core" },
      { label: "$50M – $200M", fit: "core" },
      { label: "$200M – $500M", fit: "core" },
      { label: "Over $500M", fit: "edge" },
    ],
  },
  {
    id: "skus",
    section: "fit",
    prompt: "How many active SKUs do you carry?",
    options: [
      { label: "Under 100", fit: "core" },
      { label: "100 – 500", fit: "core" },
      { label: "500 – 1,000", fit: "core" },
      { label: "1,000 – 2,000", fit: "core" },
      { label: "2,000 – 5,000", fit: "edge" },
      { label: "Over 5,000", fit: "out" },
    ],
  },
  {
    id: "sourcing",
    section: "fit",
    prompt: "Where is your product manufactured?",
    help: "Informational — it shapes lead-time and duty modelling.",
    options: [
      { label: "United States" },
      { label: "Canada" },
      { label: "Mexico" },
      { label: "China" },
      { label: "Vietnam" },
      { label: "Cambodia" },
      { label: "South Korea" },
      { label: "India" },
      { label: "Europe" },
      { label: "Multiple regions" },
      { label: "Somewhere else" },
    ],
  },
  {
    id: "timeline",
    section: "fit",
    prompt: "When would you want a model running?",
    options: [
      { label: "Within 30 days — it's urgent" },
      { label: "This quarter" },
      { label: "In 3 – 6 months" },
      { label: "Just exploring for now" },
    ],
  },
];

/* ------------------------------------------------------------------ */
/*  SECTION 2 — data readiness (scored)                                */
/* ------------------------------------------------------------------ */
const READINESS_QUESTIONS: AssessmentQuestion[] = [
  {
    id: "systems",
    section: "readiness",
    prompt: "Where does your inventory & sales data live?",
    options: [
      { label: "NetSuite, Sage Intacct or similar ERP", points: 20 },
      { label: "Netstock, Inventory Planner or similar", points: 20 },
      { label: "QuickBooks or Xero", points: 18 },
      { label: "Shopify / Amazon / marketplace platforms", points: 18 },
      { label: "ShipHero, ShipStation or a 3PL portal", points: 17 },
      { label: "A custom or in-house system", points: 14 },
      {
        label: "Another platform — not listed here",
        points: 15,
        capture: "Which platform do you use?",
      },
      { label: "A mix of platforms and spreadsheets", points: 12 },
      { label: "Mostly spreadsheets", points: 6 },
      { label: "Paper, memory, or nothing consistent", points: 2 },
    ],
  },
  {
    id: "export",
    section: "readiness",
    prompt: "Can you export that data?",
    options: [
      { label: "Yes — API access available", points: 20 },
      { label: "Yes — CSV / Excel on demand", points: 18 },
      { label: "Scheduled reports land in an inbox", points: 15 },
      { label: "Some of it, with effort", points: 10 },
      { label: "Only our IT team or vendor can pull it", points: 6 },
      { label: "Not sure / can't today", points: 3 },
    ],
  },
  {
    id: "hygiene",
    section: "readiness",
    prompt: "How consistent is your SKU & category data?",
    options: [
      { label: "Standardized, governed, one source of truth", points: 20 },
      { label: "Standardized and consistent", points: 18 },
      { label: "Mostly consistent, some gaps", points: 12 },
      { label: "Inconsistent naming across systems", points: 8 },
      { label: "Messy — duplicates, mismatched units", points: 4 },
      { label: "Honestly, I don't know", points: 4 },
    ],
  },
  {
    id: "leadtime",
    section: "readiness",
    prompt: "Do you track supplier lead times by SKU?",
    options: [
      { label: "Yes — actuals tracked per PO and per SKU", points: 20 },
      { label: "Yes — a standard lead time per supplier", points: 15 },
      { label: "Roughly — it lives in people's heads", points: 8 },
      { label: "No, we don't track lead times", points: 3 },
    ],
  },
  {
    id: "forecast",
    section: "readiness",
    prompt: "How do you forecast demand today?",
    options: [
      { label: "A rolling forecast we update monthly", points: 20 },
      { label: "A spreadsheet model we revisit occasionally", points: 14 },
      { label: "Reorder points / min-max only", points: 10 },
      { label: "Last year's numbers plus a growth factor", points: 8 },
      { label: "We mostly go on gut feel", points: 4 },
    ],
  },
];

export const QUESTIONS: AssessmentQuestion[] = [
  ...FIT_QUESTIONS,
  ...READINESS_QUESTIONS,
];

/** Only readiness questions contribute to the score. */
export const MAX_SCORE = READINESS_QUESTIONS.length * 20;

/* ------------------------------------------------------------------ */
/*  Lead grading — ICP fit only                                        */
/* ------------------------------------------------------------------ */
export type Grade = "A" | "B" | "C";

/** Questions whose `fit` drives the grade. Sourcing/timeline are context. */
export const GRADED_IDS = ["product", "revenue", "skus"];

/**
 * A — every graded answer is core ICP (physical product, $10M–$500M, ≤2,000 SKUs)
 * B — physical-product company sitting just outside a band
 * C — outside the ICP (services-only, or >5,000 SKUs)
 */
export function gradeFrom(fits: Fit[]): Grade {
  if (fits.length === 0) return "C";
  if (fits.includes("out")) return "C";
  return fits.every((f) => f === "core") ? "A" : "B";
}

export const GRADE_NOTE: Record<Grade, string> = {
  A: "Core ICP — physical product, revenue and SKU count all in band.",
  B: "Physical-product company just outside one ICP band.",
  C: "Outside ICP — services-only or SKU count beyond range.",
};

/* ------------------------------------------------------------------ */
/*  Readiness recommendation (what the visitor sees)                   */
/* ------------------------------------------------------------------ */
export type Recommendation = {
  tier: "ready" | "close" | "foundation";
  headline: string;
  body: string;
  cta: "book" | "stage1";
};

export function recommend(score: number): Recommendation {
  if (score >= 80) {
    return {
      tier: "ready",
      headline: "You're forecast-ready.",
      body: "Your data is in good shape. The fast path is Stage 2 — build the historical model and roll a 12-month forecast forward. Let's scope it on a call.",
      cta: "book",
    };
  }
  if (score >= 55) {
    return {
      tier: "close",
      headline: "You're close.",
      body: "You have most of what's needed. A focused Stage 1 pass — access, aggregation, and cleanup — gets you ready to forecast quickly.",
      cta: "book",
    };
  }
  return {
    tier: "foundation",
    headline: "Start with the foundation.",
    body: "Stage 1 is the obvious first step: secure data access, aggregate your sources, and clean & structure everything for analysis. That's exactly what we do before any forecast.",
    cta: "stage1",
  };
}
