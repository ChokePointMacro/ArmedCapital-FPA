// f04 — thin analytics wrapper around PostHog.
//
// Safe to call anywhere: it no-ops on the server, when no key is configured,
// or before the user has accepted analytics cookies (see CookieConsent + the
// Analytics provider, which only init PostHog after consent).

import type { PostHog } from "posthog-js";

declare global {
  var __posthog: PostHog | undefined;
}

export const POSTHOG_KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY;
export const POSTHOG_HOST =
  process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com";

export function getPostHog(): PostHog | undefined {
  if (typeof window === "undefined") return undefined;
  return globalThis.__posthog;
}

/** Capture a product event. Known events: inquiry_submitted,
 * calculator_completed, booking_clicked, assessment_completed. */
export function track(
  event: string,
  properties?: Record<string, unknown>,
): void {
  getPostHog()?.capture(event, properties);
}
