"use client";

import { useState } from "react";
import type { ReactNode } from "react";
import { Mail, Phone } from "lucide-react";
import {
  STAGES, SKUS, SKU, PRS, POS, VENDOR, leadTotal,
  poValue, prValue, poPlanned, poEta, poStatus, chaseDue, followUpHref,
  inTransitQty, onOrderQty, stageCount, stageValue,
  TOT_ONHAND_VAL, TOT_TRANSIT_VAL, TOT_OPEN_PO_VAL, TOT_PR_PENDING_VAL,
  TOT_ONHAND_UNITS, ACTIVE_POS, AVG_LEAD, ON_TIME_PCT, CHASE_COUNT,
  fmt, usdM,
} from "@/lib/sampleData";
import type { Lead } from "@/lib/sampleData";


/* ------------------------------------------------------------------ */
/*  Procurement pipeline tracker — sample data, native site theme.     */
/*  PR → approval → PO → production → transit → receipt, with a        */
/*  per-order progress bar and lead-time attribution by SKU.           */
/* ------------------------------------------------------------------ */

const ACCENT = "var(--color-accent)";
const CYAN = "var(--color-cyan)";
const VIOLET = "var(--color-violet)";
const MUTED = "var(--color-muted)";
const HAIR = "var(--color-border-hair)";
const RED = "#f2555a";
const AMBER = "#f5a623";

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

/* ---------------- progress bar ---------------- */
function StageBar({ stage, tone }: { stage: number; tone: "ok" | "warn" | "crit" }) {
  const cur = tone === "crit" ? RED : tone === "warn" ? AMBER : ACCENT;
  return (
    <div className="flex items-center gap-[3px]">
      {STAGES.map((s) => {
        const done = s.n < stage;
        const active = s.n === stage;
        return (
          <div
            key={s.n}
            title={`${s.n}. ${s.name}`}
            className="h-2 flex-1 rounded-full"
            style={{
              background: done ? ACCENT : active ? cur : HAIR,
              opacity: done ? 0.55 : 1,
              boxShadow: active ? `0 0 10px -2px ${cur}` : undefined,
            }}
          />
        );
      })}
    </div>
  );
}

/* ---------------- lead-time stacked bar ---------------- */
const SEG: { key: keyof Lead; label: string; color: string }[] = [
  { key: "approval", label: "Approval", color: VIOLET },
  { key: "production", label: "Production", color: ACCENT },
  { key: "shipping", label: "Shipping", color: CYAN },
  { key: "customs", label: "Customs", color: AMBER },
  { key: "receiving", label: "Receiving", color: MUTED },
];

const TABS = [
  { id: "t1", label: "PO Progress Tracker" },
  { id: "t2", label: "Inventory & In-Transit" },
  { id: "t3", label: "PR Approval Queue" },
  { id: "t4", label: "Lead-Time Analysis" },
];

export function PipelineBoard() {
  const [tab, setTab] = useState("t1");
  const maxLead = Math.max(...SKUS.map((s) => leadTotal(s.lead)));

  return (
    <div>
      {/* KPI row */}
      <div className="mb-4 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
        <Kpi label="On-Hand Value" value={usdM(TOT_ONHAND_VAL)} sub={`${fmt(TOT_ONHAND_UNITS)} units`} />
        <Kpi label="In Transit" value={usdM(TOT_TRANSIT_VAL)} sub={`${POS.filter((p) => p.stage >= 6 && p.stage <= 7).length} shipments`} tone="good" />
        <Kpi label="Open PO Value" value={usdM(TOT_OPEN_PO_VAL)} sub={`${ACTIVE_POS.length} orders live`} />
        <Kpi label="PRs Awaiting Approval" value={String(PRS.filter((p) => p.stage === 1).length)} sub={usdM(TOT_PR_PENDING_VAL) + " pending"} tone="warn" />
        <Kpi label="Avg Lead Time" value={`${AVG_LEAD}d`} sub="PR → receipt, all SKUs" />
        <Kpi label="On-Plan Rate" value={`${ON_TIME_PCT}%`} sub={`${ACTIVE_POS.filter((p) => p.variance > 0).length} orders slipping`} tone={ON_TIME_PCT >= 75 ? "good" : "bad"} />
      </div>

      {/* stage funnel */}
      <div className="glass mb-6 rounded-xl p-4">
        <div className="mb-3 flex items-center justify-between font-mono text-xs text-muted">
          <span className="text-cyan">pipeline_stages()</span>
          <span>clock starts at PO issue · as of 18 Jul 2026</span>
        </div>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-8">
          {STAGES.map((s) => {
            const c = stageCount(s.n);
            const v = stageValue(s.n);
            const isPr = s.n <= 2;
            return (
              <div key={s.n} className={`rounded-lg border p-2.5 ${c > 0 ? "border-border-hair bg-surface/60" : "border-border-hair/50"}`}>
                <div className="font-mono text-[9px] uppercase tracking-wider text-muted/70">
                  {String(s.n).padStart(2, "0")} · {isPr ? "PR" : "PO"}
                </div>
                <div className="mt-1 font-mono text-[11px] leading-tight text-fg">{s.name}</div>
                <div className={`mt-2 font-mono text-xl font-semibold ${c > 0 ? (isPr ? "text-[#f5a623]" : "text-accent") : "text-muted/40"}`}>{c}</div>
                <div className="font-mono text-[10px] text-muted">{v > 0 ? usdM(v) : "—"}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* tabs */}
      <div className="mb-6 flex flex-wrap gap-1 rounded-lg border border-border-hair bg-surface/40 p-1">
        {TABS.map((t, i) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`rounded-md px-3.5 py-2 font-mono text-[13px] transition-colors ${tab === t.id ? "bg-accent text-on-accent" : "text-muted hover:text-fg"}`}
          >
            <span className="mr-1.5 opacity-60">0{i + 1}</span>
            {t.label}
          </button>
        ))}
      </div>

      {/* ---------- T1: PO PROGRESS TRACKER ---------- */}
      {tab === "t1" && (
        <div className="flex flex-col gap-3">
          <p className="font-mono text-xs text-muted">
            <span className="text-cyan">po_progress()</span> — every live order from issue to receipt. Bar shows the 8 lifecycle stages; the day counter runs from PO issue against the SKU&apos;s planned lead time.
          </p>
          {CHASE_COUNT > 0 && (
            <div className="flex items-center gap-2 rounded-lg border border-[#f5a623]/40 bg-[#f5a623]/10 px-3 py-2 font-mono text-[11px] text-[#f5a623]">
              <Mail className="h-3.5 w-3.5" aria-hidden />
              {CHASE_COUNT} order{CHASE_COUNT > 1 ? "s" : ""} need a chase — behind plan with no vendor contact in 5+ days, or untouched 10+ days.
            </div>
          )}
          {POS.slice().sort((a, b) => b.stage - a.stage || b.variance - a.variance).map((p) => {
            const s = SKU(p.sku);
            const v = VENDOR(s.origin);
            const planned = poPlanned(p);
            const eta = poEta(p);
            const st = poStatus(p);
            const due = chaseDue(p);
            const pct = Math.min(100, Math.round((p.elapsed / (planned + p.variance)) * 100));
            return (
              <div key={p.id} className={`glass rounded-xl p-4 ${due ? "ring-1 ring-[#f5a623]/40" : ""}`}>
                <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                    <span className="font-mono text-sm font-semibold text-cyan">{p.id}</span>
                    <span className="font-mono text-sm text-cyan/80">{p.sku}</span>
                    <span className="text-sm text-fg">{s.name}</span>
                    <span className="font-mono text-[11px] text-muted">{s.origin}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs tabular-nums text-muted">{fmt(p.qty)} u · {usdM(poValue(p))}</span>
                    <Pill tone={st.tone}>{st.label}</Pill>
                  </div>
                </div>

                <StageBar stage={p.stage} tone={st.tone} />

                <div className="mt-2 flex flex-wrap items-center justify-between gap-2 font-mono text-[11px]">
                  <span className="text-accent">
                    {STAGES[p.stage - 1].name}
                    <span className="text-muted"> · stage {p.stage}/8</span>
                  </span>
                  <span className="tabular-nums text-muted">
                    {p.stage === 8 ? (
                      <span className="text-accent">Received in {p.elapsed}d (plan {planned}d)</span>
                    ) : (
                      <>
                        Day <span className="text-fg">{p.elapsed}</span> of {planned + p.variance}
                        <span className="mx-1.5 text-muted/50">|</span>
                        {pct}% elapsed
                        <span className="mx-1.5 text-muted/50">|</span>
                        ETA <span className="text-fg">{eta.label}</span> ({eta.days}d)
                        {p.variance > 0 && <span className="ml-1.5 text-[#f2555a]">+{p.variance}d vs plan</span>}
                      </>
                    )}
                  </span>
                </div>

                {/* vendor + follow-up */}
                <div className="mt-3 flex flex-wrap items-end justify-between gap-3 border-t border-border-hair/60 pt-3">
                  <div className="flex flex-col gap-1">
                    <span className="font-mono text-[12px] font-semibold text-fg">{v.name}</span>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[11px]">
                      <span className="text-muted">
                        {v.contact} <span className="text-muted/60">· {v.role}</span>
                      </span>
                      <a href={`mailto:${v.email}`} className="inline-flex items-center gap-1 text-cyan transition-colors hover:text-accent">
                        <Mail className="h-3 w-3" aria-hidden />
                        {v.email}
                      </a>
                      <a href={`tel:${v.phone.replace(/\s/g, "")}`} className="inline-flex items-center gap-1 text-muted transition-colors hover:text-accent">
                        <Phone className="h-3 w-3" aria-hidden />
                        {v.phone}
                      </a>
                      <span className="text-muted/50">{v.hours}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className={`font-mono text-[11px] ${due ? "text-[#f5a623]" : "text-muted"}`}>
                      {p.stage === 8
                        ? "closed"
                        : p.contacted === 0
                          ? "contacted today"
                          : `last contact ${p.contacted}d ago`}
                      {due && " · chase due"}
                    </span>
                    {p.stage < 8 && (
                      <a
                        href={followUpHref(p)}
                        className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 font-mono text-[11px] transition-all ${
                          due
                            ? "bg-accent text-on-accent hover:brightness-110"
                            : "border border-border-hair text-muted hover:border-accent/55 hover:text-accent"
                        }`}
                      >
                        <Mail className="h-3 w-3" aria-hidden />
                        Queue follow-up
                      </a>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ---------- T2: INVENTORY & IN-TRANSIT ---------- */}
      {tab === "t2" && (
        <div className="flex flex-col gap-4">
          <p className="font-mono text-xs text-muted">
            <span className="text-cyan">inventory_position()</span> — on-hand, in-transit and on-order by SKU, with total pipeline coverage in weeks of demand.
          </p>
          <Panel title="Stock position by SKU" hint="on-hand + in-transit + on-order">
            <table className="w-full border-collapse">
              <thead>
                <tr><Th l>SKU</Th><Th l>Product</Th><Th l>Origin</Th><Th>On-Hand</Th><Th>In Transit</Th><Th>On Order</Th><Th>Total Pipeline</Th><Th>Wkly Dmd</Th><Th>Cover (wks)</Th><Th l>Status</Th></tr>
              </thead>
              <tbody>
                {SKUS.map((s) => {
                  const transit = inTransitQty(s.id);
                  const onOrder = onOrderQty(s.id);
                  const total = s.onhand + transit + onOrder;
                  const cover = total / s.wkly;
                  const onhandCover = s.onhand / s.wkly;
                  const tone = onhandCover < 4 ? "crit" : onhandCover < 7 ? "warn" : "ok";
                  const label = onhandCover < 4 ? "Critical" : onhandCover < 7 ? "Watch" : "Healthy";
                  return (
                    <tr key={s.id} className="hover:bg-surface/40">
                      <Td l cls="text-cyan font-semibold">{s.id}</Td>
                      <Td l cls="font-sans text-fg">{s.name}</Td>
                      <Td l cls="text-muted">{s.origin}</Td>
                      <Td>{fmt(s.onhand)}</Td>
                      <Td cls={transit > 0 ? "text-accent" : "text-muted"}>{transit > 0 ? fmt(transit) : "—"}</Td>
                      <Td cls={onOrder > 0 ? "text-cyan" : "text-muted"}>{onOrder > 0 ? fmt(onOrder) : "—"}</Td>
                      <Td cls="text-fg">{fmt(total)}</Td>
                      <Td cls="text-muted">{fmt(s.wkly)}</Td>
                      <Td cls={tone === "crit" ? "text-[#f2555a]" : tone === "warn" ? "text-[#f5a623]" : "text-fg"}>{cover.toFixed(1)}</Td>
                      <Td l><Pill tone={tone}>{label}</Pill></Td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </Panel>

          <Panel title="In-transit shipments" hint="stages 06–07">
            <table className="w-full border-collapse">
              <thead><tr><Th l>PO #</Th><Th l>SKU</Th><Th l>Vendor</Th><Th l>Contact</Th><Th>Qty</Th><Th>Value</Th><Th l>Stage</Th><Th>ETA</Th><Th l>Status</Th><Th l>Follow-up</Th></tr></thead>
              <tbody>
                {POS.filter((p) => p.stage === 6 || p.stage === 7).sort((a, b) => poEta(a).days - poEta(b).days).map((p) => {
                  const st = poStatus(p);
                  const eta = poEta(p);
                  const v = VENDOR(SKU(p.sku).origin);
                  return (
                    <tr key={p.id} className="hover:bg-surface/40">
                      <Td l cls="text-cyan font-semibold">{p.id}</Td>
                      <Td l cls="text-cyan">{p.sku}</Td>
                      <Td l cls="font-sans text-fg">{v.name}<span className="block font-mono text-[10px] text-muted">{SKU(p.sku).origin}</span></Td>
                      <Td l cls="text-muted">
                        {v.contact}
                        <a href={`mailto:${v.email}`} className="block text-[10px] text-cyan hover:text-accent">{v.email}</a>
                      </Td>
                      <Td>{fmt(p.qty)}</Td>
                      <Td>{usdM(poValue(p))}</Td>
                      <Td l><Pill tone="info">{STAGES[p.stage - 1].short}</Pill></Td>
                      <Td cls="text-[#f5a623]">{eta.label} ({eta.days}d)</Td>
                      <Td l><Pill tone={st.tone}>{st.label}</Pill></Td>
                      <Td l>
                        <a href={followUpHref(p)} className="inline-flex items-center gap-1 rounded-md border border-border-hair px-2 py-1 text-[10px] text-muted transition-colors hover:border-accent/55 hover:text-accent">
                          <Mail className="h-3 w-3" aria-hidden /> Email
                        </a>
                      </Td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </Panel>
        </div>
      )}

      {/* ---------- T3: PR APPROVAL QUEUE ---------- */}
      {tab === "t3" && (
        <div className="flex flex-col gap-4">
          <p className="font-mono text-xs text-muted">
            <span className="text-cyan">requisition_queue()</span> — system-proposed buys awaiting sign-off. Each PR is generated from the run-out schedule, then rounded to supplier MOQ.
          </p>
          <Panel title="Awaiting approval" hint={`${PRS.filter((p) => p.stage === 1).length} PRs · ${usdM(TOT_PR_PENDING_VAL)}`}>
            <table className="w-full border-collapse">
              <thead><tr><Th l>PR #</Th><Th l>SKU</Th><Th>Qty</Th><Th>Value</Th><Th l>Trigger</Th><Th l>Needed By</Th><Th l>Urgency</Th><Th l>Action</Th></tr></thead>
              <tbody>
                {PRS.filter((p) => p.stage === 1).map((p) => (
                  <tr key={p.id} className="hover:bg-surface/40">
                    <Td l cls="text-[#f5a623] font-semibold">{p.id}</Td>
                    <Td l cls="text-cyan">{p.sku}</Td>
                    <Td>{fmt(p.qty)}</Td>
                    <Td>{usdM(prValue(p))}</Td>
                    <Td l cls="font-sans text-muted">{p.trigger}</Td>
                    <Td l cls="text-fg">{p.neededBy}</Td>
                    <Td l><Pill tone={p.urgency === "Critical" ? "crit" : p.urgency === "High" ? "warn" : "info"}>{p.urgency}</Pill></Td>
                    <Td l><span className="font-mono text-[11px] text-muted">awaiting sign-off</span></Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Panel>
          <Panel title="Approved — awaiting PO issue" hint="stage 02">
            <table className="w-full border-collapse">
              <thead><tr><Th l>PR #</Th><Th l>SKU</Th><Th>Qty</Th><Th>Value</Th><Th l>Needed By</Th><Th l>Next step</Th></tr></thead>
              <tbody>
                {PRS.filter((p) => p.stage === 2).map((p) => (
                  <tr key={p.id} className="hover:bg-surface/40">
                    <Td l cls="text-accent font-semibold">{p.id}</Td>
                    <Td l cls="text-cyan">{p.sku}</Td>
                    <Td>{fmt(p.qty)}</Td>
                    <Td>{usdM(prValue(p))}</Td>
                    <Td l cls="text-fg">{p.neededBy}</Td>
                    <Td l><Pill tone="plan">Issue PO</Pill></Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Panel>
        </div>
      )}

      {/* ---------- T4: LEAD-TIME ANALYSIS ---------- */}
      {tab === "t4" && (
        <div className="flex flex-col gap-4">
          <p className="font-mono text-xs text-muted">
            <span className="text-cyan">lead_time_by_sku()</span> — planned days from requisition to receipt, split by phase. The bar shows where the time actually goes; the delta flags SKUs running behind plan.
          </p>
          <div className="glass rounded-xl p-4">
            <div className="mb-4 flex flex-wrap items-center gap-x-4 gap-y-1 font-mono text-[10px] text-muted">
              {SEG.map((sg) => (
                <span key={sg.key} className="flex items-center gap-1.5">
                  <span className="inline-block h-2 w-4 rounded-sm" style={{ background: sg.color }} />
                  {sg.label}
                </span>
              ))}
            </div>
            <div className="flex flex-col gap-3">
              {SKUS.slice().sort((a, b) => leadTotal(b.lead) - leadTotal(a.lead)).map((s) => {
                const total = leadTotal(s.lead);
                return (
                  <div key={s.id}>
                    <div className="mb-1 flex items-center justify-between font-mono text-[11px]">
                      <span>
                        <span className="font-semibold text-cyan">{s.id}</span>
                        <span className="ml-2 text-muted">{s.origin}</span>
                      </span>
                      <span className="tabular-nums text-muted">
                        <span className="text-fg">{total}d</span> planned
                        {s.actualVar !== 0 && (
                          <span className={s.actualVar > 0 ? "ml-2 text-[#f2555a]" : "ml-2 text-accent"}>
                            {s.actualVar > 0 ? "+" : ""}{s.actualVar}d actual
                          </span>
                        )}
                      </span>
                    </div>
                    <div className="flex h-4 w-full overflow-hidden rounded-md">
                      {SEG.map((sg) => {
                        const v = s.lead[sg.key];
                        return (
                          <div
                            key={sg.key}
                            title={`${sg.label}: ${v}d`}
                            style={{ width: `${(v / maxLead) * 100}%`, background: sg.color, opacity: 0.85 }}
                            className="flex items-center justify-center"
                          >
                            {v / maxLead > 0.12 && <span className="font-mono text-[9px] text-bg">{v}d</span>}
                          </div>
                        );
                      })}
                      <div style={{ width: `${((maxLead - total) / maxLead) * 100}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <Panel title="Lead-time detail by SKU" hint="days">
            <table className="w-full border-collapse">
              <thead><tr><Th l>SKU</Th><Th l>Origin</Th><Th>Approval</Th><Th>Production</Th><Th>Shipping</Th><Th>Customs</Th><Th>Receiving</Th><Th>Planned</Th><Th>Actual</Th><Th l>Variance</Th></tr></thead>
              <tbody>
                {SKUS.map((s) => {
                  const total = leadTotal(s.lead);
                  return (
                    <tr key={s.id} className="hover:bg-surface/40">
                      <Td l cls="text-cyan font-semibold">{s.id}</Td>
                      <Td l cls="text-muted">{s.origin}</Td>
                      <Td cls="text-muted">{s.lead.approval}</Td>
                      <Td>{s.lead.production}</Td>
                      <Td>{s.lead.shipping}</Td>
                      <Td cls="text-muted">{s.lead.customs}</Td>
                      <Td cls="text-muted">{s.lead.receiving}</Td>
                      <Td cls="text-fg">{total}</Td>
                      <Td cls={s.actualVar > 0 ? "text-[#f2555a]" : "text-accent"}>{total + s.actualVar}</Td>
                      <Td l>
                        <Pill tone={s.actualVar >= 5 ? "crit" : s.actualVar > 0 ? "warn" : "ok"}>
                          {s.actualVar > 0 ? `+${s.actualVar}d` : s.actualVar < 0 ? `${s.actualVar}d` : "on plan"}
                        </Pill>
                      </Td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </Panel>
        </div>
      )}

      <p className="mt-6 font-mono text-[10px] uppercase tracking-[0.2em] text-muted">
        // sample data · illustrative only · not a live feed
      </p>
    </div>
  );
}
