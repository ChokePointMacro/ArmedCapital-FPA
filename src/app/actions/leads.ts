"use server";

import { supabase } from "@/lib/supabase";
import {
  calculatorLeadSchema,
  assessmentSchema,
  subscriberSchema,
  type LeadResult,
} from "@/lib/leadSchemas";
import { notifyLead } from "@/lib/notify";

// f07 — savings calculator: "send full breakdown" captures the lead.
export async function submitCalculatorLead(raw: unknown): Promise<LeadResult> {
  const parsed = calculatorLeadSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid." };
  }
  const d = parsed.data;
  if (d.website_hp) return { ok: true }; // honeypot

  const { error } = await supabase.from("calculator_leads").insert({
    email: d.email,
    inputs: d.inputs,
    estimated_savings: d.estimatedSavings,
  });
  if (error) return { ok: false, error: "Couldn't save — please try again." };

  try {
    await notifyLead("calculator", {
      email: d.email,
      estimated_savings: d.estimatedSavings,
      ...d.inputs,
    });
  } catch {
    /* fail-soft */
  }
  return { ok: true };
}

// f08 — readiness assessment results.
export async function submitAssessment(raw: unknown): Promise<LeadResult> {
  const parsed = assessmentSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid." };
  }
  const d = parsed.data;
  if (d.website_hp) return { ok: true };

  const { error } = await supabase.from("assessments").insert({
    email: d.email || null,
    score: d.score,
    answers: d.answers,
    recommended_next_step: d.recommended_next_step,
  });
  if (error) return { ok: false, error: "Couldn't save — please try again." };

  try {
    await notifyLead("assessment", {
      email: d.email || null,
      score: d.score,
      next_step: d.recommended_next_step,
    });
  } catch {
    /* fail-soft */
  }
  return { ok: true };
}

// f13 — newsletter / gated-resource signup.
export async function subscribe(raw: unknown): Promise<LeadResult> {
  const parsed = subscriberSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid." };
  }
  const d = parsed.data;
  if (d.website_hp) return { ok: true };

  const { error } = await supabase
    .from("subscribers")
    .insert({ email: d.email, source: d.source || null });

  // Unique-violation = already subscribed; treat as success.
  if (error && !/duplicate|unique/i.test(error.message)) {
    return { ok: false, error: "Couldn't subscribe — please try again." };
  }

  try {
    await notifyLead("subscriber", { email: d.email, source: d.source || null });
  } catch {
    /* fail-soft */
  }
  return { ok: true };
}
