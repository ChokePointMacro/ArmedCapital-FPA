"use server";

import { supabase } from "@/lib/supabase";
import { inquirySchema, type InquiryResult } from "@/lib/schema";

/**
 * submitInquiry — validates an inbound inquiry and inserts it into Supabase.
 *
 * Runs server-side with the anon key against an INSERT-only RLS policy.
 * Server Actions are reachable via direct POST, so we re-validate here
 * regardless of any client-side validation.
 */
export async function submitInquiry(
  raw: unknown,
): Promise<InquiryResult> {
  const parsed = inquirySchema.safeParse(raw);

  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Invalid submission.",
    };
  }

  const data = parsed.data;

  // Honeypot: a filled hidden field means a bot. Silently accept (return ok)
  // so the bot gets no signal, but write nothing.
  if (data.website_hp) {
    return { ok: true };
  }

  const { error } = await supabase.from("inquiries").insert({
    inquiry_type: data.inquiry_type,
    name: data.name,
    company: data.company || null,
    email: data.email,
    revenue_range: data.revenue_range || null,
    platforms: data.platforms?.length ? data.platforms : null,
    sku_count: data.sku_count || null,
    message: data.message || null,
    source_page: data.source_page || null,
  });

  if (error) {
    return {
      ok: false,
      error: "Something went wrong submitting your inquiry. Please try again.",
    };
  }

  return { ok: true };
}
