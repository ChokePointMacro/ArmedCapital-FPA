"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Cookie } from "lucide-react";
import { getConsent, setConsent } from "@/lib/consent";
import { POSTHOG_KEY } from "@/lib/analytics";

/**
 * f06 — cookie consent banner. Gates analytics (f04). Only shown when an
 * analytics key is configured and the user hasn't chosen yet — otherwise there
 * are no non-essential cookies to consent to.
 */
export function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (POSTHOG_KEY && getConsent() === null) setVisible(true);
  }, []);

  if (!visible) return null;

  const choose = (v: "accepted" | "rejected") => {
    setConsent(v);
    setVisible(false);
  };

  return (
    <div className="fixed inset-x-0 bottom-0 z-[60] p-4 sm:p-6">
      <div className="glass mx-auto flex max-w-3xl flex-col gap-4 rounded-xl p-5 shadow-2xl shadow-black/40 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <Cookie className="mt-0.5 h-5 w-5 shrink-0 text-accent" aria-hidden />
          <p className="text-sm leading-relaxed text-muted">
            We use privacy-friendly analytics to improve the site. Essential
            cookies always run.{" "}
            <Link href="/privacy" className="text-cyan hover:underline">
              Privacy Policy
            </Link>
            .
          </p>
        </div>
        <div className="flex shrink-0 gap-2">
          <button
            onClick={() => choose("rejected")}
            className="rounded-md border border-border-hair px-4 py-2 font-mono text-xs text-muted transition-colors hover:text-fg"
          >
            Decline
          </button>
          <button
            onClick={() => choose("accepted")}
            className="rounded-md bg-accent px-4 py-2 font-mono text-xs font-medium text-bg transition-all hover:brightness-110"
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  );
}
