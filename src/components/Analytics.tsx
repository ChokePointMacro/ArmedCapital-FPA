"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { POSTHOG_KEY, POSTHOG_HOST } from "@/lib/analytics";
import { getConsent, CONSENT_EVENT } from "@/lib/consent";

let initStarted = false;

async function initPostHog() {
  if (initStarted || typeof window === "undefined") return;
  if (!POSTHOG_KEY || getConsent() !== "accepted") return;
  initStarted = true;
  const { default: posthog } = await import("posthog-js");
  posthog.init(POSTHOG_KEY, {
    api_host: POSTHOG_HOST,
    capture_pageview: false, // captured manually on route change (App Router)
    capture_pageleave: true,
    persistence: "localStorage+cookie",
    autocapture: true,
  });
  globalThis.__posthog = posthog;
  posthog.capture("$pageview");
}

/**
 * f04 — PostHog provider. Initializes only after the user accepts analytics
 * cookies (f06) and only when a key is configured; otherwise a no-op. Captures
 * a manual $pageview on each App Router navigation.
 */
export function Analytics() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Init on mount (if already consented) and whenever consent changes.
  useEffect(() => {
    void initPostHog();
    const onConsent = () => void initPostHog();
    window.addEventListener(CONSENT_EVENT, onConsent);
    return () => window.removeEventListener(CONSENT_EVENT, onConsent);
  }, []);

  // Manual pageview on navigation.
  useEffect(() => {
    if (!globalThis.__posthog) return;
    globalThis.__posthog.capture("$pageview");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, searchParams]);

  return null;
}
