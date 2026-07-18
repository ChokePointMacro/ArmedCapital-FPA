/* ------------------------------------------------------------------ */
/*  Single source of truth for the sample company used across          */
/*  /reports, /pipeline and /dashboard.                                */
/*                                                                     */
/*  Every KPI on the site is COMPUTED from this file — nothing is      */
/*  hard-coded in a component — so figures tie across every page.      */
/*  Illustrative data only; not a live feed.                           */
/* ------------------------------------------------------------------ */

export const TODAY = new Date(2026, 6, 18); // "as of" date for the sample
export const CURWK = 29; // ISO week matching TODAY

/* ---------------- vendors ---------------- */
export type Vendor = {
  name: string;
  contact: string;
  role: string;
  email: string;
  phone: string;
  hours: string;
  terms: number; // supplier payment terms, days
};

export const VENDORS: Record<string, Vendor> = {
  "Shenzhen, CN": { name: "Shenzhen Precision Ltd.", contact: "Wei Zhang", role: "Export Manager", email: "w.zhang@shenzhenprecision.cn", phone: "+86 755 8832 4417", hours: "09:00–18:00 CST (UTC+8)", terms: 45 },
  "Guangzhou, CN": { name: "Guangzhou MetalWorks", contact: "Li Chen", role: "Key Account Manager", email: "l.chen@gzmetalworks.cn", phone: "+86 20 3847 9022", hours: "09:00–18:00 CST (UTC+8)", terms: 45 },
  "Penang, MY": { name: "Penang Electronics Sdn Bhd", contact: "Nurul Aziz", role: "Sales Director", email: "n.aziz@penangelec.my", phone: "+60 4 226 7781", hours: "08:30–17:30 MYT (UTC+8)", terms: 60 },
  "Monterrey, MX": { name: "Monterrey Components S.A.", contact: "Carlos Rivera", role: "Key Accounts", email: "c.rivera@mtycomponents.mx", phone: "+52 81 8340 5512", hours: "08:00–17:00 CST (UTC−6)", terms: 30 },
  "Da Nang, VN": { name: "Vietnam Assembly Co.", contact: "Tran Minh", role: "Operations Lead", email: "t.minh@vnassembly.vn", phone: "+84 236 3891 244", hours: "08:00–17:00 ICT (UTC+7)", terms: 45 },
};
export const VENDOR = (origin: string) => VENDORS[origin];

/* ---------------- SKUs ---------------- */
export type Lead = { approval: number; production: number; shipping: number; customs: number; receiving: number };
export type Sku = {
  id: string;
  name: string;
  cls: "A" | "B" | "C";
  onhand: number;
  wkly: number; // units of demand per week
  cost: number; // landed unit cost
  price: number; // average selling price
  ss: number; // safety stock, units
  moq: number;
  origin: string;
  lead: Lead;
  actualVar: number; // avg actual vs planned lead time, days
};

export const SKUS: Sku[] = [
  { id: "CPM-101", name: "Precision Bearing Assy", cls: "A", onhand: 14200, wkly: 1850, cost: 18.40, price: 31.20, ss: 5000, moq: 4000, origin: "Guangzhou, CN", lead: { approval: 4, production: 28, shipping: 24, customs: 5, receiving: 2 }, actualVar: 3 },
  { id: "CPM-118", name: "Alloy Housing Module", cls: "A", onhand: 8600, wkly: 2400, cost: 41.10, price: 68.50, ss: 6000, moq: 4000, origin: "Shenzhen, CN", lead: { approval: 3, production: 32, shipping: 26, customs: 6, receiving: 2 }, actualVar: 8 },
  { id: "CPM-142", name: "Sensor Control Board", cls: "A", onhand: 5100, wkly: 1650, cost: 62.75, price: 112.00, ss: 4200, moq: 4000, origin: "Penang, MY", lead: { approval: 5, production: 35, shipping: 22, customs: 5, receiving: 2 }, actualVar: 2 },
  { id: "CPM-176", name: "Composite Frame Kit", cls: "B", onhand: 22400, wkly: 1200, cost: 27.30, price: 44.80, ss: 3600, moq: 6000, origin: "Monterrey, MX", lead: { approval: 3, production: 18, shipping: 6, customs: 3, receiving: 2 }, actualVar: -1 },
  { id: "CPM-207", name: "Thermal Regulator Unit", cls: "A", onhand: 3200, wkly: 1400, cost: 88.90, price: 158.00, ss: 3800, moq: 4000, origin: "Penang, MY", lead: { approval: 4, production: 30, shipping: 25, customs: 6, receiving: 3 }, actualVar: 6 },
  { id: "CPM-233", name: "Fastener Pack 240ct", cls: "C", onhand: 41800, wkly: 2100, cost: 6.15, price: 11.40, ss: 5200, moq: 10000, origin: "Guangzhou, CN", lead: { approval: 3, production: 14, shipping: 24, customs: 5, receiving: 2 }, actualVar: 1 },
  { id: "CPM-260", name: "Actuator Sub-Assembly", cls: "B", onhand: 9700, wkly: 980, cost: 34.60, price: 59.90, ss: 2400, moq: 6000, origin: "Da Nang, VN", lead: { approval: 4, production: 26, shipping: 22, customs: 5, receiving: 2 }, actualVar: 5 },
  { id: "CPM-288", name: "Wiring Harness Loom", cls: "B", onhand: 23400, wkly: 1560, cost: 15.85, price: 27.60, ss: 3800, moq: 6000, origin: "Da Nang, VN", lead: { approval: 3, production: 20, shipping: 21, customs: 4, receiving: 2 }, actualVar: 0 },
];

export const SKU = (id: string) => SKUS.find((s) => s.id === id)!;
export const leadTotal = (l: Lead) => l.approval + l.production + l.shipping + l.customs + l.receiving;

/* ---------------- lifecycle stages ---------------- */
export type Stage = { n: number; name: string; short: string };
export const STAGES: Stage[] = [
  { n: 1, name: "PR Proposed", short: "PR" },
  { n: 2, name: "PR Approved", short: "APPR" },
  { n: 3, name: "PO Issued", short: "PO" },
  { n: 4, name: "Supplier Confirmed", short: "CONF" },
  { n: 5, name: "In Production", short: "PROD" },
  { n: 6, name: "Shipped", short: "SHIP" },
  { n: 7, name: "In Transit / Customs", short: "TRANSIT" },
  { n: 8, name: "Received", short: "RECV" },
];

/* ---------------- purchase orders ---------------- */
export type Po = {
  id: string;
  sku: string;
  qty: number;
  stage: number;
  elapsed: number;
  variance: number;
  contacted: number;
};

export const POS: Po[] = [
  { id: "PO-4417", sku: "CPM-118", qty: 24000, stage: 7, elapsed: 58, variance: 0, contacted: 9 },
  { id: "PO-4418", sku: "CPM-207", qty: 15000, stage: 6, elapsed: 47, variance: 4, contacted: 4 },
  { id: "PO-4419", sku: "CPM-142", qty: 12000, stage: 5, elapsed: 33, variance: 0, contacted: 12 },
  { id: "PO-4420", sku: "CPM-101", qty: 20000, stage: 4, elapsed: 9, variance: 0, contacted: 6 },
  { id: "PO-4421", sku: "CPM-207", qty: 9000, stage: 3, elapsed: 3, variance: 0, contacted: 2 },
  { id: "PO-4422", sku: "CPM-260", qty: 8000, stage: 5, elapsed: 30, variance: 6, contacted: 11 },
  { id: "PO-4423", sku: "CPM-118", qty: 18000, stage: 6, elapsed: 52, variance: 9, contacted: 14 },
  { id: "PO-4424", sku: "CPM-176", qty: 14000, stage: 7, elapsed: 27, variance: 0, contacted: 3 },
  { id: "PO-4425", sku: "CPM-233", qty: 30000, stage: 5, elapsed: 20, variance: 0, contacted: 8 },
  { id: "PO-4426", sku: "CPM-288", qty: 16000, stage: 8, elapsed: 50, variance: 0, contacted: 0 },
  { id: "PO-4427", sku: "CPM-101", qty: 22000, stage: 3, elapsed: 2, variance: 0, contacted: 1 },
  { id: "PO-4428", sku: "CPM-260", qty: 9500, stage: 4, elapsed: 7, variance: 2, contacted: 5 },
];

/* ---------------- purchase requisitions ---------------- */
export type Pr = {
  id: string;
  sku: string;
  qty: number;
  stage: 1 | 2;
  trigger: string;
  neededBy: string;
  urgency: "Critical" | "High" | "Normal";
};

export const PRS: Pr[] = [
  { id: "PR-0912", sku: "CPM-207", qty: 12000, stage: 1, trigger: "Run-out W31 · below safety stock", neededBy: "Aug 20", urgency: "Critical" },
  { id: "PR-0913", sku: "CPM-142", qty: 10000, stage: 1, trigger: "Run-out W32 · cover 3.1 wks", neededBy: "Aug 28", urgency: "Critical" },
  { id: "PR-0914", sku: "CPM-118", qty: 20000, stage: 1, trigger: "Coverage gap W36", neededBy: "Sep 12", urgency: "High" },
  { id: "PR-0915", sku: "CPM-233", qty: 25000, stage: 1, trigger: "Cycle replenishment · MOQ 10k", neededBy: "Oct 02", urgency: "Normal" },
  { id: "PR-0916", sku: "CPM-176", qty: 12000, stage: 1, trigger: "Seasonal pre-build (Oct peak)", neededBy: "Oct 15", urgency: "Normal" },
  { id: "PR-0910", sku: "CPM-288", qty: 16000, stage: 2, trigger: "Approved · awaiting PO issue", neededBy: "Sep 05", urgency: "High" },
  { id: "PR-0911", sku: "CPM-260", qty: 9500, stage: 2, trigger: "Approved · awaiting PO issue", neededBy: "Sep 18", urgency: "Normal" },
];

/* ---------------- order helpers ---------------- */
export const poValue = (p: Po) => p.qty * SKU(p.sku).cost;
export const prValue = (p: Pr) => p.qty * SKU(p.sku).cost;

/** Planned days from PO issue to receipt (the tracker clock). */
export const poPlanned = (p: Po) => {
  const l = SKU(p.sku).lead;
  return l.production + l.shipping + l.customs + l.receiving;
};

export const poEta = (p: Po) => {
  const remaining = Math.max(0, poPlanned(p) + p.variance - p.elapsed);
  const d = new Date(TODAY);
  d.setDate(d.getDate() + remaining);
  return {
    days: remaining,
    week: CURWK + Math.round(remaining / 7),
    label: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
  };
};

export const poStatus = (p: Po): { tone: "ok" | "warn" | "crit"; label: string } =>
  p.variance >= 7
    ? { tone: "crit", label: "Late" }
    : p.variance > 0
      ? { tone: "warn", label: "At risk" }
      : { tone: "ok", label: "On plan" };

export const chaseDue = (p: Po) =>
  p.stage < 8 && (p.variance > 0 ? p.contacted >= 5 : p.contacted >= 10);

export const inTransitQty = (sku: string) =>
  POS.filter((p) => p.sku === sku && (p.stage === 6 || p.stage === 7)).reduce((a, p) => a + p.qty, 0);
export const onOrderQty = (sku: string) =>
  POS.filter((p) => p.sku === sku && p.stage >= 3 && p.stage <= 5).reduce((a, p) => a + p.qty, 0);

export const stageCount = (n: number) =>
  n <= 2 ? PRS.filter((p) => p.stage === n).length : POS.filter((p) => p.stage === n).length;
export const stageValue = (n: number) =>
  n <= 2
    ? PRS.filter((p) => p.stage === n).reduce((a, p) => a + prValue(p), 0)
    : POS.filter((p) => p.stage === n).reduce((a, p) => a + poValue(p), 0);

/* ---------------- inventory / order aggregates ---------------- */
export const TOT_ONHAND_UNITS = SKUS.reduce((a, s) => a + s.onhand, 0);
export const TOT_ONHAND_VAL = SKUS.reduce((a, s) => a + s.onhand * s.cost, 0);

export const ACTIVE_POS = POS.filter((p) => p.stage >= 3 && p.stage <= 7);
export const TRANSIT_POS = POS.filter((p) => p.stage === 6 || p.stage === 7);
export const ONORDER_POS = POS.filter((p) => p.stage >= 3 && p.stage <= 5);

export const TOT_TRANSIT_UNITS = TRANSIT_POS.reduce((a, p) => a + p.qty, 0);
export const TOT_TRANSIT_VAL = TRANSIT_POS.reduce((a, p) => a + poValue(p), 0);
export const TOT_ONORDER_UNITS = ONORDER_POS.reduce((a, p) => a + p.qty, 0);
export const TOT_ONORDER_VAL = ONORDER_POS.reduce((a, p) => a + poValue(p), 0);
export const TOT_OPEN_PO_VAL = ACTIVE_POS.reduce((a, p) => a + poValue(p), 0);

export const PENDING_PRS = PRS.filter((p) => p.stage === 1);
export const TOT_PR_PENDING_VAL = PENDING_PRS.reduce((a, p) => a + prValue(p), 0);
export const TOT_PR_PENDING_UNITS = PENDING_PRS.reduce((a, p) => a + p.qty, 0);

export const AVG_LEAD = Math.round(SKUS.reduce((a, s) => a + leadTotal(s.lead), 0) / SKUS.length);
export const ON_TIME_PCT = Math.round(
  (ACTIVE_POS.filter((p) => p.variance <= 0).length / ACTIVE_POS.length) * 100,
);
export const CHASE_COUNT = POS.filter(chaseDue).length;

/* ---------------- demand & P&L ---------------- */
export const WKLY_UNITS = SKUS.reduce((a, s) => a + s.wkly, 0);
export const WKLY_COGS = SKUS.reduce((a, s) => a + s.wkly * s.cost, 0);
export const WKLY_REVENUE = SKUS.reduce((a, s) => a + s.wkly * s.price, 0);

export const ANNUAL_UNITS = WKLY_UNITS * 52;
export const ANNUAL_REVENUE = WKLY_REVENUE * 52;
export const ANNUAL_COGS = WKLY_COGS * 52;
export const ANNUAL_GROSS_PROFIT = ANNUAL_REVENUE - ANNUAL_COGS;
export const GROSS_MARGIN_PCT = (ANNUAL_GROSS_PROFIT / ANNUAL_REVENUE) * 100;

/** Assumed operating cost base for the sample company. */
export const ANNUAL_OPEX = ANNUAL_REVENUE * 0.244;
export const ANNUAL_EBITDA = ANNUAL_GROSS_PROFIT - ANNUAL_OPEX;
export const EBITDA_MARGIN_PCT = (ANNUAL_EBITDA / ANNUAL_REVENUE) * 100;

/* ---------------- working capital ---------------- */
export const DSO = 38;
export const DPO = Math.round(
  SKUS.reduce((a, s) => a + VENDOR(s.origin).terms * (s.wkly * s.cost), 0) / WKLY_COGS,
);
export const DIO = Math.round((TOT_ONHAND_VAL / ANNUAL_COGS) * 365);
export const CCC = DIO + DSO - DPO;

export const AR = (ANNUAL_REVENUE / 365) * DSO;
export const AP = (ANNUAL_COGS / 365) * DPO;
export const WORKING_CAPITAL = TOT_ONHAND_VAL + AR - AP;
/**
 * Aggregate DIO hides the truth: fast movers pull the average down while
 * slow movers quietly trap cash. So excess is computed PER SKU against the
 * target, then summed — the number a CFO can actually act on.
 */
export const DIO_TARGET = 60;
export const SKU_INVENTORY = SKUS.map((s) => {
  const annualCogs = s.wkly * 52 * s.cost;
  const inv = s.onhand * s.cost;
  const target = (annualCogs / 365) * DIO_TARGET;
  return {
    id: s.id,
    name: s.name,
    inv,
    target,
    excess: Math.max(0, inv - target),
    dio: Math.round((inv / annualCogs) * 365),
  };
}).sort((a, b) => b.excess - a.excess);

/** Cash tied up above a 60-day cover target, summed across SKUs. */
export const CASH_RELEASE = SKU_INVENTORY.reduce((a, x) => a + x.excess, 0);
export const SLOW_MOVERS = SKU_INVENTORY.filter((x) => x.dio > 90);
export const SLOW_MOVER_VAL = SLOW_MOVERS.reduce((a, x) => a + x.inv, 0);
export const SLOW_MOVER_SHARE = (SLOW_MOVER_VAL / TOT_ONHAND_VAL) * 100;

/* ---------------- coverage horizon ---------------- */
export const HORIZON_WEEKS = 26;
export const HORIZON_DEMAND_COST = WKLY_COGS * HORIZON_WEEKS;
export const TOTAL_SUPPLY_VAL =
  TOT_ONHAND_VAL + TOT_TRANSIT_VAL + TOT_ONORDER_VAL + TOT_PR_PENDING_VAL;
export const SUPPLY_COVER_WEEKS = TOTAL_SUPPLY_VAL / WKLY_COGS;

/* ---------------- formatting ---------------- */
export const fmt = (n: number) => Math.round(n).toLocaleString("en-US");
export const usd = (n: number) => "$" + Math.round(n).toLocaleString("en-US");
export const usdM = (n: number) =>
  n >= 1e6 ? "$" + (n / 1e6).toFixed(2) + "M" : "$" + Math.round(n / 1e3) + "K";
export const pct = (n: number) => n.toFixed(1) + "%";

/* ---------------- vendor follow-up ---------------- */
export function followUpHref(p: Po) {
  const s = SKU(p.sku);
  const v = VENDOR(s.origin);
  const eta = poEta(p);
  const planned = poPlanned(p);
  const subject = `Follow-up: ${p.id} · ${p.sku} (${s.name}) · ETA ${eta.label}${p.variance > 0 ? ` — running +${p.variance}d` : ""}`;
  const body = [
    `Hi ${v.contact.split(" ")[0]},`,
    ``,
    `Checking in on ${p.id} — ${p.sku} (${s.name}), ${fmt(p.qty)} units.`,
    ``,
    `Current stage: ${STAGES[p.stage - 1].name} (stage ${p.stage} of 8)`,
    `Day ${p.elapsed} of ${planned + p.variance} · ETA ${eta.label} (${eta.days} days out)`,
    p.variance > 0
      ? `This order is tracking ${p.variance} days behind the agreed lead time.`
      : `This order is currently on plan.`,
    ``,
    `Could you confirm the current status and the expected ship / arrival date?`,
    ``,
    `Thanks,`,
  ].join("\n");
  return `mailto:${v.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}
