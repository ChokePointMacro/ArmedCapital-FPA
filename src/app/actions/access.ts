"use server";

import { z } from "zod";
import { supabase } from "@/lib/supabase";
import { emailAlert } from "@/lib/notify";

const schema = z.object({
  email: z.string().email().max(200),
  name: z.string().max(120).optional().or(z.literal("")),
  company: z.string().max(160).optional().or(z.literal("")),
  message: z.string().max(1000).optional().or(z.literal("")),
  website_hp: z.string().max(0).optional().or(z.literal("")),
});

export type AccessResult = { ok: true } | { ok: false; error: string };

/**
 * f31 — public "request portal access" form.
 *
 * Inserts a pending row (insert-only RLS for anon) and alerts the team.
 * Approval is a deliberate manual step: no account is created here.
 */
export async function requestAccess(raw: unknown): Promise<AccessResult> {
  const parsed = schema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid." };
  }
  const d = parsed.data;
  if (d.website_hp) return { ok: true }; // honeypot

  const { error } = await supabase.from("access_requests").insert({
    email: d.email,
    name: d.name || null,
    company: d.company || null,
    message: d.message || null,
  });

  const summary = [
    `email: ${d.email}`,
    d.name ? `name: ${d.name}` : null,
    d.company ? `company: ${d.company}` : null,
    d.message ? `message: ${d.message}` : null,
  ].filter(Boolean).join("\n");

  if (error) {
    // DB down — still get the request to a human.
    try {
      await emailAlert(
        "⚠️ Portal access request (DB unavailable)",
        `${summary}\n\nNOTE: could not be saved to the database: ${error.message}`,
      );
      return { ok: true };
    } catch {
      return { ok: false, error: "Couldn't submit — please email us directly." };
    }
  }

  try {
    await emailAlert("New portal access request", summary);
  } catch {
    /* fail-soft */
  }
  return { ok: true };
}
