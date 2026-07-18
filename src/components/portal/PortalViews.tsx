"use client";

import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { Loader2, Inbox } from "lucide-react";
import {
  fetchSkus,
  fetchPos,
  fmt,
  usdM,
  coverWeeks,
  coverTone,
  daysUntil,
  STAGE_NAMES,
  type ClientSku,
  type ClientPo,
} from "@/components/portal/portalData";

/* ---------------- shared atoms ---------------- */
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
function Empty({ what }: { what: string }) {
  return (
    <div className="glass rounded-xl p-10 text-center">
      <Inbox className="mx-auto h-6 w-6 text-muted" aria-hidden />
      <h3 className="mt-3 font-mono text-sm font-semibold text-fg">No {what} loaded yet</h3>
      <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-muted">
        Your workspace is live, but we haven&apos;t loaded your {what} yet. This
        fills in as soon as your data pass completes.
      </p>
    </div>
  );
}
function Loading() {
  return (
    <div className="flex items-center gap-2 py-16 font-mono text-sm text-muted">
      <Loader2 className="h-4 w-4 animate-spin" /> Loading your data…
    </div>
  );
}
function useData<T>(loader: () => Promise<T>, deps: unknown[]) {
  const [data, setData] = useState<T | null>(null);
  const [err, setErr] = useState<string | null>(null);
  useEffect(() => {
    let alive = true;
    loader()
      .then((d) => alive && setData(d))
      .catch((e) => alive && setErr(e?.message ?? "Could not load data."));
    return () => { alive = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
  return { data, err };
}
function ErrorBox({ msg }: { msg: string }) {
  return (
    <div className="glass rounded-xl border border-[#f2555a]/40 p-6">
      <p className="font-mono text-sm text-[#f2555a]">Couldn&apos;t load your data</p>
      <p className="mt-2 font-mono text-[11px] text-muted">{msg}</p>
    </div>
  );
}

/* ================= OVERVIEW ================= */
export function PortalOverview({ orgId }: { orgId: string }) {
  const { data, err } = useData(
    async () => ({ skus: await fetchSkus(orgId), pos: await fetchPos(orgId) }),
    [orgId],
  );
  if (err) return <ErrorBox msg={err} />;
  if (!data) return <Loading />;
  const { skus, pos } = data;
  if (skus.length === 0 && pos.length === 0) return <Empty what="data" />;

  const onHandVal = skus.reduce((a, s) => a + s.on_hand * s.unit_cost, 0);
  const onHandUnits = skus.reduce((a, s) => a + s.on_hand, 0);
  const openPos = pos.filter((p) => p.stage >= 3 && p.stage <= 7);
  const openVal = openPos.reduce((a, p) => a + p.qty * (p.unit_cost ?? 0), 0);
  const critical = skus.filter((s) => coverWeeks(s) < 4);
  const late = openPos.filter((p) => p.variance_days > 0);
  const nextEta = openPos
    .map((p) => daysUntil(p.eta))
    .filter((d): d is number => d !== null && d >= 0)
    .sort((a, b) => a - b)[0];

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-5">
        <Kpi label="On-Hand Value" value={usdM(onHandVal)} sub={`${fmt(onHandUnits)} units`} />
        <Kpi label="SKUs Tracked" value={String(skus.length)} sub={`${critical.length} below 4 wks`} tone={critical.length ? "warn" : "good"} />
        <Kpi label="Open PO Value" value={usdM(openVal)} sub={`${openPos.length} live orders`} />
        <Kpi label="Orders Slipping" value={String(late.length)} sub="behind agreed lead time" tone={late.length ? "bad" : "good"} />
        <Kpi label="Next Receipt" value={nextEta === undefined ? "—" : `${nextEta}d`} sub="soonest ETA" tone="warn" />
      </div>

      {critical.length > 0 && (
        <Panel title="Needs attention — under 4 weeks of cover" hint={`${critical.length} SKUs`}>
          <table className="w-full border-collapse">
            <thead><tr><Th l>SKU</Th><Th l>Product</Th><Th>On-Hand</Th><Th>Weekly</Th><Th>Cover (wks)</Th><Th l>Status</Th></tr></thead>
            <tbody>
              {critical.map((s) => {
                const w = coverWeeks(s);
                return (
                  <tr key={s.id} className="hover:bg-surface/40">
                    <Td l cls="text-cyan font-semibold">{s.sku}</Td>
                    <Td l cls="font-sans text-fg">{s.name ?? "—"}</Td>
                    <Td>{fmt(s.on_hand)}</Td>
                    <Td cls="text-muted">{fmt(s.weekly_demand)}</Td>
                    <Td cls="text-[#f2555a]">{Number.isFinite(w) ? w.toFixed(1) : "—"}</Td>
                    <Td l><Pill tone="crit">Critical</Pill></Td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Panel>
      )}

      {late.length > 0 && (
        <Panel title="Orders behind plan" hint={`${late.length} of ${openPos.length}`}>
          <table className="w-full border-collapse">
            <thead><tr><Th l>PO #</Th><Th l>SKU</Th><Th>Qty</Th><Th l>Stage</Th><Th>ETA</Th><Th>Slip</Th></tr></thead>
            <tbody>
              {late.map((p) => (
                <tr key={p.id} className="hover:bg-surface/40">
                  <Td l cls="text-cyan font-semibold">{p.po_number}</Td>
                  <Td l cls="text-cyan">{p.sku}</Td>
                  <Td>{fmt(p.qty)}</Td>
                  <Td l><Pill tone="info">{STAGE_NAMES[p.stage - 1]}</Pill></Td>
                  <Td cls="text-[#f5a623]">{p.eta ?? "—"}</Td>
                  <Td cls="text-[#f2555a]">+{p.variance_days}d</Td>
                </tr>
              ))}
            </tbody>
          </table>
        </Panel>
      )}
    </div>
  );
}

/* ================= INVENTORY ================= */
export function PortalInventory({ orgId }: { orgId: string }) {
  const { data, err } = useData(() => fetchSkus(orgId), [orgId]);
  if (err) return <ErrorBox msg={err} />;
  if (!data) return <Loading />;
  if (data.length === 0) return <Empty what="inventory" />;

  return (
    <Panel title="Inventory position" hint={`${data.length} SKUs`}>
      <table className="w-full border-collapse">
        <thead>
          <tr><Th l>SKU</Th><Th l>Product</Th><Th l>Class</Th><Th l>Origin</Th><Th>On-Hand</Th><Th>Weekly</Th><Th>Safety</Th><Th>Cover (wks)</Th><Th>Value</Th><Th l>Status</Th></tr>
        </thead>
        <tbody>
          {data.map((s: ClientSku) => {
            const w = coverWeeks(s);
            const tone = coverTone(w);
            return (
              <tr key={s.id} className="hover:bg-surface/40">
                <Td l cls="text-cyan font-semibold">{s.sku}</Td>
                <Td l cls="font-sans text-fg">{s.name ?? "—"}</Td>
                <Td l cls="text-muted">{s.abc_class ?? "—"}</Td>
                <Td l cls="text-muted">{s.origin ?? "—"}</Td>
                <Td>{fmt(s.on_hand)}</Td>
                <Td cls="text-muted">{fmt(s.weekly_demand)}</Td>
                <Td cls="text-muted">{fmt(s.safety_stock)}</Td>
                <Td cls={tone === "crit" ? "text-[#f2555a]" : tone === "warn" ? "text-[#f5a623]" : "text-fg"}>
                  {Number.isFinite(w) ? w.toFixed(1) : "—"}
                </Td>
                <Td>{usdM(s.on_hand * s.unit_cost)}</Td>
                <Td l><Pill tone={tone}>{tone === "crit" ? "Critical" : tone === "warn" ? "Watch" : "Healthy"}</Pill></Td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </Panel>
  );
}

/* ================= PIPELINE ================= */
export function PortalPipeline({ orgId }: { orgId: string }) {
  const { data, err } = useData(() => fetchPos(orgId), [orgId]);
  if (err) return <ErrorBox msg={err} />;
  if (!data) return <Loading />;
  if (data.length === 0) return <Empty what="purchase orders" />;

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-8">
        {STAGE_NAMES.map((name, i) => {
          const n = i + 1;
          const count = data.filter((p) => p.stage === n).length;
          return (
            <div key={name} className={`rounded-lg border p-2.5 ${count > 0 ? "border-border-hair bg-surface/60" : "border-border-hair/50"}`}>
              <div className="font-mono text-[9px] uppercase tracking-wider text-muted/70">{String(n).padStart(2, "0")}</div>
              <div className="mt-1 font-mono text-[11px] leading-tight text-fg">{name}</div>
              <div className={`mt-2 font-mono text-xl font-semibold ${count > 0 ? "text-accent" : "text-muted/40"}`}>{count}</div>
            </div>
          );
        })}
      </div>

      <Panel title="Purchase orders" hint={`${data.length} orders`}>
        <table className="w-full border-collapse">
          <thead>
            <tr><Th l>PO #</Th><Th l>SKU</Th><Th>Qty</Th><Th>Value</Th><Th l>Stage</Th><Th>Issued</Th><Th>ETA</Th><Th l>Status</Th></tr>
          </thead>
          <tbody>
            {data.map((p: ClientPo) => {
              const tone = p.variance_days >= 7 ? "crit" : p.variance_days > 0 ? "warn" : "ok";
              const label = p.variance_days >= 7 ? "Late" : p.variance_days > 0 ? "At risk" : "On plan";
              return (
                <tr key={p.id} className="hover:bg-surface/40">
                  <Td l cls="text-cyan font-semibold">{p.po_number}</Td>
                  <Td l cls="text-cyan">{p.sku}</Td>
                  <Td>{fmt(p.qty)}</Td>
                  <Td>{usdM(p.qty * (p.unit_cost ?? 0))}</Td>
                  <Td l><Pill tone="info">{STAGE_NAMES[p.stage - 1]}</Pill></Td>
                  <Td cls="text-muted">{p.issued_at ?? "—"}</Td>
                  <Td cls="text-[#f5a623]">{p.eta ?? "—"}</Td>
                  <Td l><Pill tone={tone}>{label}</Pill></Td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Panel>
    </div>
  );
}
