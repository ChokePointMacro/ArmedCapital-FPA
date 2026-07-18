"use client";

import { useState } from "react";
import Link from "next/link";
import { Loader2, CheckCircle2 } from "lucide-react";
import { requestAccess } from "@/app/actions/access";

export function RequestAccessForm() {
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    email: "",
    name: "",
    company: "",
    message: "",
    website_hp: "",
  });

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setState("sending");
    const res = await requestAccess(form);
    if (res.ok) {
      setState("done");
    } else {
      setState("error");
      setError(res.error);
    }
  }

  if (state === "done") {
    return (
      <div className="glass rounded-xl p-8 text-center">
        <CheckCircle2 className="mx-auto h-7 w-7 text-accent" aria-hidden />
        <h2 className="mt-4 font-mono text-lg font-semibold text-fg">Request received</h2>
        <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-muted">
          We review every request by hand. If your workspace is approved
          you&apos;ll get a sign-in link at{" "}
          <span className="font-mono text-fg">{form.email}</span>.
        </p>
        <Link
          href="/"
          className="mt-6 inline-block font-mono text-[11px] text-accent hover:underline"
        >
          Back to site
        </Link>
      </div>
    );
  }

  const field =
    "mt-2 w-full rounded-lg border border-border-hair bg-bg/40 px-4 py-3 text-sm text-fg outline-none transition-colors placeholder:text-muted/60 focus:border-accent/55";

  return (
    <form onSubmit={submit} className="glass flex flex-col gap-4 rounded-xl p-8">
      <div>
        <label htmlFor="ra-email" className="font-mono text-sm font-semibold text-fg">
          Work email *
        </label>
        <input id="ra-email" type="email" required value={form.email} onChange={set("email")} placeholder="you@company.com" className={field} />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="ra-name" className="font-mono text-sm font-semibold text-fg">Name</label>
          <input id="ra-name" value={form.name} onChange={set("name")} className={field} />
        </div>
        <div>
          <label htmlFor="ra-company" className="font-mono text-sm font-semibold text-fg">Company</label>
          <input id="ra-company" value={form.company} onChange={set("company")} className={field} />
        </div>
      </div>
      <div>
        <label htmlFor="ra-message" className="font-mono text-sm font-semibold text-fg">
          What are you trying to see?
        </label>
        <textarea id="ra-message" rows={3} value={form.message} onChange={set("message")} className={field} />
      </div>

      {/* honeypot */}
      <input
        tabIndex={-1}
        autoComplete="off"
        aria-hidden
        value={form.website_hp}
        onChange={set("website_hp")}
        className="hidden"
      />

      <button
        type="submit"
        disabled={state === "sending"}
        className="inline-flex items-center justify-center gap-2 rounded-md bg-accent px-5 py-3 font-mono text-sm text-on-accent transition-all hover:brightness-110 disabled:opacity-60"
      >
        {state === "sending" && <Loader2 className="h-4 w-4 animate-spin" />}
        {state === "sending" ? "Sending…" : "Request access"}
      </button>

      {state === "error" && (
        <p className="font-mono text-[11px] text-[#f2555a]">{error}</p>
      )}

      <p className="font-mono text-[11px] leading-relaxed text-muted">
        Workspaces are approved manually — we don&apos;t open accounts
        automatically, because the portal holds client-confidential data.
        Already have access?{" "}
        <Link href="/signin" className="text-accent hover:underline">Sign in</Link>.
      </p>
    </form>
  );
}
