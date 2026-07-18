"use client";

import type { ReactNode } from "react";
import {
  SKUS, VENDOR, ACTIVE_POS, PENDING_PRS,
  inTransitQty, onOrderQty,
  TOT_ONHAND_VAL, TOT_TRANSIT_VAL, TOT_ONORDER_VAL, TOT_PR_PENDING_VAL,
  TOTAL_SUPPLY_VAL, HORIZON_DEMAND_COST, HORIZON_WEEKS, SUPPLY_COVER_WEEKS,
  WKLY_COGS, ANNUAL_REVENUE, ANNUAL_COGS, ANNUAL_GROSS_PROFIT, GROSS_MARGIN_PCT,
  ANNUAL_OPEX, ANNUAL_EBITDA, EBITDA_MARGIN_PCT,
  DIO, DSO, DPO, CCC, WORKING_CAPITAL, CASH_RELEASE, DIO_TARGET,
  AVG_LEAD, ON_TIME_PCT, CHASE_COUNT, TOT_ONHAND_UNITS,
  fmt, usdM, pct,
} from "@/lib/sampleData";

const ACCENT = "var(--color-accent)";
const CYAN = "var(--color-cyan)";
const VIOLET = "var(--color-violet)";
const MUTED = "var(--color-muted)";
const HAIR = "var(--color-border-hair)";
const RED = "#f2555a";
const AMBER = "#f5a623";

/* ---------------- atoms ---------------- */
function Kpi({ label, value, sub, tone }: { label: string; value: string; sub?: string; tone?: "good" | "bad" | "warn" }) {
  const c = tone === "good" ? "text-accent" : tone === "bad" ? "text-[#f2555a]" : tone === "warn" ? "text-[#f5a623]" : "text-fg";
  return (
    <div className="glass rounded-xl p-4">
      <div className="font-mono text-[10px] uppercase tracking-[0.15em] text-muted">{label}</div>
      <div className={`mt-2 font-mono text-2xl font-semibold ${c}`}>{value}</div>
      {sub && <div className="mt-1 font-mono text-[11px] text-muted">{sub}</div>}
    </div>
  );
}
function Card({ label, right, children }: { label: string; right?: ReactNode; children: ReactNode }) {
  return (
    <div className="glass rounded-xl p-4">
      <div className="mb-3 flex items-center justify-between font-mono text-xs text-muted">
        <span className="text-cyan">{label}</span>
        {right}
      </div>
      {children}
    </div>
  );
}
function Th({ children, l }: { children: ReactNode; l?: boolean }) {
  return <th className={`whitespace-nowrap border-b border-border-hair bg-surface/60 px-3 py-2.5 font-mono text-[10px] font-semibold uppercase tracking-wide text-muted ${l ? "text-left" : "text-right"}`}>{children}</th>;
}
function Td({ children, l, cls = "" }: { children: ReactNode; l?: boolean; cls?: string }) {
  return <td className={`whitespace-nowrap border-b border-border-hair/60 px-3 py-2 font-mono text-xs tabular-nums ${l ? "text-left" : "text-right"} ${cls}`}>{children}</td>;
}

/* ================= SANKEY ================= */
/* Conserved flow: supply sources -> pipeline -> demand coverage.       */
const SW = 940, SH = 340, NODE = 13, TOP = 26, BOT = 24;

type Flow = { label: string; value: number; color: string; note: string };

function Sankey() {
  const sources: Flow[] = [
    { label: "On-Hand Inventory", value: TOT_ONHAND_VAL, color: ACCENT, note: `${fmt(TOT_ONHAND_UNITS)} units` },
    { label: "In Transit", value: TOT_TRANSIT_VAL, color: CYAN, note: "stages 06–07" },
    { label: "On Order", value: TOT_ONORDER_VAL, color: VIOLET, note: "stages 03–05" },
    { label: "Proposed PRs", value: TOT_PR_PENDING_VAL, color: AMBER, note: "awaiting approval" },
  ];
  const total = TOTAL_SUPPLY_VAL;
  const covered = Math.min(total, HORIZON_DEMAND_COST);
  const buffer = Math.max(0, total - HORIZON_DEMAND_COST);
  const sinks: Flow[] = [
    { label: `Demand, next ${HORIZON_WEEKS} wks`, value: covered, color: ACCENT, note: "consumed as COGS" },
    { label: "Residual buffer", value: buffer, color: MUTED, note: "carried beyond horizon" },
  ];

  const usable = SH - TOP - BOT;
  const gap = 10;
  const scale = (usable - gap * (sources.length - 1)) / total;

  // left column geometry
  let y = TOP;
  const srcGeo = sources.map((f) => {
    const h = f.value * scale;
    const g = { ...f, y, h };
    y += h + gap;
    return g;
  });

  // middle node = full height (no gaps)
  const midH = total * scale;
  const midY = TOP + (usable - midH) / 2;

  // right column
  const gapR = 10;
  const scaleR = (usable - gapR) / total;
  let yr = TOP;
  const sinkGeo = sinks.map((f) => {
    const h = Math.max(f.value * scaleR, 2);
    const g = { ...f, y: yr, h };
    yr += h + gapR;
    return g;
  });

  const x0 = 150, x1 = 470, x2 = 790;

  // link stacking inside the middle node
  let mIn = midY;
  const inLinks = srcGeo.map((s) => {
    const h = s.value * scale;
    const l = { from: s, y1: mIn, h };
    mIn += h;
    return l;
  });
  let mOut = midY;
  const outLinks = sinkGeo.map((s) => {
    const h = s.value * scale;
    const l = { to: s, y0: mOut, h };
    mOut += h;
    return l;
  });

  const ribbon = (xa: number, ya: number, xb: number, yb: number, ha: number, hb: number) => {
    const xm = (xa + xb) / 2;
    return `M ${xa} ${ya} C ${xm} ${ya}, ${xm} ${yb}, ${xb} ${yb} L ${xb} ${yb + hb} C ${xm} ${yb + hb}, ${xm} ${ya + ha}, ${xa} ${ya + ha} Z`;
  };

  return (
    <svg viewBox={`0 0 ${SW} ${SH}`} className="w-full">
      {/* links in */}
      {inLinks.map((l, i) => (
        <path key={"i" + i} d={ribbon(x0 + NODE, l.from.y, x1, l.y1, l.h, l.h)} fill={l.from.color} opacity={0.22} />
      ))}
      {/* links out */}
      {outLinks.map((l, i) => (
        <path key={"o" + i} d={ribbon(x1 + NODE, l.y0, x2, l.to.y, l.h, l.to.h)} fill={l.to.color} opacity={0.22} />
      ))}

      {/* source nodes */}
      {srcGeo.map((s, i) => (
        <g key={i}>
          <rect x={x0} y={s.y} width={NODE} height={s.h} rx={2.5} fill={s.color} />
          <text x={x0 - 10} y={s.y + s.h / 2 - 3} textAnchor="end" fontSize="11.5" fill="var(--color-fg)" fontFamily="var(--font-mono)">{s.label}</text>
          <text x={x0 - 10} y={s.y + s.h / 2 + 11} textAnchor="end" fontSize="10.5" fill={s.color} fontFamily="var(--font-mono)">{usdM(s.value)}</text>
        </g>
      ))}

      {/* middle node */}
      <rect x={x1} y={midY} width={NODE} height={midH} rx={2.5} fill="var(--color-fg)" opacity={0.85} />
      <text x={x1 + NODE / 2} y={midY - 10} textAnchor="middle" fontSize="11.5" fill="var(--color-fg)" fontFamily="var(--font-mono)">Total Supply Pipeline</text>
      <text x={x1 + NODE / 2} y={midY + midH + 18} textAnchor="middle" fontSize="12" fill="var(--color-fg)" fontFamily="var(--font-mono)" fontWeight="600">{usdM(total)}</text>
      <text x={x1 + NODE / 2} y={midY + midH + 32} textAnchor="middle" fontSize="10" fill={MUTED} fontFamily="var(--font-mono)">{SUPPLY_COVER_WEEKS.toFixed(1)} wks of cover</text>

      {/* sink nodes */}
      {sinkGeo.map((s, i) => (
        <g key={i}>
          <rect x={x2} y={s.y} width={NODE} height={s.h} rx={2.5} fill={s.color} />
          <text x={x2 + NODE + 10} y={s.y + s.h / 2 - 3} fontSize="11.5" fill="var(--color-fg)" fontFamily="var(--font-mono)">{s.label}</text>
          <text x={x2 + NODE + 10} y={s.y + s.h / 2 + 11} fontSize="10.5" fill={s.color} fontFamily="var(--font-mono)">{usdM(s.value)} · {s.note}</text>
        </g>
      ))}
    </svg>
  );
}

/* ================= P&L WATERFALL ================= */
const WW = 720, WH = 250, WPAD = 34;
function Waterfall() {
  const steps = [
    { label: "Revenue", value: ANNUAL_REVENUE, kind: "total" as const, color: CYAN },
    { label: "COGS", value: -ANNUAL_COGS, kind: "delta" as const, color: RED },
    { label: "Gross Profit", value: ANNUAL_GROSS_PROFIT, kind: "total" as const, color: ACCENT },
    { label: "Opex", value: -ANNUAL_OPEX, kind: "delta" as const, color: AMBER },
    { label: "EBITDA", value: ANNUAL_EBITDA, kind: "total" as const, color: ACCENT },
  ];
  const max = ANNUAL_REVENUE * 1.08;
  const h = (v: number) => (Math.abs(v) / max) * (WH - WPAD * 2);
  const yOf = (v: number) => WH - WPAD - (v / max) * (WH - WPAD * 2);
  const slot = (WW - WPAD * 2) / steps.length;
  const bw = Math.min(56, slot * 0.5);

  let running = 0;
  const bars = steps.map((s) => {
    let top: number, height: number;
    if (s.kind === "total") {
      running = s.value;
      height = h(s.value);
      top = yOf(s.value);
    } else {
      const start = running;
      running = running + s.value;
      height = h(s.value);
      top = yOf(start);
    }
    return { ...s, top, height };
  });

  return (
    <svg viewBox={`0 0 ${WW} ${WH}`} className="w-full">
      {[0, 0.25, 0.5, 0.75, 1].map((f, i) => {
        const y = WPAD + f * (WH - WPAD * 2);
        return <line key={i} x1={WPAD} x2={WW - WPAD} y1={y} y2={y} stroke={HAIR} strokeWidth={1} />;
      })}
      {bars.map((b, i) => {
        const cx = WPAD + slot * i + slot / 2;
        return (
          <g key={i}>
            <rect x={cx - bw / 2} y={b.top} width={bw} height={Math.max(b.height, 2)} rx={2} fill={b.color} opacity={b.kind === "total" ? 0.9 : 0.7} />
            <text x={cx} y={b.top - 7} textAnchor="middle" fontSize="10.5" fill="var(--color-fg)" fontFamily="var(--font-mono)">{usdM(Math.abs(b.value))}</text>
            <text x={cx} y={WH - WPAD + 15} textAnchor="middle" fontSize="10" fill={MUTED} fontFamily="var(--font-mono)">{b.label}</text>
          </g>
        );
      })}
    </svg>
  );
}

/* ================= CCC BAR ================= */
function CccBar() {
  const max = DIO + DSO;
  const seg = [
    { label: "DIO", v: DIO, color: ACCENT, help: "inventory days" },
    { label: "DSO", v: DSO, color: CYAN, help: "receivable days" },
  ];
  return (
    <div className="flex flex-col gap-3">
      <div>
        <div className="mb-1 flex justify-between font-mono text-[11px] text-muted">
          <span>Cash tied up</span>
          <span className="text-fg">{DIO + DSO}d</span>
        </div>
        <div className="flex h-5 overflow-hidden rounded-md">
          {seg.map((s) => (
            <div key={s.label} title={`${s.label}: ${s.v}d — ${s.help}`} style={{ width: `${(s.v / max) * 100}%`, background: s.color, opacity: 0.85 }} className="flex items-center justify-center">
              <span className="font-mono text-[10px] text-bg">{s.label} {s.v}d</span>
            </div>
          ))}
        </div>
      </div>
      <div>
        <div className="mb-1 flex justify-between font-mono text-[11px] text-muted">
          <span>Funded by suppliers</span>
          <span className="text-fg">{DPO}d</span>
        </div>
        <div className="flex h-5 overflow-hidden rounded-md bg-surface">
          <div style={{ width: `${(DPO / max) * 100}%`, background: VIOLET, opacity: 0.85 }} className="flex items-center justify-center">
            <span className="font-mono text-[10px] text-bg">DPO {DPO}d</span>
          </div>
        </div>
      </div>
      <div className="flex items-center justify-between rounded-lg border border-accent/30 bg-accent/10 px-3 py-2">
        <span className="font-mono text-[11px] text-muted">Cash conversion cycle</span>
        <span className="font-mono text-lg font-semibold text-accent">{CCC} days</span>
      </div>
    </div>
  );
}

export function ExecDashboard() {
  const rows = SKUS.map((s) => {
    const rev = s.wkly * 52 * s.price;
    const cogs = s.wkly * 52 * s.cost;
    const inv = s.onhand * s.cost;
    const dio = Math.round((inv / cogs) * 365);
    const pipeline = s.onhand + inTransitQty(s.id) + onOrderQty(s.id);
    return { s, rev, cogs, gp: rev - cogs, gm: ((rev - cogs) / rev) * 100, inv, dio, cover: pipeline / s.wkly };
  }).sort((a, b) => b.rev - a.rev);

  return (
    <div className="flex flex-col gap-6">
      {/* headline KPIs */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
        <Kpi label="Annual Revenue" value={usdM(ANNUAL_REVENUE)} sub={`${fmt(SKUS.reduce((a, s) => a + s.wkly * 52, 0))} units/yr`} />
        <Kpi label="Gross Margin" value={pct(GROSS_MARGIN_PCT)} sub={usdM(ANNUAL_GROSS_PROFIT) + " GP"} tone="good" />
        <Kpi label="EBITDA" value={usdM(ANNUAL_EBITDA)} sub={pct(EBITDA_MARGIN_PCT) + " margin"} tone={ANNUAL_EBITDA > 0 ? "good" : "bad"} />
        <Kpi label="Working Capital" value={usdM(WORKING_CAPITAL)} sub="inventory + AR − AP" />
        <Kpi label="Cash Conversion" value={`${CCC}d`} sub={`DIO ${DIO} + DSO ${DSO} − DPO ${DPO}`} tone={CCC > 90 ? "bad" : "warn"} />
        <Kpi label="Cash Release @ 60d DIO" value={usdM(CASH_RELEASE)} sub={`from DIO ${DIO}d → ${DIO_TARGET}d`} tone="good" />
      </div>

      {/* SANKEY */}
      <Card label="business_flow()" right={<span>supply → demand · at landed cost</span>}>
        <Sankey />
        <p className="mt-2 font-mono text-[10.5px] leading-relaxed text-muted">
          Every dollar of supply — on the shelf, on the water, on order, or still awaiting approval — mapped against the next {HORIZON_WEEKS} weeks of demand.
          Total pipeline <span className="text-fg">{usdM(TOTAL_SUPPLY_VAL)}</span> covers <span className="text-fg">{SUPPLY_COVER_WEEKS.toFixed(1)} weeks</span> against a
          {" "}{HORIZON_WEEKS}-week requirement of <span className="text-fg">{usdM(HORIZON_DEMAND_COST)}</span>.
        </p>
      </Card>

      {/* P&L + working capital */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card label="margin_bridge()" right={<span>annualised</span>}>
          <Waterfall />
          <p className="mt-2 font-mono text-[10.5px] text-muted">
            {pct(GROSS_MARGIN_PCT)} gross margin, {pct(EBITDA_MARGIN_PCT)} EBITDA margin on {usdM(ANNUAL_REVENUE)} of revenue.
          </p>
        </Card>
        <Card label="cash_conversion_cycle()" right={<span>days</span>}>
          <CccBar />
          <p className="mt-3 font-mono text-[10.5px] leading-relaxed text-muted">
            Inventory sits <span className="text-fg">{DIO} days</span> before it sells. Pulling that to {DIO_TARGET} days frees{" "}
            <span className="text-accent">{usdM(CASH_RELEASE)}</span> of cash without touching revenue.
          </p>
        </Card>
      </div>

      {/* operating health */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Kpi label="Avg Lead Time" value={`${AVG_LEAD}d`} sub="requisition → receipt" />
        <Kpi label="Orders On Plan" value={`${ON_TIME_PCT}%`} sub={`${ACTIVE_POS.length} live orders`} tone={ON_TIME_PCT >= 75 ? "good" : "bad"} />
        <Kpi label="Vendor Chases Due" value={String(CHASE_COUNT)} sub="no contact 5d+ while late" tone={CHASE_COUNT > 0 ? "warn" : "good"} />
        <Kpi label="PRs Awaiting Sign-off" value={String(PENDING_PRS.length)} sub={usdM(TOT_PR_PENDING_VAL)} tone="warn" />
      </div>

      {/* SKU flow-through */}
      <div className="glass overflow-hidden rounded-xl">
        <div className="flex items-center justify-between border-b border-border-hair px-4 py-3">
          <span className="font-mono text-[13px] font-semibold text-fg">Flow-through by SKU</span>
          <span className="font-mono text-[11px] text-muted">revenue → margin → cash</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr><Th l>SKU</Th><Th l>Product</Th><Th l>Vendor</Th><Th>Revenue</Th><Th>COGS</Th><Th>Gross Profit</Th><Th>GM%</Th><Th>Inventory</Th><Th>DIO</Th><Th>Cover (wks)</Th></tr>
            </thead>
            <tbody>
              {rows.map(({ s, rev, cogs, gp, gm, inv, dio, cover }) => (
                <tr key={s.id} className="hover:bg-surface/40">
                  <Td l cls="text-cyan font-semibold">{s.id}</Td>
                  <Td l cls="font-sans text-fg">{s.name}</Td>
                  <Td l cls="text-muted">{VENDOR(s.origin).name}</Td>
                  <Td>{usdM(rev)}</Td>
                  <Td cls="text-muted">{usdM(cogs)}</Td>
                  <Td cls="text-accent">{usdM(gp)}</Td>
                  <Td cls={gm >= 40 ? "text-accent" : gm >= 35 ? "text-fg" : "text-[#f5a623]"}>{gm.toFixed(1)}%</Td>
                  <Td>{usdM(inv)}</Td>
                  <Td cls={dio > 90 ? "text-[#f2555a]" : dio > 60 ? "text-[#f5a623]" : "text-accent"}>{dio}</Td>
                  <Td cls="text-muted">{cover.toFixed(1)}</Td>
                </tr>
              ))}
              <tr className="bg-surface/60">
                <Td l cls="font-semibold text-fg">TOTAL</Td>
                <Td l>—</Td><Td l>—</Td>
                <Td cls="font-semibold text-fg">{usdM(ANNUAL_REVENUE)}</Td>
                <Td cls="text-muted">{usdM(ANNUAL_COGS)}</Td>
                <Td cls="font-semibold text-accent">{usdM(ANNUAL_GROSS_PROFIT)}</Td>
                <Td cls="font-semibold text-fg">{GROSS_MARGIN_PCT.toFixed(1)}%</Td>
                <Td cls="font-semibold text-fg">{usdM(TOT_ONHAND_VAL)}</Td>
                <Td cls="font-semibold text-fg">{DIO}</Td>
                <Td cls="text-muted">{(TOTAL_SUPPLY_VAL / WKLY_COGS).toFixed(1)}</Td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted">
        // sample data · illustrative only · every figure computed from one shared dataset
      </p>
    </div>
  );
}
