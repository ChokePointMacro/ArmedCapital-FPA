// f12 — case studies & testimonials.
// Placeholder/anonymized entries marked TODO. Replace `placeholder: true`
// entries with real, approved client stories and numbers.

export type CaseStudy = {
  slug: string;
  client: string;
  industry: string;
  placeholder: boolean;
  challenge: string;
  approach: { stage: string; detail: string }[];
  results: { metric: string; value: string }[];
};

export const CASE_STUDIES: CaseStudy[] = [
  {
    slug: "dtc-home-goods",
    client: "DTC home-goods brand", // TODO(client): real (approved) name
    industry: "Home goods · Shopify + ShipHero",
    placeholder: true,
    challenge:
      "Chronic overstock on slow movers and stockouts on hero SKUs. Purchasing ran on gut feel from a stale spreadsheet.",
    approach: [
      { stage: "Stage 1", detail: "Unified Shopify + ShipHero exports, cleaned SKU taxonomy, fixed unit mismatches." },
      { stage: "Stage 2", detail: "Built the historical model and a 12-month rolling forecast with lead-time-aware order recs." },
      { stage: "Stage 3", detail: "Monthly roll-forward + executive report; POs adjusted to live actuals." },
    ],
    results: [
      { metric: "Working capital freed", value: "TODO" },
      { metric: "Stockout reduction", value: "TODO" },
      { metric: "Days-on-hand", value: "TODO" },
    ],
  },
  {
    slug: "outdoor-equipment",
    client: "Outdoor-equipment manufacturer", // TODO(client)
    industry: "Manufacturing · QuickBooks + Netstock",
    placeholder: true,
    challenge:
      "Seasonal demand and long overseas lead times made ordering a guessing game; capital was locked in the wrong inventory.",
    approach: [
      { stage: "Stage 1", detail: "Aggregated QuickBooks + Netstock data; structured an analysis-ready dataset." },
      { stage: "Stage 2", detail: "Country-sourcing-aware forecast with ABC classification and target days-on-hand KPIs." },
      { stage: "Stage 4", detail: "Ad-hoc capacity-increase cost projection for a new product line." },
    ],
    results: [
      { metric: "Forecast accuracy", value: "TODO" },
      { metric: "Carrying-cost savings", value: "TODO" },
      { metric: "Lead-time buffer", value: "TODO" },
    ],
  },
];

export type Testimonial = {
  quote: string;
  author: string;
  role: string;
  placeholder: boolean;
};

export const TESTIMONIALS: Testimonial[] = [
  {
    // TODO(client): replace with a real, approved testimonial.
    quote:
      "For the first time we know what to order and when — the forecast updates every month and the reports just land.",
    author: "Founder",
    role: "DTC home-goods brand",
    placeholder: true,
  },
  {
    quote:
      "They didn't hand us a black box. We understand the model, and our purchasing finally has rigor behind it.",
    author: "COO",
    role: "Outdoor-equipment manufacturer",
    placeholder: true,
  },
];
