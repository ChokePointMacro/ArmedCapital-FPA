"use client";

import { useState } from "react";
import Link from "next/link";
import { Loader2, MailCheck } from "lucide-react";
import { getBrowserSupabase } from "@/lib/supabaseBrowser";

/**
 * Magic-link sign in. No passwords are ever collected or stored.
 *
 * The response is deliberately identical whether or not the address has an
 * account — otherwise this form becomes a way to enumerate your client list.
 */
export function SignInForm() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">(
    "idle",
  );
  const [message, setMessage] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setState("sending");
    const supabase = getBrowserSupabase();
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: {
        emailRedirectTo:
          typeof window !== "undefined" ? `${window.location.origin}/app` : undefined,
        shouldCreateUser: false, // invite/approval only — no self-registration
      },
    });
    if (error && !/user not found|signups not allowed/i.test(error.message)) {
      setState("error");
      setMessage("Something went wrong sending the link. Try again shortly.");
      return;
    }
    setState("sent");
  }

  if (state === "sent") {
    return (
      <div className="glass rounded-xl p-8 text-center">
        <MailCheck className="mx-auto h-7 w-7 text-accent" aria-hidden />
        <h2 className="mt-4 font-mono text-lg font-semibold text-fg">
          Check your inbox
        </h2>
        <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-muted">
          If <span className="font-mono text-fg">{email}</span> is attached to a
          client workspace, a sign-in link is on its way. It expires in
          60&nbsp;minutes.
        </p>
        <p className="mt-6 font-mono text-[11px] text-muted">
          Don&apos;t have access yet?{" "}
          <Link href="/request-access" className="text-accent hover:underline">
            Request it
          </Link>
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="glass rounded-xl p-8">
      <label
        htmlFor="portal-email"
        className="font-mono text-sm font-semibold text-fg"
      >
        Work email
      </label>
      <input
        id="portal-email"
        type="email"
        required
        autoComplete="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="you@company.com"
        className="mt-3 w-full rounded-lg border border-border-hair bg-bg/40 px-4 py-3.5 text-sm text-fg outline-none transition-colors placeholder:text-muted/60 focus:border-accent/55"
      />

      <button
        type="submit"
        disabled={state === "sending"}
        className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-md bg-accent px-5 py-3 font-mono text-sm text-on-accent transition-all hover:brightness-110 disabled:opacity-60"
      >
        {state === "sending" && <Loader2 className="h-4 w-4 animate-spin" />}
        {state === "sending" ? "Sending link…" : "Email me a sign-in link"}
      </button>

      {state === "error" && (
        <p className="mt-3 font-mono text-[11px] text-[#f2555a]">{message}</p>
      )}

      <p className="mt-5 font-mono text-[11px] leading-relaxed text-muted">
        No password required. Access is granted per workspace — if you
        don&apos;t have one yet,{" "}
        <Link href="/request-access" className="text-accent hover:underline">
          request access
        </Link>
        .
      </p>
    </form>
  );
}
