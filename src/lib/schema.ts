import { z } from "zod";
import {
  INQUIRY_TYPES,
  REVENUE_RANGES,
  SKU_COUNTS,
  PLATFORM_OPTIONS,
} from "@/lib/content";

// Validation shared by the client form (react-hook-form) and the Server Action.
export const inquirySchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(120),
  email: z.string().trim().email("Enter a valid email").max(200),
  company: z.string().trim().max(160).optional().or(z.literal("")),
  inquiry_type: z.enum(INQUIRY_TYPES),
  revenue_range: z.enum(REVENUE_RANGES).optional().or(z.literal("")),
  sku_count: z.enum(SKU_COUNTS).optional().or(z.literal("")),
  platforms: z.array(z.enum(PLATFORM_OPTIONS)).optional().default([]),
  message: z.string().trim().max(4000).optional().or(z.literal("")),
  source_page: z.string().max(40).optional().or(z.literal("")),
  // Honeypot — must stay empty. Bots fill it; humans never see it.
  website_hp: z.string().max(0).optional().or(z.literal("")),
});

export type InquiryInput = z.infer<typeof inquirySchema>;

export type InquiryResult =
  | { ok: true }
  | { ok: false; error: string };
