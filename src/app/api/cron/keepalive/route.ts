import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { emailAlert } from "@/lib/notify";
import { evaluate, type Snapshot } from "@/lib/capacity";

/**
 * f29/f30 — daily database keep-alive + upgrade monitor.
 *
 * Keep-alive: Supabase free-tier projects auto-pause after ~7 days without
 * activity. A paused project accepts no writes, so every inquiry, assessment,
 * calculator lead and signup is silently lost while the site still looks
 * healthy. That already happened once. Touching the tables daily prevents it.
 *
 * Monitor: reads an aggregate usage snapshot (service-role only) and emails
 * when the free tier is running out — before it bites, not after.
 *
 * Runs at 07:00 UTC via vercel.json. Alerts are sent only when status is not
 * OK, so a healthy day is silent.
 */

export const dynamic = "force-dynamic";
export const maxDuration = 30;

const TABLES = ["inquiries", "assessments", "calculator_leads", "subscribers"];
const DASHBOARD =
  "https://supabase.com/dashboard/project/uibrmmygmwplqvvcffeb";

export async function GET(request: Request) {
  // Vercel sends `Authorization: Bearer $CRON_SECRET` on cron invocations.
  const secret = process.env.CRON_SECRET;
  if (secret) {
    if (request.headers.get("authorization") !== `Bearer ${secret}`) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }
  }

  /* ---------- 1. keep-alive: touch every lead table ---------- */
  const checked: Record<string, string> = {};
  const failures: string[] = [];

  for (const table of TABLES) {
    const { error } = await supabase
      .from(table)
      .select("*", { count: "exact", head: true });
    if (error) {
      checked[table] = `error: ${error.message}`;
      failures.push(`${table}: ${error.message}`);
    } else {
      checked[table] = "ok";
    }
  }
  const reachable = failures.length === 0;

  if (!reachable) {
    try {
      await emailAlert(
        "🚨 Armed Capital — database unreachable, lead capture is DOWN",
        [
          "The daily keep-alive could not reach the database.",
          "Inquiries, assessments, calculator leads and signups are failing.",
          "Leads are falling back to Slack/Zapier/email notifications only.",
          "",
          "Failures:",
          ...failures,
          "",
          DASHBOARD,
        ].join("\n"),
      );
    } catch {
      /* fail-soft */
    }
    return NextResponse.json(
      { reachable, checked, at: new Date().toISOString() },
      { status: 503 },
    );
  }

  /* ---------- 2. upgrade monitor ---------- */
  const admin = getSupabaseAdmin();
  if (!admin) {
    return NextResponse.json({
      reachable,
      checked,
      capacity: "skipped — SUPABASE_SERVICE_ROLE_KEY not configured",
      at: new Date().toISOString(),
    });
  }

  const { data, error } = await admin.rpc("capacity_snapshot");
  if (error || !data) {
    return NextResponse.json({
      reachable,
      checked,
      capacity: `error: ${error?.message ?? "no data"}`,
      at: new Date().toISOString(),
    });
  }

  const snapshot = data as Snapshot;
  const report = evaluate(snapshot);

  // Only shout when it matters — a healthy day sends nothing.
  if (report.level !== "ok") {
    const icon = report.level === "critical" ? "🚨" : "⚠️";
    try {
      await emailAlert(
        `${icon} Armed Capital — ${
          report.level === "critical"
            ? "upgrade required"
            : "approaching plan limits"
        }`,
        [
          report.summary,
          "",
          "Findings:",
          ...report.findings
            .filter((f) => f.level !== "ok")
            .map((f) => `• [${f.level.toUpperCase()}] ${f.detail}`),
          "",
          `Upgrade: ${DASHBOARD}/settings/billing`,
        ].join("\n"),
      );
    } catch {
      /* fail-soft */
    }
  }

  return NextResponse.json({
    reachable,
    checked,
    level: report.level,
    db_used_pct: Number((report.dbUsedPct * 100).toFixed(2)),
    findings: report.findings,
    snapshot,
    at: new Date().toISOString(),
  });
}
