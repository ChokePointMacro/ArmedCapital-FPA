// f08 — "Is your data forecast-ready?" assessment.
// Five single-select questions, each option worth 0–20 → score 0–100.

export type AssessmentOption = { label: string; points: number };
export type AssessmentQuestion = {
  id: string;
  prompt: string;
  options: AssessmentOption[];
};

export const QUESTIONS: AssessmentQuestion[] = [
  {
    id: "systems",
    prompt: "Where does your inventory & sales data live?",
    options: [
      { label: "Modern platforms (Shopify, QuickBooks, NetSuite, ShipHero…)", points: 20 },
      { label: "A mix of platforms and spreadsheets", points: 12 },
      { label: "Mostly spreadsheets or manual records", points: 5 },
    ],
  },
  {
    id: "export",
    prompt: "Can you export that data (CSV / Excel)?",
    options: [
      { label: "Yes — easily, on demand", points: 20 },
      { label: "Some of it, with effort", points: 11 },
      { label: "Not sure / can't today", points: 3 },
    ],
  },
  {
    id: "hygiene",
    prompt: "How consistent is your SKU & category data?",
    options: [
      { label: "Standardized and consistent", points: 20 },
      { label: "Mostly consistent, some gaps", points: 12 },
      { label: "Messy — duplicates, mismatched units", points: 5 },
    ],
  },
  {
    id: "skus",
    prompt: "How many active SKUs do you carry?",
    options: [
      { label: "Under 500", points: 20 },
      { label: "500 – 2,000", points: 15 },
      { label: "Over 2,000", points: 8 },
    ],
  },
  {
    id: "forecast",
    prompt: "How do you forecast demand today?",
    options: [
      { label: "A rolling forecast we update regularly", points: 20 },
      { label: "Occasional or manual projections", points: 11 },
      { label: "We mostly go on gut feel", points: 4 },
    ],
  },
];

export const MAX_SCORE = QUESTIONS.length * 20;

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
