"use client";

import { getBrowserSupabase } from "@/lib/supabaseBrowser";

/* Row shapes mirror the client_* tables. Every query below is additionally
   filtered by RLS to the caller's org — the explicit .eq("org_id") is belt
   and braces, not the security boundary. */

export type ClientSku = {
  id: string;
  sku: string;
  name: string | null;
  abc_class: "A" | "B" | "C" | null;
  on_hand: number;
  weekly_demand: number;
  unit_cost: number;
  unit_price: number | null;
  safety_stock: number;
  origin: string | null;
  lead_days: number | null;
};

export type ClientPo = {
  id: string;
  po_number: string;
  sku: string;
  qty: number;
  unit_cost: number | null;
  stage: number;
  issued_at: string | null;
  eta: string | null;
  variance_days: number;
  last_contact: string | null;
};

export async function fetchSkus(orgId: string): Promise<ClientSku[]> {
  const { data, error } = await getBrowserSupabase()
    .from("client_skus")
    .select(
      "id, sku, name, abc_class, on_hand, weekly_demand, unit_cost, unit_price, safety_stock, origin, lead_days",
    )
    .eq("org_id", orgId)
    .order("sku");
  if (error) throw error;
  return (data ?? []) as ClientSku[];
}

export async function fetchPos(orgId: string): Promise<ClientPo[]> {
  const { data, error } = await getBrowserSupabase()
    .from("client_pos")
    .select(
      "id, po_number, sku, qty, unit_cost, stage, issued_at, eta, variance_days, last_contact",
    )
    .eq("org_id", orgId)
    .order("eta", { nullsFirst: false });
  if (error) throw error;
  return (data ?? []) as ClientPo[];
}

/* ---------------- shared formatting + derivations ---------------- */
export const fmt = (n: number) => Math.round(n).toLocaleString("en-US");
export const usdM = (n: number) =>
  n >= 1e6 ? "$" + (n / 1e6).toFixed(2) + "M" : "$" + Math.round(n / 1e3) + "K";

export const STAGE_NAMES = [
  "PR Proposed",
  "PR Approved",
  "PO Issued",
  "Supplier Confirmed",
  "In Production",
  "Shipped",
  "In Transit / Customs",
  "Received",
];

export const coverWeeks = (s: ClientSku) =>
  s.weekly_demand > 0 ? s.on_hand / s.weekly_demand : Infinity;

export function coverTone(w: number): "ok" | "warn" | "crit" {
  if (w < 4) return "crit";
  if (w < 7) return "warn";
  return "ok";
}

export const daysUntil = (iso: string | null) => {
  if (!iso) return null;
  return Math.round((new Date(iso).getTime() - Date.now()) / 86_400_000);
};
