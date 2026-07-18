// f30 — "do I need to upgrade yet?" monitor.
//
// Pure logic, no I/O, so the thresholds can be reasoned about (and tested)
// without touching the database.

/**
 * Supabase Free-tier ceilings. These are the plan limits, NOT measurements —
 * verify against https://supabase.com/pricing if the plan changes, and update
 * here. Everything else in this file is derived.
 */
export const FREE_TIER = {
  dbBytes: 500 * 1024 * 1024, // 500 MB database
  /** Free projects auto-pause after ~7 days with no activity. */
  pauseAfterIdleDays: 7,
};

/** Fraction of a limit at which we warn / shout. */
export const WARN_AT = 0.75;
export const CRITICAL_AT = 0.9;

/**
 * Monthly lead volume above which the free tier stops being appropriate —
 * not because of a hard limit, but because an auto-pausing database is not a
 * reasonable place to land real revenue.
 */
export const LEADS_PER_MONTH_UPGRADE = 25;

export type Snapshot = {
  captured_at: string;
  db_size_bytes: number;
  rows: Record<string, number>;
  leads_last_30d: number;
  a_leads_last_30d: number;
  newest_lead_at: string | null;
};

export type Level = "ok" | "warn" | "critical";
export type Finding = { level: Level; metric: string; detail: string };

const mb = (b: number) => (b / (1024 * 1024)).toFixed(1) + " MB";
const rank: Record<Level, number> = { ok: 0, warn: 1, critical: 2 };

export function evaluate(s: Snapshot): {
  level: Level;
  findings: Finding[];
  summary: string;
  dbUsedPct: number;
} {
  const findings: Finding[] = [];

  // ---- database size vs plan limit ----
  const dbUsedPct = s.db_size_bytes / FREE_TIER.dbBytes;
  const dbDetail = `Database is ${mb(s.db_size_bytes)} of ${mb(
    FREE_TIER.dbBytes,
  )} (${(dbUsedPct * 100).toFixed(1)}%).`;
  if (dbUsedPct >= CRITICAL_AT) {
    findings.push({
      level: "critical",
      metric: "database_size",
      detail: `${dbDetail} Upgrade now — writes fail once the limit is hit, which means lost leads.`,
    });
  } else if (dbUsedPct >= WARN_AT) {
    findings.push({
      level: "warn",
      metric: "database_size",
      detail: `${dbDetail} Plan an upgrade in the next few weeks.`,
    });
  } else {
    findings.push({ level: "ok", metric: "database_size", detail: dbDetail });
  }

  // ---- lead volume: a business trigger, not a technical one ----
  if (s.leads_last_30d >= LEADS_PER_MONTH_UPGRADE) {
    findings.push({
      level: "warn",
      metric: "lead_volume",
      detail: `${s.leads_last_30d} leads in the last 30 days (${s.a_leads_last_30d} graded A). At this volume an auto-pausing free-tier database is a real revenue risk — move to a paid plan.`,
    });
  } else {
    findings.push({
      level: "ok",
      metric: "lead_volume",
      detail: `${s.leads_last_30d} leads in the last 30 days (${s.a_leads_last_30d} graded A).`,
    });
  }

  // ---- idle risk: the thing that already bit once ----
  if (s.newest_lead_at) {
    const idleDays =
      (Date.now() - new Date(s.newest_lead_at).getTime()) / 86_400_000;
    if (idleDays > FREE_TIER.pauseAfterIdleDays) {
      findings.push({
        level: "warn",
        metric: "idle_risk",
        detail: `No new lead for ${idleDays.toFixed(
          0,
        )} days. The daily keep-alive is what's holding the project awake — if that cron ever stops, the project pauses and lead capture dies silently.`,
      });
    }
  }

  const level = findings.reduce<Level>(
    (worst, f) => (rank[f.level] > rank[worst] ? f.level : worst),
    "ok",
  );

  const summary = [
    `status: ${level.toUpperCase()}`,
    dbDetail,
    `leads (30d): ${s.leads_last_30d} · A-grade: ${s.a_leads_last_30d}`,
    `rows: ${Object.entries(s.rows)
      .map(([k, v]) => `${k}=${v}`)
      .join(" · ")}`,
  ].join("\n");

  return { level, findings, summary, dbUsedPct };
}
