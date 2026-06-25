// Centralized site content sourced from the Armed Capital build brief.
// Keep copy precise and quantitative — this firm sells rigor.

export const SITE = {
  name: "Armed Capital",
  tagline: "FP&A & Demand Forecasting",
  logo: "armed_capital",
  // TODO(client): replace with the real inbound contact address.
  email: "hello@armedcapital.co",
  description:
    "FP&A and demand forecasting for physical-product companies. We turn messy data into a rolling 12-month forecast with order recommendations, ABC classifications, and days-on-hand KPIs.",
  url: "https://armed-capital.vercel.app",
} as const;

export type Stage = {
  id: string;
  title: string;
  cadence: string;
  summary: string;
  bullets: string[];
};

export const STAGES: Stage[] = [
  {
    id: "stage_01",
    title: "Data Access, Aggregation, Cleaning & Structure",
    cadence: "foundation",
    summary:
      "Establish access to the client's data, aggregate it across sources, clean and normalize it, and structure a clear plan for analysis. The foundation everything else is built on.",
    bullets: [
      "Secure data access setup across the client's existing platforms.",
      "Aggregation of disparate data sources into a single, analysis-ready structure.",
      "Cleaning & normalization (deduping, unit/category alignment, error correction).",
      "A structured analysis plan defining what gets modeled and how.",
    ],
  },
  {
    id: "stage_02",
    title: "Historical Model + 12-Month Rolling Forecast",
    cadence: "build",
    summary:
      "Build the historical baseline model and roll a 12-month forecast forward, complete with actionable ordering intelligence.",
    bullets: [
      "Order recommendation estimations — what to order and when.",
      "Lead-time considerations built into ordering logic.",
      "Country-sourcing considerations (origin-aware planning).",
      "ABC classifications of SKU importance.",
      "Target days-on-hand KPIs.",
      "Total units by category, broken down by month & week.",
    ],
  },
  {
    id: "stage_03",
    title: "Maintenance",
    cadence: "monthly recurring",
    summary:
      "Ongoing monthly service that keeps the model and forecast living and current. Included in the monthly maintenance fee:",
    bullets: [
      "Monthly executive reports, breakdowns, and analysis.",
      "Adjustments to future POs based on the latest actuals.",
      "Roll-forward forecast that updates every month.",
    ],
  },
  {
    id: "stage_04",
    title: "Ad-Hoc Projects",
    cadence: "on-demand",
    summary:
      "On-demand, project-based modeling for specific strategic questions:",
    bullets: [
      "Product launch forecasts / projections",
      "Manufacturing analysis",
      "Product cost reduction",
      "Supply-chain reorganization",
      "Vertical-integration cost-benefit analysis",
      "Capacity-increase cost projection",
      "Any other modeling need an organization has",
    ],
  },
];

export const FEATURES = [
  {
    key: "rolling_forecast",
    title: "Rolling 12-month forecast",
    desc: "A forward forecast that updates every month — never stale, never guesswork.",
  },
  {
    key: "order_recs",
    title: "Automated order recommendations",
    desc: "What to order and when, with lead-time and country-sourcing logic baked in.",
  },
  {
    key: "abc_kpis",
    title: "ABC classification & days-on-hand",
    desc: "Rank SKU importance and track target days-on-hand KPIs against actuals.",
  },
  {
    key: "units_breakdown",
    title: "Units by category, by month and week",
    desc: "Granular demand breakdowns you can actually plan purchasing around.",
  },
  {
    key: "exec_reports",
    title: "Monthly executive reports",
    desc: "Breakdowns and analysis delivered like clockwork, every month.",
  },
  {
    key: "integrations",
    title: "Works with your existing tools",
    desc: "Native integrations with the platforms you already run on.",
  },
] as const;

export const ICP = [
  { criterion: "Product type", target: "Companies that sell a physical product" },
  {
    criterion: "Manufacturing location",
    target:
      "Domestic or international — preferred: USA, Canada, China, Vietnam, Cambodia, South Korea",
  },
  { criterion: "SKU count", target: "Under 2,000 total SKUs" },
  { criterion: "Annual revenue", target: "$10M – $500M (general sweet spot)" },
  {
    criterion: "Smaller businesses",
    target:
      "Also happy to serve much smaller startups that can't yet afford an in-house analyst — pricing scales with the size of the business",
  },
];

// Section 06: native-experience platforms. "Works natively with" grid.
export const PLATFORMS = [
  "Sage Intacct",
  "QuickBooks",
  "Netstock",
  "ShipHero",
  "ShipStation",
  "Shopify",
  "Website",
  "Monday",
  "Slack",
  "HubSpot",
  "Google",
  "Tableau",
  "Zapier",
];

export const COMPATIBILITY_STATEMENT =
  "Native integrations with the tools you already use — and if your data can be exported, we can model it. No platform lock-in required.";

// KPI tickers (Section 04 / Design).
export const KPI_TICKERS = [
  { value: 2000, prefix: "<", suffix: "", label: "SKUs in scope" },
  { value: 12, prefix: "", suffix: "-mo", label: "rolling forecast" },
  { value: 4, prefix: "", suffix: "", label: "stage service model" },
  { value: 100, prefix: "", suffix: "%", label: "models you understand" },
];

// ---- Form options (Section 08) ----

export const INQUIRY_TYPES = ["client", "investor", "general"] as const;

export const REVENUE_RANGES = [
  "<1M",
  "1-10M",
  "10-50M",
  "50-200M",
  "200-500M",
  "500M+",
] as const;

export const SKU_COUNTS = ["<100", "100-500", "500-2000", "2000+"] as const;

// Platform multi-select = the Section 06 list + "Other".
export const PLATFORM_OPTIONS = [...PLATFORMS, "Other"] as const;
