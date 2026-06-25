"use client";

import { useState } from "react";
import { Loader2, CheckCircle2 } from "lucide-react";
import { subscribe } from "@/app/actions/leads";
import { track } from "@/lib/analytics";

export function NewsletterSignup({
  source = "footer",
  compact = false,
}: {
  source?: string;
  compact?: boolean;
}) {
  const [email, setEmail] = useState("");
  const [hp, setHp] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "ok" | "error">(
    "idle",
  );
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("submitting");
    setError(null);
    const res = await subscribe({ email, source, website_hp: hp });
    if (res.ok) {
      track("newsletter_signup", { source });
      setStatus("ok");
      setEmail("");
    } else {
      setStatus("error");
      setError(res.error);
    }
  }

  if (status === "ok") {
    return (
      <div className="flex items-center gap-2 font-mono text-sm text-accent">
        <CheckCircle2 className="h-4 w-4" aria-hidden /> Subscribed — watch your
        inbox.
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-2">
      {!compact && (
        <label htmlFor={`nl-${source}`} className="font-mono text-xs text-muted">
          The Roll-Forward — occasional notes on forecasting & inventory.
        </label>
      )}
      <div className="flex gap-2">
        <input
          id={`nl-${source}`}
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@company.com"
          className="min-w-0 flex-1 rounded-md border border-border-hair bg-bg/60 px-3.5 py-2.5 text-sm text-fg placeholder:text-muted/60 focus:border-accent/60 focus:outline-none"
        />
        <button
          type="submit"
          disabled={status === "submitting"}
          className="inline-flex shrink-0 items-center gap-2 rounded-md border border-border-hair px-4 py-2.5 font-mono text-sm text-fg transition-colors hover:border-accent/55 hover:text-accent disabled:opacity-50"
        >
          {status === "submitting" ? (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
          ) : (
            "Subscribe"
          )}
        </button>
      </div>
      <input
        type="text"
        tabIndex={-1}
        autoComplete="off"
        value={hp}
        onChange={(e) => setHp(e.target.value)}
        className="pointer-events-none absolute -left-[9999px] h-0 w-0"
        aria-hidden
      />
      {status === "error" && error && (
        <p className="font-mono text-xs text-[#ff7a72]">{error}</p>
      )}
    </form>
  );
}
