"use client";

import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import { track } from "@/lib/analytics";
import {
  SKUS, SKU, POS, VENDOR, STAGES, CURWK,
  poValue, poEta, poStatus, inTransitQty, onOrderQty,
  TOT_ONHAND_UNITS, TOT_ONHAND_VAL, TOT_OPEN_PO_VAL, TOT_TRANSIT_UNITS,
  ACTIVE_POS, fmt, usd, usdM,
} from "@/lib/sampleData";
import type { Sku } from "@/lib/sampleData";

/* ------------------------------------------------------------------ */
/*  The four recurring reports. All figures compute from              */
/*  @/lib/sampleData so they tie to /pipeline and /dashboard.          */
/* ------------------------------------------------------------------ */

const ACCENT = "var(--color-accent)";
const CYAN = "var(--color-cyan)";
const VIOLET = "var(--color-violet)";
const MUTED = "var(--color-muted)";
const HAIR = "var(--color-border-hair)";
const RED = "#f2555a";
const AMBER = "#f5a623";

const MONTHS = ["Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"];
const FUT = ["Aug", "Sep", "Oct", "Nov", "Dec", "Jan"];

function rng(seed: number) {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return () => ((s = (s * 16807) % 2147483647) - 1) / 2147483646;
}

/* ---- run-out, using real PO arrival weeks ---- */
type RunRow = Sku & { wc: number; roWk: number; date: string; st: "ok" | "warn" | "crit"; lbl: string; inbound: number };
const RUNOUT: RunRow[] = SKUS.map((s) => {
  const wc = s.onhand / s.wkly;
  const roWk = Math.round(CURWK + wc);
  const d = new Date(2026, 0, 1);
  d.setDate(d.getDate() + (roWk - 1) * 7);
  const date = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  let st: "ok" | "warn" | "crit" = "ok";
  let lbl = "Healthy";
  if (wc < 4) { st = "crit"; lbl = "Critical"; } else if (wc < 7) { st = "warn"; lbl = "Watch"; }
  const inbound = inTransitQty(s.id) + onOrderQty(s.id);
  if (st !== "ok" && inbound > 0) lbl += " · PO";
  return { ...s, wc, roWk, date, st, lbl, inbound };
});

/** 12-week on-hand projection; receipts land on their actual PO ETA week. */
function projCurve(s: Sku) {
  const arrivals: Record<number, number> = {};
  POS.filter((p) => p.sku === s.id && p.stage >= 3 && p.stage <= 7).forEach((p) => {
    const wk = Math.max(0, poEta(p).week - CURWK);
    arrivals[wk] = (arrivals[wk] || 0) + p.qty;
  });
  let oh = s.onhand;
  const arr: number[] = [];
  for (let w = 0; w < 12; w++) {
    if (arrivals[w]) oh += arrivals[w];
    arr.push(Math.max(0, Math.round(oh)));
    oh -= s.wkly;
  }
  return arr;
}

/* ---- forecast history ---- */
type Fc = { m: string; fcst: number; act: number; varc: number; varpct: number };
const FCAST: Record<string, Fc[]> = {};
SKUS.forEach((s) => {
  const r = rng(s.id.charCodeAt(6) * 11 + 5);
  const base = s.wkly * 4.3;
  FCAST[s.id] = MONTHS.map((m, i) => {
    const seas = 1 + 0.18 * Math.sin((i / 12) * Math.PI * 2 - 0.6);
    const fcst = Math.round(base * seas * (0.95 + r() * 0.12));
    const err = (r() - 0.45) * 0.22;
    const act = Math.round(fcst * (1 - err));
    return { m, fcst, act, varc: act - fcst, varpct: ((act - fcst) / fcst) * 100 };
  });
});
const BIAS = MONTHS.map((m, i) => {
  let f = 0, a = 0;
  SKUS.forEach((s) => { f += FCAST[s.id][i].fcst; a += FCAST[s.id][i].act; });
  return { m, pct: ((a - f) / f) * 100 };
});
const ALL_FC = SKUS.flatMap((s) => FCAST[s.id]);
const MAPE = ALL_FC.reduce((a, x) => a + Math.abs(x.varpct), 0) / ALL_FC.length;
const NET_BIAS = (() => {
  let f = 0, a = 0;
  ALL_FC.forEach((x) => { f += x.fcst; a += x.act; });
  return ((a - f) / f) * 100;
})();
const WORST_SKU = SKUS.map((s) => ({
  id: s.id,
  mape: FCAST[s.id].reduce((a, x) => a + Math.abs(x.varpct), 0) / 12,
})).sort((a, b) => b.mape - a.mape)[0];

/* ---- generated monthly schedule ---- */
type Sched = { m: string; sku: string; cls: string; adjF: number; biasAdj: number; open: number; ss: number; order: number; endInv: number; act: string; plan: boolean };
const SCHED: Sched[] = [];
SKUS.forEach((s) => {
  let inv = s.onhand + inTransitQty(s.id) + onOrderQty(s.id);
  FUT.forEach((m, i) => {
    const seas = 1 + 0.2 * Math.sin(((i + 8) / 12) * Math.PI * 2 - 0.6);
    const raw = Math.round(s.wkly * 4.3 * seas);
    const biasAdj = Math.round(raw * (NET_BIAS / 100));
    const adjF = raw + biasAdj;
    const open = Math.round(inv);
    const need = adjF + s.ss - open;
    const order = need > 0 ? Math.ceil(need / s.moq) * s.moq : 0;
    const endInv = open + order - adjF;
    inv = endInv;
    SCHED.push({ m, sku: s.id, cls: s.cls, adjF, biasAdj, open, ss: s.ss, order, endInv, act: order > 0 ? (s.cls === "A" ? "Build" : "Buy") : "Hold", plan: order > 0 });
  });
});
const SCHED_UNITS = SCHED.reduce((a, r) => a + r.order, 0);
const SCHED_SPEND = SCHED.reduce((a, r) => a + r.order * SKU(r.sku).cost, 0);
const PEAK_MONTH = FUT.map((m) => ({ m, v: SCHED.filter((r) => r.m === m).reduce((a, r) => a + r.order, 0) })).sort((a, b) => b.v - a.v)[0];

/* ---- PO pipeline ---- */
const SORTED_POS = ACTIVE_POS.slice().sort((a, b) => poEta(a).days - poEta(b).days);
const NEXT_RECEIPT = SORTED_POS[0];
const AT_RISK_VAL = ACTIVE_POS.filter((p) => p.variance > 0).reduce((a, p) => a + poValue(p), 0);
const CRIT_COUNT = RUNOUT.filter((s) => s.st === "crit").length;
const AVG_COVER = RUNOUT.reduce((a, s) => a + s.wc, 0) / RUNOUT.length;

/* ---------------- chart primitives ---------------- */
const W = 720, H = 240, PAD = 34;
function niceMax(v: number) {
  const p = Math.pow(10, Math.floor(Math.log10(v)));
  return Math.ceil(v / p) * p;
}
function Grid({ max, unit }: { max: number; unit?: string }) {
  return (
    <>
      {Array.from({ length: 4 }).map((_, i) => {
        const y = PAD + (i * (H - PAD * 2)) / 3;
        const val = max - (i * max) / 3;
        return (
          <g key={i}>
            <line x1={PAD} x2={W - PAD} y1={y} y2={y} stroke={HAIR} strokeWidth={1} />
            <text x={PAD - 6} y={y + 3} textAnchor="end" fontSize="9" fill={MUTED} fontFamily="var(--font-mono)">
              {val >= 1000 ? (val / 1000).toFixed(0) + "k" : Math.round(val)}
            </text>
          </g>
        );
      })}
      {unit && (
        <text x={PAD - 6} y={PAD - 12} textAnchor="end" fontSize="8.5" fill={MUTED} fontFamily="var(--font-mono)">{unit}</text>
      )}
    </>
  );
}
function XLabels({ labels }: { labels: string[] }) {
  const step = (W - PAD * 2) / (labels.length - 1);
  return (
    <>
      {labels.map((l, i) => (
        <text key={i} x={PAD + i * step} y={H - PAD + 16} textAnchor="middle" fontSize="9" fill={MUTED} fontFamily="var(--font-mono)">{l}</text>
      ))}
    </>
  );
}
function linePath(vals: number[], max: number, min = 0) {
  const step = (W - PAD * 2) / (vals.length - 1);
  return vals.map((v, i) => {
    const x = PAD + i * step;
    const y = H - PAD - ((v - min) / (max - min)) * (H - PAD * 2);
    return `${i === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`;
  }).join(" ");
}
function ChartCard({ label, right, children }: { label: string; right?: ReactNode; children: ReactNode }) {
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
function LineChart({ series, labels, max, min = 0, unit }: { series: { data: number[]; color: string; dash?: boolean }[]; labels: string[]; max: number; min?: number; unit?: string }) {
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
      <Grid max={max} unit={unit} />
      <XLabels labels={labels} />
      {series.map((s, i) => (
        <path key={i} d={linePath(s.data, max, min)} fill="none" stroke={s.color} strokeWidth={2.25} strokeDasharray={s.dash ? "6 6" : undefined} strokeLinecap="round" strokeLinejoin="round" />
      ))}
      {series[0]?.data.map((v, i) => {
        const step = (W - PAD * 2) / (series[0].data.length - 1);
        const y = H - PAD - ((v - min) / (max - min)) * (H - PAD * 2);
        return <circle key={i} cx={PAD + i * step} cy={y} r={2.4} fill={series[0].color} />;
      })}
    </svg>
  );
}
function GroupBars({ groups, labels, colors, max, unit }: { groups: number[][]; labels: string[]; colors: string[]; max: number; unit?: string }) {
  const slot = (W - PAD * 2) / labels.length;
  const bw = Math.min(14, (slot * 0.7) / groups.length);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
      <Grid max={max} unit={unit} />
      <XLabels labels={labels} />
      {labels.map((_, i) => {
        const cx = PAD + slot * i + slot / 2;
        const start = cx - (bw * groups.length) / 2;
        return (
          <g key={i}>
            {groups.map((g, gi) => {
              const h = (g[i] / max) * (H - PAD * 2);
              return <rect key={gi} x={start + gi * bw} y={H - PAD - h} width={bw - 1.5} height={h} rx={1.5} fill={colors[gi]} />;
            })}
          </g>
        );
      })}
    </svg>
  );
}
function StackedBars({ labels, stacks, colors, keys, max, unit }: { labels: string[]; stacks: Record<string, number[]>; colors: Record<string, string>; keys: string[]; max: number; unit?: string }) {
  const slot = (W - PAD * 2) / labels.length;
  const bw = Math.min(34, slot * 0.5);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
      <Grid max={max} unit={unit} />
      <XLabels labels={labels} />
      {labels.map((_, i) => {
        const cx = PAD + slot * i + slot / 2;
        let acc = 0;
        return (
          <g key={i}>
            {keys.map((k) => {
              const h = (stacks[k][i] / max) * (H - PAD * 2);
              const y = H - PAD - acc - h;
              acc += h;
              return <rect key={k} x={cx - bw / 2} y={y} width={bw} height={h} fill={colors[k]} />;
            })}
          </g>
        );
      })}
    </svg>
  );
}
function BarLine({ labels, bars, line, barColor, lineColor, max, lineMax, unit }: { labels: string[]; bars: number[]; line: number[]; barColor: string; lineColor: string; max: number; lineMax: number; unit?: string }) {
  const slot = (W - PAD * 2) / labels.length;
  const bw = Math.min(30, slot * 0.5);
  const lp = line.map((v, i) => {
    const x = PAD + slot * i + slot / 2;
    const y = H - PAD - (v / lineMax) * (H - PAD * 2);
    return `${i === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`;
  }).join(" ");
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
      <Grid max={max} unit={unit} />
      <XLabels labels={labels} />
      {labels.map((_, i) => {
        const cx = PAD + slot * i + slot / 2;
        const h = (bars[i] / max) * (H - PAD * 2);
        return <rect key={i} x={cx - bw / 2} y={H - PAD - h} width={bw} height={h} rx={1.5} fill={barColor} />;
      })}
      <path d={lp} fill="none" stroke={lineColor} strokeWidth={2.25} strokeLinecap="round" />
      {line.map((v, i) => {
        const x = PAD + slot * i + slot / 2;
        const y = H - PAD - (v / lineMax) * (H - PAD * 2);
        return <circle key={i} cx={x} cy={y} r={2.4} fill={lineColor} />;
      })}
    </svg>
  );
}
function HBars({ items }: { items: { label: string; v: number; color: string }[] }) {
  const HH = items.length * 26 + 30;
  const max = niceMax(Math.max(...items.map((i) => i.v)));
  const left = 66;
  return (
    <svg viewBox={`0 0 ${W} ${HH}`} className="w-full">
      {[0, 0.25, 0.5, 0.75, 1].map((f, i) => {
        const x = left + f * (W - left - 20);
        return (
          <g key={i}>
            <line x1={x} x2={x} y1={8} y2={HH - 22} stroke={HAIR} strokeWidth={1} />
            <text x={x} y={HH - 8} textAnchor="middle" fontSize="9" fill={MUTED} fontFamily="var(--font-mono)">{Math.round(f * max)}</text>
          </g>
        );
      })}
      {items.map((it, i) => {
        const y = 12 + i * 26;
        const w = (it.v / max) * (W - left - 20);
        return (
          <g key={i}>
            <text x={left - 8} y={y + 12} textAnchor="end" fontSize="9.5" fill={MUTED} fontFamily="var(--font-mono)">{it.label}</text>
            <rect x={left} y={y + 3} width={Math.max(w, 1)} height={13} rx={2} fill={it.color} />
          </g>
        );
      })}
    </svg>
  );
}

/* ---------------- UI atoms ---------------- */
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
const pillCls: Record<string, string> = {
  ok: "bg-accent/12 text-accent",
  warn: "bg-[#f5a623]/15 text-[#f5a623]",
  crit: "bg-[#f2555a]/15 text-[#f2555a]",
  info: "bg-cyan/15 text-cyan",
  plan: "bg-violet/15 text-violet",
};
function Pill({ tone, children }: { tone: string; children: ReactNode }) {
  return <span className={`inline-block rounded-full px-2.5 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wide ${pillCls[tone]}`}>{children}</span>;
}
function Th({ children, l }: { children: ReactNode; l?: boolean }) {
  return <th className={`whitespace-nowrap border-b border-border-hair bg-surface/60 px-3 py-2.5 font-mono text-[10px] font-semibold uppercase tracking-wide text-muted ${l ? "text-left" : "text-right"}`}>{children}</th>;
}
function Td({ children, l, cls = "" }: { children: ReactNode; l?: boolean; cls?: string }) {
  return <td className={`whitespace-nowrap border-b border-border-hair/60 px-3 py-2 font-mono text-xs tabular-nums ${l ? "text-left" : "text-right"} ${cls}`}>{children}</td>;
}
function Panel({ title, hint, children }: { title: string; hint?: ReactNode; children: ReactNode }) {
  return (
    <div className="glass overflow-hidden rounded-xl">
      <div className="flex items-center justify-between border-b border-border-hair px-4 py-3">
        <span className="font-mono text-[13px] font-semibold text-fg">{title}</span>
        {hint && <span className="font-mono text-[11px] text-muted">{hint}</span>}
      </div>
      <div className="overflow-x-auto">{children}</div>
    </div>
  );
}

const TABS = [
  { id: "r1", label: "Weekly Run-Out" },
  { id: "r2", label: "Forecast vs Actuals" },
  { id: "r3", label: "Monthly Schedule" },
  { id: "r4", label: "Future PO Pipeline" },
];

export function ReportsBoard() {
  const [tab, setTab] = useState("r1");
  const [skuIdx, setSkuIdx] = useState(() => {
    const i = RUNOUT.findIndex((s) => s.st !== "ok");
    return i >= 0 ? i : 0;
  });
  const [fcSku, setFcSku] = useState(WORST_SKU.id);
  const [schedMonth, setSchedMonth] = useState("ALL");

  const wkLabels = useMemo(() => Array.from({ length: 12 }, (_, w) => "W" + (CURWK + w)), []);
  const selCurve = useMemo(() => projCurve(RUNOUT[skuIdx]), [skuIdx]);
  const curveMax = niceMax(Math.max(...selCurve, RUNOUT[skuIdx].ss) * 1.1);

  return (
    <div>
      <div className="mb-6 flex flex-wrap gap-1 rounded-lg border border-border-hair bg-surface/40 p-1">
        {TABS.map((t, i) => (
          <button key={t.id} onClick={() => { setTab(t.id); track("sample_tab_viewed", { page: "reports", tab: t.label }); }} className={`rounded-md px-3.5 py-2 font-mono text-[13px] transition-colors ${tab === t.id ? "bg-accent text-on-accent" : "text-muted hover:text-fg"}`}>
            <span className="mr-1.5 opacity-60">0{i + 1}</span>{t.label}
          </button>
        ))}
      </div>

      {/* ---------- R1 ---------- */}
      {tab === "r1" && (
        <div className="flex flex-col gap-4">
          <p className="font-mono text-xs text-muted">
            <span className="text-cyan">weekly_runout()</span> — projected on-hand by ISO week against forecast demand, with inbound POs landing on their tracked ETA. <span className="text-muted/70">Snapshot: week {CURWK}, FY26.</span>
          </p>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            <Kpi label="SKUs Critical (<4 wks)" value={String(CRIT_COUNT)} sub="cover below 4 weeks" tone="warn" />
            <Kpi label="On-Hand Units" value={fmt(TOT_ONHAND_UNITS)} sub="across 8 SKUs" />
            <Kpi label="On-Hand Value" value={usdM(TOT_ONHAND_VAL)} sub="at landed cost" />
            <Kpi label="Avg Weeks of Cover" value={AVG_COVER.toFixed(1)} sub="on-hand only" />
          </div>
          <div className="grid gap-4 lg:grid-cols-2">
            <ChartCard label="projected_on_hand()" right={
              <select value={skuIdx} onChange={(e) => setSkuIdx(Number(e.target.value))} className="rounded-md border border-border-hair bg-surface px-2 py-1 font-mono text-[11px] text-fg">
                {RUNOUT.map((s, i) => <option key={s.id} value={i}>{s.id} — {s.name}</option>)}
              </select>
            }>
              <LineChart labels={wkLabels} max={curveMax} unit="units" series={[{ data: selCurve, color: ACCENT }, { data: wkLabels.map(() => RUNOUT[skuIdx].ss), color: RED, dash: true }]} />
              <div className="mt-1 font-mono text-[10px] text-muted"><span style={{ color: ACCENT }}>●</span> on-hand&nbsp;&nbsp;<span style={{ color: RED }}>┄</span> safety stock</div>
            </ChartCard>
            <ChartCard label="weeks_of_cover()" right={<span>reorder = 4.0 wks</span>}>
              <HBars items={RUNOUT.map((s) => ({ label: s.id, v: +s.wc.toFixed(1), color: s.st === "crit" ? RED : s.st === "warn" ? AMBER : ACCENT }))} />
            </ChartCard>
          </div>
          <Panel title="Inventory Levels Schedule — all SKUs" hint="sample data">
            <table className="w-full border-collapse">
              <thead><tr><Th l>SKU</Th><Th l>Product</Th><Th>On-Hand</Th><Th>Wkly Dmd</Th><Th>Wks Cover</Th><Th>Run-Out</Th><Th>Inbound</Th><Th l>Status</Th></tr></thead>
              <tbody>
                {RUNOUT.map((s) => (
                  <tr key={s.id} className="hover:bg-surface/40">
                    <Td l cls="text-cyan font-semibold">{s.id}</Td>
                    <Td l cls="font-sans text-fg">{s.name}</Td>
                    <Td>{fmt(s.onhand)}</Td>
                    <Td cls="text-muted">{fmt(s.wkly)}</Td>
                    <Td cls={s.st === "crit" ? "text-[#f2555a]" : s.st === "warn" ? "text-[#f5a623]" : "text-fg"}>{s.wc.toFixed(1)}</Td>
                    <Td cls="text-muted">W{s.roWk} · {s.date}</Td>
                    <Td cls={s.inbound > 0 ? "text-accent" : "text-muted"}>{s.inbound > 0 ? fmt(s.inbound) : "—"}</Td>
                    <Td l><Pill tone={s.st}>{s.lbl}</Pill></Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Panel>
        </div>
      )}

      {/* ---------- R2 ---------- */}
      {tab === "r2" && (
        <div className="flex flex-col gap-4">
          <p className="font-mono text-xs text-muted">
            <span className="text-cyan">forecast_to_actual()</span> — trailing 12-month forecast vs shipped actuals. MAPE and directional bias feed the schedule in Report 03.
          </p>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            <Kpi label="Forecast Accuracy" value={(100 - MAPE).toFixed(1) + "%"} sub="1 − MAPE, 12-mo" tone="good" />
            <Kpi label="Net Bias" value={(NET_BIAS >= 0 ? "+" : "") + NET_BIAS.toFixed(1) + "%"} sub={NET_BIAS >= 0 ? "under-forecast" : "over-forecast"} tone="warn" />
            <Kpi label="MAPE (12-mo)" value={MAPE.toFixed(1) + "%"} sub="mean absolute % error" />
            <Kpi label="Worst SKU" value={WORST_SKU.id} sub={WORST_SKU.mape.toFixed(1) + "% error"} tone="bad" />
          </div>
          <div className="grid gap-4 lg:grid-cols-2">
            <ChartCard label="forecast_vs_actual()" right={
              <select value={fcSku} onChange={(e) => setFcSku(e.target.value)} className="rounded-md border border-border-hair bg-surface px-2 py-1 font-mono text-[11px] text-fg">
                {SKUS.map((s) => <option key={s.id} value={s.id}>{s.id} — {s.name}</option>)}
              </select>
            }>
              <GroupBars labels={MONTHS} colors={[CYAN, ACCENT]} unit="units" max={niceMax(Math.max(...FCAST[fcSku].flatMap((x) => [x.fcst, x.act])) * 1.1)} groups={[FCAST[fcSku].map((x) => x.fcst), FCAST[fcSku].map((x) => x.act)]} />
              <div className="mt-1 font-mono text-[10px] text-muted"><span style={{ color: CYAN }}>●</span> forecast&nbsp;&nbsp;<span style={{ color: ACCENT }}>●</span> actual</div>
            </ChartCard>
            <ChartCard label="monthly_bias_pct()" right={<span>±10% band</span>}>
              <LineChart labels={MONTHS} min={-15} max={15} unit="% bias" series={[{ data: BIAS.map((b) => +b.pct.toFixed(1)), color: AMBER }, { data: MONTHS.map(() => 10), color: HAIR, dash: true }, { data: MONTHS.map(() => -10), color: HAIR, dash: true }]} />
            </ChartCard>
          </div>
          <Panel title="Forecast-to-Actual ledger" hint="last 6 months">
            <table className="w-full border-collapse">
              <thead><tr><Th l>Month</Th><Th l>SKU</Th><Th>Forecast</Th><Th>Actual</Th><Th>Variance</Th><Th>Var %</Th><Th l>Signal</Th></tr></thead>
              <tbody>
                {[6, 7, 8, 9, 10, 11].flatMap((i) => SKUS.map((s) => {
                  const x = FCAST[s.id][i];
                  const ae = Math.abs(x.varpct);
                  const tone = ae > 15 ? "crit" : ae > 8 ? "warn" : "ok";
                  const sl = ae > 15 ? "High error" : ae > 8 ? "Watch" : "On track";
                  const vc = x.varc >= 0 ? "text-accent" : "text-[#f2555a]";
                  return (
                    <tr key={s.id + i} className="hover:bg-surface/40">
                      <Td l cls="text-muted">{x.m} &apos;2{i < 11 ? "5" : "6"}</Td>
                      <Td l cls="text-cyan font-semibold">{s.id}</Td>
                      <Td>{fmt(x.fcst)}</Td><Td>{fmt(x.act)}</Td>
                      <Td cls={vc}>{x.varc >= 0 ? "+" : ""}{fmt(x.varc)}</Td>
                      <Td cls={vc}>{x.varpct >= 0 ? "+" : ""}{x.varpct.toFixed(1)}%</Td>
                      <Td l><Pill tone={tone}>{sl}</Pill></Td>
                    </tr>
                  );
                }))}
              </tbody>
            </table>
          </Panel>
        </div>
      )}

      {/* ---------- R3 ---------- */}
      {tab === "r3" && (
        <div className="flex flex-col gap-4">
          <p className="font-mono text-xs text-muted">
            <span className="text-cyan">generated_schedule()</span> — bias-adjusted forecast netted against on-hand, inbound and safety stock, rounded to supplier MOQ.
          </p>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            <Kpi label="Planned Units (6-mo)" value={fmt(SCHED_UNITS)} sub="across 8 SKUs" />
            <Kpi label="Planned Spend (6-mo)" value={usdM(SCHED_SPEND)} sub="at landed cost" />
            <Kpi label="Bias Applied" value={(NET_BIAS >= 0 ? "+" : "") + NET_BIAS.toFixed(1) + "%"} sub="from Report 02" tone="good" />
            <Kpi label="Peak Month" value={PEAK_MONTH.m} sub={fmt(PEAK_MONTH.v) + " units"} tone="warn" />
          </div>
          <div className="grid gap-4 lg:grid-cols-2">
            <ChartCard label="planned_orders_by_class()" right={<span>units</span>}>
              <StackedBars labels={FUT} keys={["A", "B", "C"]} colors={{ A: ACCENT, B: CYAN, C: VIOLET }} unit="planned"
                max={niceMax(Math.max(...FUT.map((m) => SCHED.filter((r) => r.m === m).reduce((a, r) => a + r.order, 0))) * 1.1)}
                stacks={{
                  A: FUT.map((m) => SCHED.filter((r) => r.m === m && r.cls === "A").reduce((a, r) => a + r.order, 0)),
                  B: FUT.map((m) => SCHED.filter((r) => r.m === m && r.cls === "B").reduce((a, r) => a + r.order, 0)),
                  C: FUT.map((m) => SCHED.filter((r) => r.m === m && r.cls === "C").reduce((a, r) => a + r.order, 0)),
                }} />
              <div className="mt-1 font-mono text-[10px] text-muted"><span style={{ color: ACCENT }}>●</span> A&nbsp;&nbsp;<span style={{ color: CYAN }}>●</span> B&nbsp;&nbsp;<span style={{ color: VIOLET }}>●</span> C</div>
            </ChartCard>
            <ChartCard label="ending_inv_vs_safety()" right={<span>units</span>}>
              <LineChart labels={FUT} unit="units"
                max={niceMax(Math.max(...FUT.map((m) => SCHED.filter((r) => r.m === m).reduce((a, r) => a + r.endInv, 0))) * 1.1)}
                series={[
                  { data: FUT.map((m) => SCHED.filter((r) => r.m === m).reduce((a, r) => a + r.endInv, 0)), color: ACCENT },
                  { data: FUT.map((m) => SCHED.filter((r) => r.m === m).reduce((a, r) => a + r.ss, 0)), color: RED, dash: true },
                ]} />
              <div className="mt-1 font-mono text-[10px] text-muted"><span style={{ color: ACCENT }}>●</span> ending inv&nbsp;&nbsp;<span style={{ color: RED }}>┄</span> safety stock</div>
            </ChartCard>
          </div>
          <Panel title="Generated replenishment schedule" hint={
            <select value={schedMonth} onChange={(e) => setSchedMonth(e.target.value)} className="rounded-md border border-border-hair bg-surface px-2 py-0.5 font-mono text-[11px] text-fg">
              <option value="ALL">All months</option>
              {FUT.map((m) => <option key={m} value={m}>{m} 2026</option>)}
            </select>
          }>
            <table className="w-full border-collapse">
              <thead><tr><Th l>Month</Th><Th l>SKU</Th><Th>Adj Fcst</Th><Th>Bias Adj</Th><Th>Open Inv</Th><Th>Safety</Th><Th>Planned Order</Th><Th>End Inv</Th><Th l>Action</Th></tr></thead>
              <tbody>
                {SCHED.filter((r) => schedMonth === "ALL" || r.m === schedMonth).map((r, i) => (
                  <tr key={i} className="hover:bg-surface/40">
                    <Td l cls="text-muted">{r.m}</Td>
                    <Td l cls="text-cyan font-semibold">{r.sku}</Td>
                    <Td>{fmt(r.adjF)}</Td>
                    <Td cls="text-[#f5a623]">{r.biasAdj >= 0 ? "+" : ""}{fmt(r.biasAdj)}</Td>
                    <Td cls="text-muted">{fmt(r.open)}</Td>
                    <Td cls="text-muted">{fmt(r.ss)}</Td>
                    <Td cls={r.order > 0 ? "text-accent" : "text-muted"}>{r.order > 0 ? fmt(r.order) : "—"}</Td>
                    <Td>{fmt(r.endInv)}</Td>
                    <Td l><Pill tone={r.plan ? "plan" : "info"}>{r.act}</Pill></Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Panel>
        </div>
      )}

      {/* ---------- R4 ---------- */}
      {tab === "r4" && (
        <div className="flex flex-col gap-4">
          <p className="font-mono text-xs text-muted">
            <span className="text-cyan">po_pipeline()</span> — open orders sequenced by tracked ETA, modelling inbound receipts and landed-cost cash outflow. Live stages come from the <span className="text-fg">Pipeline Tracker</span>.
          </p>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            <Kpi label="Open PO Value" value={usdM(TOT_OPEN_PO_VAL)} sub={`${ACTIVE_POS.length} orders`} />
            <Kpi label="Units In Transit" value={fmt(TOT_TRANSIT_UNITS)} sub="stages 06–07" tone="good" />
            <Kpi label="Next Receipt" value={`${poEta(NEXT_RECEIPT).days}d`} sub={`${NEXT_RECEIPT.id} · ${VENDOR(SKU(NEXT_RECEIPT.sku).origin).name.split(" ")[0]}`} tone="warn" />
            <Kpi label="At-Risk Value" value={usdM(AT_RISK_VAL)} sub={`${ACTIVE_POS.filter((p) => p.variance > 0).length} orders slipping`} tone="bad" />
          </div>
          {(() => {
            const byWk: Record<number, number> = {};
            SORTED_POS.forEach((p) => { const w = poEta(p).week; byWk[w] = (byWk[w] || 0) + poValue(p); });
            const wks = Object.keys(byWk).map(Number).sort((a, b) => a - b);
            const wv = wks.map((w) => byWk[w]);
            let cum = 0;
            const cv = wv.map((v) => (cum += v));
            const cash: Record<number, number> = {};
            ACTIVE_POS.forEach((p) => {
              cash[CURWK] = (cash[CURWK] || 0) + poValue(p) * 0.3;
              const w = poEta(p).week;
              cash[w] = (cash[w] || 0) + poValue(p) * 0.7;
            });
            const cw = Object.keys(cash).map(Number).sort((a, b) => a - b);
            return (
              <div className="grid gap-4 lg:grid-cols-2">
                <ChartCard label="po_value_by_eta()" right={<span>bar $ · line cumulative</span>}>
                  <BarLine labels={wks.map((w) => "W" + w)} bars={wv} line={cv} barColor={CYAN} lineColor={ACCENT} max={niceMax(Math.max(...wv) * 1.1)} lineMax={niceMax(cv[cv.length - 1] * 1.05)} unit="$" />
                  <div className="mt-1 font-mono text-[10px] text-muted"><span style={{ color: CYAN }}>▮</span> order value&nbsp;&nbsp;<span style={{ color: ACCENT }}>●</span> cumulative ({usdM(cv[cv.length - 1])})</div>
                </ChartCard>
                <ChartCard label="cash_outflow()" right={<span>30% deposit / 70% on receipt</span>}>
                  <GroupBars labels={cw.map((w) => "W" + w)} colors={[VIOLET]} unit="$" max={niceMax(Math.max(...cw.map((w) => cash[w])) * 1.1)} groups={[cw.map((w) => cash[w])]} />
                </ChartCard>
              </div>
            );
          })()}
          <Panel title="Purchase order schedule" hint="by tracked ETA">
            <table className="w-full border-collapse">
              <thead><tr><Th l>PO #</Th><Th l>SKU</Th><Th l>Vendor</Th><Th>Qty</Th><Th>Unit Cost</Th><Th>Value</Th><Th l>Stage</Th><Th>ETA</Th><Th l>Status</Th></tr></thead>
              <tbody>
                {SORTED_POS.map((p) => {
                  const st = poStatus(p);
                  const eta = poEta(p);
                  const s = SKU(p.sku);
                  return (
                    <tr key={p.id} className="hover:bg-surface/40">
                      <Td l cls="text-cyan font-semibold">{p.id}</Td>
                      <Td l cls="text-cyan">{p.sku}</Td>
                      <Td l cls="font-sans text-fg">{VENDOR(s.origin).name}</Td>
                      <Td>{fmt(p.qty)}</Td>
                      <Td cls="text-muted">{usd(s.cost)}</Td>
                      <Td>{usdM(poValue(p))}</Td>
                      <Td l><Pill tone="info">{STAGES[p.stage - 1].short}</Pill></Td>
                      <Td cls="text-[#f5a623]">{eta.label}</Td>
                      <Td l><Pill tone={st.tone}>{st.label}</Pill></Td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </Panel>
        </div>
      )}

      <p className="mt-6 font-mono text-[10px] uppercase tracking-[0.2em] text-muted">
        {"// sample data · illustrative only · not a live feed"}
      </p>
    </div>
  );
}
