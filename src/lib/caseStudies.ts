// f12 — case studies & testimonials.
//
// These are ILLUSTRATIVE scenarios modeled on the kind of engagements Armed
// Capital runs — anonymized, with representative (not actual-client) numbers.
// `placeholder: true` marks them as illustrative; replace with real, approved
// stories and figures as engagements close.

export type CaseStudy = {
  slug: string;
  client: string;
  industry: string;
  /** Size/shape context — revenue band, SKU count, channels. */
  context: string;
  /** One-line outcome headline. */
  summary: string;
  placeholder: boolean;
  challenge: string;
  approach: { stage: string; detail: string }[];
  results: { metric: string; value: string }[];
};

export const CASE_STUDIES: CaseStudy[] = [
  {
    slug: "dtc-home-goods",
    client: "DTC home-goods brand",
    industry: "Home goods · Shopify + ShipHero",
    context: "$34M revenue · ~720 SKUs · US + Canada",
    summary:
      "Freed ~$610K in working capital while cutting hero-SKU stockouts by roughly two-thirds.",
    placeholder: true,
    challenge:
      "Chronic overstock on slow movers and stockouts on hero SKUs. Purchasing ran on gut feel from a stale spreadsheet, and cash was locked in inventory that wasn't selling while best-sellers went dark for weeks.",
    approach: [
      { stage: "Stage 1", detail: "Unified Shopify + ShipHero exports, cleaned the SKU taxonomy, and fixed unit-of-measure mismatches into one analysis-ready dataset." },
      { stage: "Stage 2", detail: "Built the historical model and a 12-month rolling forecast with lead-time-aware order recommendations and ABC classification." },
      { stage: "Stage 3", detail: "Monthly roll-forward and executive report; open POs re-timed against live actuals instead of static min/max rules." },
    ],
    results: [
      { metric: "Working capital freed", value: "~$610K" },
      { metric: "Hero-SKU stockouts", value: "−64%" },
      { metric: "Days-on-hand", value: "78 → 54" },
      { metric: "Forecast accuracy (MAPE)", value: "→ 88%" },
    ],
  },
  {
    slug: "outdoor-equipment",
    client: "Outdoor-equipment manufacturer",
    industry: "Manufacturing · QuickBooks + Netstock",
    context: "$61M revenue · ~1,400 SKUs · seasonal, overseas sourcing",
    summary:
      "Turned seasonal guesswork into a sourcing-aware plan and cut carrying costs by ~$280K/yr.",
    placeholder: true,
    challenge:
      "Steep seasonal demand and long overseas lead times made ordering a guessing game. Capital sat in the wrong inventory going into peak season, and expedite freight ate margin when they guessed short.",
    approach: [
      { stage: "Stage 1", detail: "Aggregated QuickBooks + Netstock data and structured a clean dataset with country-of-origin and lead-time attributes per SKU." },
      { stage: "Stage 2", detail: "Country-sourcing-aware rolling forecast with ABC classification and target days-on-hand KPIs tuned to each lane." },
      { stage: "Stage 4", detail: "Ad-hoc capacity-increase cost projection to support the launch of a new product line without over-committing cash." },
    ],
    results: [
      { metric: "Carrying-cost savings", value: "~$280K/yr" },
      { metric: "Expedite freight", value: "−41%" },
      { metric: "Peak-season fill rate", value: "+11 pts" },
      { metric: "Forecast accuracy (MAPE)", value: "→ 85%" },
    ],
  },
  {
    slug: "specialty-food-beverage",
    client: "Specialty food & beverage brand",
    industry: "Food & bev · Cin7 + Faire (wholesale + DTC)",
    context: "$22M revenue · ~310 SKUs · short shelf life",
    summary:
      "Cut spoilage write-offs by more than half by planning to shelf life, not just demand.",
    placeholder: true,
    challenge:
      "Short shelf life across DTC and a growing wholesale book meant overordering led to spoilage write-offs, while underordering cost them Faire reorders. Demand also spiked unpredictably around retailer promotions.",
    approach: [
      { stage: "Stage 1", detail: "Merged Cin7 inventory with Faire wholesale and DTC order history; tagged SKUs with shelf-life and lot constraints." },
      { stage: "Stage 2", detail: "Built a shelf-life-aware rolling forecast that splits DTC vs. wholesale demand and flags at-risk lots before they expire." },
      { stage: "Stage 3", detail: "Monthly review with reorder recommendations sized to the sell-through window, plus a promo-uplift overlay for retailer events." },
    ],
    results: [
      { metric: "Spoilage write-offs", value: "−58%" },
      { metric: "Wholesale fill rate", value: "+14 pts" },
      { metric: "Working capital freed", value: "~$190K" },
      { metric: "Forecast accuracy (MAPE)", value: "→ 83%" },
    ],
  },
  {
    slug: "beauty-personal-care",
    client: "Beauty & personal-care brand",
    industry: "Beauty · Shopify + Amazon FBA",
    context: "$48M revenue · ~540 SKUs · DTC + marketplace",
    summary:
      "Untangled multi-channel demand and kept Amazon in stock through promo spikes.",
    placeholder: true,
    challenge:
      "SKU proliferation from shade and size variants, split across Shopify and Amazon FBA, made true demand invisible. FBA restock limits and influencer-driven spikes caused whiplash between stockouts and long-term storage fees.",
    approach: [
      { stage: "Stage 1", detail: "Consolidated Shopify + Amazon (FBA) data into one SKU map, de-duplicating variants and normalizing channel demand." },
      { stage: "Stage 2", detail: "Channel-split rolling forecast with FBA restock-limit constraints and a launch/promo uplift model for hero shades." },
      { stage: "Stage 3", detail: "Monthly order recommendations balanced across channels, with early-warning flags for FBA aged-inventory fees." },
    ],
    results: [
      { metric: "Amazon in-stock rate", value: "+17 pts" },
      { metric: "FBA long-term storage fees", value: "−52%" },
      { metric: "Days-on-hand", value: "96 → 68" },
      { metric: "Forecast accuracy (MAPE)", value: "→ 86%" },
    ],
  },
  {
    slug: "pet-products",
    client: "Pet-products company",
    industry: "Pet · NetSuite (subscription + retail)",
    context: "$73M revenue · ~880 SKUs · subscribe & retail",
    summary:
      "Made a subscription base predictable and smoothed bulk raw-material buys.",
    placeholder: true,
    challenge:
      "A fast-growing subscription base plus retail meant two very different demand signals. Bulk raw-material purchasing was reactive, so they alternated between rush orders and warehouses full of the wrong inputs.",
    approach: [
      { stage: "Stage 1", detail: "Pulled NetSuite transaction and BOM data; separated recurring subscription demand from retail and mapped SKUs to raw-material inputs." },
      { stage: "Stage 2", detail: "Cohort-based subscription forecast rolled up to a raw-material requirements plan with supplier MOQ and lead-time awareness." },
      { stage: "Stage 3", detail: "Monthly roll-forward tying finished-goods demand to raw-material POs, with days-on-hand targets at both levels." },
    ],
    results: [
      { metric: "Rush raw-material orders", value: "−47%" },
      { metric: "Working capital freed", value: "~$820K" },
      { metric: "Subscription forecast accuracy", value: "→ 91%" },
      { metric: "Days-on-hand (finished goods)", value: "62 → 49" },
    ],
  },
  {
    slug: "apparel-accessories",
    client: "Apparel & accessories brand",
    industry: "Apparel · Cin7 + Faire (wholesale + DTC)",
    context: "$29M revenue · ~1,100 SKUs · size/color variants",
    summary:
      "Tamed size/color SKU explosion and planned buys by curve, not by hunch.",
    placeholder: true,
    challenge:
      "Every style multiplied into dozens of size/color SKUs, and overseas lead times meant buys were committed months ahead. Broken size curves stranded inventory while popular sizes sold out mid-season.",
    approach: [
      { stage: "Stage 1", detail: "Structured Cin7 + Faire data around style/size/color hierarchies so demand could be seen at both style and variant level." },
      { stage: "Stage 2", detail: "Size-curve-aware rolling forecast with lead-time-committed buys and markdown-risk flags for broken curves." },
      { stage: "Stage 4", detail: "On-demand pre-season buy plan and open-to-buy scenario analysis ahead of the overseas order window." },
    ],
    results: [
      { metric: "End-of-season markdowns", value: "−36%" },
      { metric: "In-season sell-through", value: "+13 pts" },
      { metric: "Working capital freed", value: "~$340K" },
      { metric: "Forecast accuracy (MAPE)", value: "→ 84%" },
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
  {
    quote:
      "Planning to shelf life instead of just demand stopped the write-offs that were quietly killing our margin.",
    author: "VP Operations",
    role: "Specialty food & beverage brand",
    placeholder: true,
  },
  {
    quote:
      "Splitting Amazon and Shopify demand was the unlock. We stopped guessing on restocks and the FBA fees fell off a cliff.",
    author: "Head of Supply Chain",
    role: "Beauty & personal-care brand",
    placeholder: true,
  },
  {
    quote:
      "Tying our subscription growth to raw-material buys took the panic out of purchasing. No more 2 a.m. rush orders.",
    author: "CFO",
    role: "Pet-products company",
    placeholder: true,
  },
];
