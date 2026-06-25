// f06 — minimal cookie/analytics consent stored in localStorage.
// "analytics" gates PostHog (f04). Essential cookies need no consent.

export type ConsentValue = "accepted" | "rejected" | null;

const KEY = "ac_consent_analytics";
export const CONSENT_EVENT = "ac:consent-changed";

export function getConsent(): ConsentValue {
  if (typeof window === "undefined") return null;
  try {
    const v = window.localStorage.getItem(KEY);
    return v === "accepted" || v === "rejected" ? v : null;
  } catch {
    return null;
  }
}

export function setConsent(value: Exclude<ConsentValue, null>): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, value);
    window.dispatchEvent(new CustomEvent(CONSENT_EVENT, { detail: value }));
  } catch {
    // storage may be unavailable (private mode) — fail soft
  }
}
