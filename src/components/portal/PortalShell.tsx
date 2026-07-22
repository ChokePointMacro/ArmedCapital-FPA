"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LogOut, Loader2, ShieldAlert } from "lucide-react";
import { getBrowserSupabase } from "@/lib/supabaseBrowser";

export type Org = { id: string; name: string; slug: string };

type State =
  | { kind: "loading" }
  | { kind: "anon" }
  | { kind: "no-org"; email: string }
  | { kind: "ready"; email: string; org: Org };

const TABS = [
  { href: "/app", label: "Overview" },
  { href: "/app/inventory", label: "Inventory" },
  { href: "/app/pipeline", label: "PO Pipeline" },
];

/**
 * Auth guard + chrome for the client portal.
 *
 * The redirect here is a UX convenience only — the real protection is RLS in
 * Postgres. Even a user who bypassed this shell would read zero rows.
 */
export function PortalShell({
  children,
}: {
  children: (ctx: { org: Org; email: string }) => React.ReactNode;
}) {
  const [state, setState] = useState<State>({ kind: "loading" });
  const pathname = usePathname();
  const router = useRouter();

  const load = useCallback(async () => {
    const supabase = getBrowserSupabase();
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session?.user) {
      setState({ kind: "anon" });
      return;
    }
    const email = session.user.email ?? "";

    // Which org(s) does this user belong to? RLS restricts this to their own.
    const { data: memberships } = await supabase
      .from("org_members")
      .select("org_id")
      .limit(1);

    const orgId = memberships?.[0]?.org_id;
    if (!orgId) {
      setState({ kind: "no-org", email });
      return;
    }

    const { data: org } = await supabase
      .from("orgs")
      .select("id, name, slug")
      .eq("id", orgId)
      .single();

    if (!org) {
      setState({ kind: "no-org", email });
      return;
    }
    setState({ kind: "ready", email, org: org as Org });
  }, []);

  useEffect(() => {
    // Subscribes React state to Supabase auth + initial session fetch (async,
    // so no synchronous setState) — the rule's permitted "external system" case.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
    const supabase = getBrowserSupabase();
    const { data: sub } = supabase.auth.onAuthStateChange(() => void load());
    return () => sub.subscription.unsubscribe();
  }, [load]);

  useEffect(() => {
    if (state.kind === "anon") router.replace("/signin");
  }, [state.kind, router]);

  async function signOut() {
    await getBrowserSupabase().auth.signOut();
    router.replace("/signin");
  }

  if (state.kind === "loading" || state.kind === "anon") {
    return (
      <div className="mx-auto flex max-w-6xl items-center gap-3 px-5 py-32 font-mono text-sm text-muted">
        <Loader2 className="h-4 w-4 animate-spin" />
        {state.kind === "anon" ? "Redirecting to sign in…" : "Loading your workspace…"}
      </div>
    );
  }

  if (state.kind === "no-org") {
    return (
      <div className="mx-auto max-w-2xl px-5 py-24">
        <div className="glass rounded-xl p-8">
          <ShieldAlert className="h-6 w-6 text-[#f5a623]" aria-hidden />
          <h1 className="mt-4 font-mono text-xl font-semibold text-fg">
            No workspace yet
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-muted">
            You&apos;re signed in as{" "}
            <span className="font-mono text-fg">{state.email}</span>, but this
            address isn&apos;t attached to a client workspace yet. That usually
            means your access request is still being reviewed.
          </p>
          <div className="mt-6 flex items-center gap-3">
            <Link
              href="/contact"
              className="rounded-md bg-accent px-4 py-2 font-mono text-sm text-on-accent hover:brightness-110"
            >
              Contact us
            </Link>
            <button
              onClick={signOut}
              className="font-mono text-sm text-muted hover:text-fg"
            >
              Sign out
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-5 py-10">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-border-hair pb-4">
        <div>
          <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-accent">
            client workspace
          </div>
          <h1 className="mt-1 font-mono text-xl font-semibold text-fg">
            {state.org.name}
          </h1>
        </div>
        <div className="flex items-center gap-3 font-mono text-[11px] text-muted">
          <span>{state.email}</span>
          <button
            onClick={signOut}
            className="inline-flex items-center gap-1.5 rounded-md border border-border-hair px-2.5 py-1.5 transition-colors hover:border-accent/55 hover:text-accent"
          >
            <LogOut className="h-3 w-3" aria-hidden /> Sign out
          </button>
        </div>
      </div>

      <nav className="mb-8 flex flex-wrap gap-1 rounded-lg border border-border-hair bg-surface/40 p-1">
        {TABS.map((t) => {
          const active = pathname === t.href;
          return (
            <Link
              key={t.href}
              href={t.href}
              className={`rounded-md px-3.5 py-2 font-mono text-[13px] transition-colors ${
                active
                  ? "bg-accent text-on-accent"
                  : "text-muted hover:text-fg"
              }`}
            >
              {t.label}
            </Link>
          );
        })}
      </nav>

      {children({ org: state.org, email: state.email })}
    </div>
  );
}
