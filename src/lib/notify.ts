import type { InquiryInput } from "@/lib/schema";

// Phase 1 plumbing (f01 + f02). Every channel is opt-in via env vars and
// fails soft: a missing var or a network error never breaks the inquiry insert.

type NotifyPayload = InquiryInput & { id?: string };

const TIMEOUT_MS = 4000;

async function postJson(url: string, body: unknown): Promise<void> {
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
  } finally {
    clearTimeout(t);
  }
}

function summarize(i: NotifyPayload): string {
  const lines = [
    `*New ${i.inquiry_type} inquiry* — ${i.name}${i.company ? ` (${i.company})` : ""}`,
    `email: ${i.email}`,
    i.revenue_range ? `revenue: ${i.revenue_range}` : null,
    i.sku_count ? `SKUs: ${i.sku_count}` : null,
    i.platforms?.length ? `platforms: ${i.platforms.join(", ")}` : null,
    i.source_page ? `source: ${i.source_page}` : null,
    i.message ? `\n> ${i.message}` : null,
  ].filter(Boolean);
  return lines.join("\n");
}

// f01 — Slack incoming webhook
async function notifySlack(i: NotifyPayload): Promise<void> {
  const url = process.env.SLACK_WEBHOOK_URL;
  if (!url) return;
  await postJson(url, { text: summarize(i) });
}

// f01 — Email alert via Resend REST API (no SDK dependency)
async function notifyEmail(i: NotifyPayload): Promise<void> {
  const key = process.env.RESEND_API_KEY;
  const to = process.env.ALERT_EMAIL_TO;
  if (!key || !to) return;
  const from = process.env.ALERT_EMAIL_FROM || "Armed Capital <onboarding@resend.dev>";
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify({
        from,
        to: [to],
        subject: `New ${i.inquiry_type} inquiry — ${i.name}`,
        text: summarize(i).replace(/\*/g, ""),
      }),
      signal: controller.signal,
    });
  } finally {
    clearTimeout(t);
  }
}

// f02 — HubSpot CRM sync via a Zapier catch hook (maps fields to HubSpot props)
async function notifyZapier(i: NotifyPayload): Promise<void> {
  const url = process.env.ZAPIER_INQUIRY_HOOK_URL;
  if (!url) return;
  await postJson(url, {
    id: i.id ?? null,
    inquiry_type: i.inquiry_type,
    name: i.name,
    email: i.email,
    company: i.company ?? null,
    revenue_range: i.revenue_range ?? null,
    sku_count: i.sku_count ?? null,
    platforms: i.platforms ?? [],
    message: i.message ?? null,
    source_page: i.source_page ?? null,
  });
}

/**
 * Fan out inquiry notifications. Resolves once all channels settle; individual
 * failures are swallowed so the caller's success path is never affected.
 */
export async function notifyInquiry(i: NotifyPayload): Promise<void> {
  await Promise.allSettled([notifySlack(i), notifyEmail(i), notifyZapier(i)]);
}

/**
 * Lead notifications for Phase 2 tools (calculator, assessment, newsletter).
 * Posts to a dedicated Zapier hook and/or Slack when configured; fail-soft.
 */
export async function notifyLead(
  kind: "calculator" | "assessment" | "subscriber",
  payload: Record<string, unknown>,
): Promise<number> {
  const zapier = process.env.ZAPIER_LEAD_HOOK_URL;
  const slack = process.env.SLACK_WEBHOOK_URL;
  const email = process.env.RESEND_API_KEY && process.env.ALERT_EMAIL_TO;
  const summary = Object.entries(payload)
    .filter(([, v]) => v !== null && v !== undefined && v !== "")
    .map(([k, v]) => `${k}: ${v}`)
    .join(" · ");

  const tasks: Promise<void>[] = [];
  if (zapier) tasks.push(postJson(zapier, { kind, ...payload }));
  if (slack) tasks.push(postJson(slack, { text: `*New ${kind} lead* — ${summary}` }));
  if (email) tasks.push(emailAlert(`New ${kind} lead`, summary));

  const results = await Promise.allSettled(tasks);
  return results.filter((r) => r.status === "fulfilled").length;
}

/**
 * Plain-text alert via Resend. Used as the last-resort channel when the
 * database is unavailable, so a lead is never silently dropped.
 */
export async function emailAlert(subject: string, body: string): Promise<void> {
  const key = process.env.RESEND_API_KEY;
  const to = process.env.ALERT_EMAIL_TO;
  if (!key || !to) return;
  const from =
    process.env.ALERT_EMAIL_FROM || "Armed Capital <onboarding@resend.dev>";
  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify({ from, to: [to], subject, text: body }),
      signal: controller.signal,
    });
  } finally {
    clearTimeout(t);
  }
}
