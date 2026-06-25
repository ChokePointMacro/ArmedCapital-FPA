import { z } from "zod";

// Shared validation for Phase 2 lead-capture tools (f07, f08, f13).

const email = z.string().trim().email("Enter a valid email").max(200);

export const calculatorLeadSchema = z.object({
  email,
  inputs: z.object({
    annualRevenue: z.number().nonnegative(),
    skuCount: z.number().nonnegative(),
    currentDaysOnHand: z.number().nonnegative(),
    targetDaysOnHand: z.number().nonnegative(),
    carryingCostPct: z.number().nonnegative(),
  }),
  estimatedSavings: z.number().nonnegative(),
  // honeypot
  website_hp: z.string().max(0).optional().or(z.literal("")),
});
export type CalculatorLeadInput = z.infer<typeof calculatorLeadSchema>;

export const assessmentSchema = z.object({
  email: email.optional().or(z.literal("")),
  score: z.number().int().min(0).max(100),
  answers: z.record(z.string(), z.union([z.string(), z.number()])),
  recommended_next_step: z.string().max(400),
  website_hp: z.string().max(0).optional().or(z.literal("")),
});
export type AssessmentInput = z.infer<typeof assessmentSchema>;

export const subscriberSchema = z.object({
  email,
  source: z.string().max(60).optional().or(z.literal("")),
  website_hp: z.string().max(0).optional().or(z.literal("")),
});
export type SubscriberInput = z.infer<typeof subscriberSchema>;

export type LeadResult = { ok: true } | { ok: false; error: string };
