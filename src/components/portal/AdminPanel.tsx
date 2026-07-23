"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Loader2, ShieldAlert, Check, X, UserPlus } from "lucide-react";
import { getBrowserSupabase } from "@/lib/supabaseBrowser";
import {
  listAccessRequests,
  approveAccessRequest,
  denyAccessRequest,
  createWorkspace,
  type AccessRequestRow,
} from "@/app/actions/admin";

type Phase =
  | { kind: "loading" }
  | { kind: "anon" }
  | { kind: "forbidden" }
  | { kind: "ready"; token: string };

export function AdminPanel() {
  const [phase, setPhase] = useState<Phase>({ kind: "loading" });
  const [rows, setRows] = useState<AccessRequestRow[]>([]);
  const [busy, setBusy] = useState<string | null>(null);
  const [notice, setNotice] = useState<string>("");

  const refresh = useCallback(async (token: string) => {
    const res = await listAccessRequests(token);
    if (res.ok) setRows(res.data ?? []);
    else setNotice(res.error);
  }, []);

  useEffect(() => {
    (async () => {
      const {
        data: { session },
      } = await getBrowserSupabase().auth.getSession();
      const token = session?.access_token;
      if (!token) {
        setPhase({ kind: "anon" });
        return;
      }
      const res = await listAccessRequests(token);
      if (!res.ok) {
        setPhase(res.error === "Not authorized." ? { kind: "forbidden" } : { kind: "ready", token });
        if (res.error !== "Not authorized.") setNotice(res.error);
        return;
      }
      setRows(res.data ?? []);
      setPhase({ kind: "ready", token });
    })();
  }, []);

  async function onApprove(r: AccessRequestRow, token: string) {
    const orgName = window.prompt(
      `Workspace name for ${r.company || r.email}?`,
      r.company || "",
    );
    if (!orgName) return;
    setBusy(r.id);
    setNotice("");
    const res = await approveAccessRequest(token, { requestId: r.id, orgName });
    setBusy(null);
    if (!res.ok) setNotice(res.error);
    else {
      setNotice(`Approved ${r.email} → "${orgName}".`);
      await refresh(token);
    }
  }

  async function onDeny(r: AccessRequestRow, token: string) {
    setBusy(r.id);
    const res = await denyAccessRequest(token, r.id);
    setBusy(null);
    if (!res.ok) setNotice(res.error);
    else await refresh(token);
  }

  async function onCreate(e: React.FormEvent<HTMLFormElement>, token: string) {
    e.preventDefault();
    const form = e.currentTarget;
    const email = (form.elements.namedItem("email") as HTMLInputElement).value.trim();
    const orgName = (form.elements.namedItem("orgName") as HTMLInputElement).value.trim();
    if (!email || !orgName) return;
    setBusy("create");
    setNotice("");
    const res = await createWorkspace(token, { email, orgName });
    setBusy(null);
    if (!res.ok) setNotice(res.error);
    else {
      setNotice(`Created workspace "${orgName}" for ${email}.`);
      form.reset();
      await refresh(token);
    }
  }

  if (phase.kind === "loading") {
    return (
      <div className="flex items-center gap-3 py-24 font-mono text-sm text-muted">
        <Loader2 className="h-4 w-4 animate-spin" /> Loading admin…
      </div>
    );
  }

  if (phase.kind === "anon" || phase.kind === "forbidden") {
    return (
      <div className="mx-auto max-w-2xl py-24">
        <div className="glass rounded-xl p-8">
          <ShieldAlert className="h-6 w-6 text-[#f5a623]" aria-hidden />
          <h1 className="mt-4 font-mono text-xl font-semibold text-fg">
            {phase.kind === "anon" ? "Sign in required" : "Not authorized"}
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-muted">
            {phase.kind === "anon"
              ? "This area is for Armed Capital staff. Sign in to continue."
              : "Your account isn't on the admin allowlist."}
          </p>
          <Link
            href={phase.kind === "anon" ? "/signin" : "/app"}
            className="mt-6 inline-block rounded-md bg-accent px-4 py-2 font-mono text-sm text-on-accent hover:brightness-110"
          >
            {phase.kind === "anon" ? "Sign in" : "Back to workspace"}
          </Link>
        </div>
      </div>
    );
  }

  const { token } = phase;
  const pending = rows.filter((r) => r.status === "pending");

  return (
    <div className="space-y-10">
      <section>
        <h2 className="font-mono text-lg font-semibold text-fg">
          Access requests
          {pending.length > 0 && (
            <span className="ml-2 rounded-full bg-accent/15 px-2 py-0.5 font-mono text-[11px] text-accent">
              {pending.length} pending
            </span>
          )}
        </h2>
        {notice && (
          <p className="mt-3 font-mono text-[12px] text-cyan">{notice}</p>
        )}
        <div className="mt-4 overflow-x-auto">
          {rows.length === 0 ? (
            <p className="py-8 font-mono text-sm text-muted">No requests yet.</p>
          ) : (
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="font-mono text-[11px] uppercase tracking-wider text-muted">
                <tr className="border-b border-border-hair">
                  <th className="py-2 pr-4">Email</th>
                  <th className="py-2 pr-4">Company</th>
                  <th className="py-2 pr-4">Status</th>
                  <th className="py-2 pr-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id} className="border-b border-border-hair/60">
                    <td className="py-3 pr-4 font-mono text-fg">{r.email}</td>
                    <td className="py-3 pr-4 text-muted">{r.company || "—"}</td>
                    <td className="py-3 pr-4">
                      <span
                        className={`font-mono text-[11px] ${
                          r.status === "approved"
                            ? "text-accent"
                            : r.status === "denied"
                              ? "text-muted"
                              : "text-[#f5a623]"
                        }`}
                      >
                        {r.status}
                      </span>
                    </td>
                    <td className="py-3 pr-4 text-right">
                      {r.status === "pending" ? (
                        <div className="inline-flex gap-2">
                          <button
                            onClick={() => onApprove(r, token)}
                            disabled={busy === r.id}
                            className="inline-flex items-center gap-1.5 rounded-md bg-accent px-3 py-1.5 font-mono text-[12px] text-on-accent hover:brightness-110 disabled:opacity-60"
                          >
                            {busy === r.id ? (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (
                              <Check className="h-3 w-3" />
                            )}
                            Approve
                          </button>
                          <button
                            onClick={() => onDeny(r, token)}
                            disabled={busy === r.id}
                            className="inline-flex items-center gap-1.5 rounded-md border border-border-hair px-3 py-1.5 font-mono text-[12px] text-muted hover:text-fg disabled:opacity-60"
                          >
                            <X className="h-3 w-3" /> Deny
                          </button>
                        </div>
                      ) : (
                        <span className="font-mono text-[11px] text-muted">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>

      <section>
        <h2 className="font-mono text-lg font-semibold text-fg">
          Create a workspace directly
        </h2>
        <p className="mt-2 text-sm text-muted">
          Provisions the account + workspace immediately. The client then signs
          in with a magic link at{" "}
          <span className="font-mono text-fg">/signin</span>.
        </p>
        <form
          onSubmit={(e) => onCreate(e, token)}
          className="glass mt-4 flex flex-col gap-3 rounded-xl p-5 sm:flex-row sm:items-end"
        >
          <label className="flex-1">
            <span className="font-mono text-[12px] text-muted">Client email</span>
            <input
              name="email"
              type="email"
              required
              placeholder="ops@client.com"
              className="mt-1.5 w-full rounded-md border border-border-hair bg-bg/40 px-3.5 py-2.5 text-sm text-fg outline-none placeholder:text-muted/60 focus:border-accent/55"
            />
          </label>
          <label className="flex-1">
            <span className="font-mono text-[12px] text-muted">Workspace name</span>
            <input
              name="orgName"
              type="text"
              required
              placeholder="Acme Goods Co."
              className="mt-1.5 w-full rounded-md border border-border-hair bg-bg/40 px-3.5 py-2.5 text-sm text-fg outline-none placeholder:text-muted/60 focus:border-accent/55"
            />
          </label>
          <button
            type="submit"
            disabled={busy === "create"}
            className="inline-flex items-center justify-center gap-2 rounded-md bg-accent px-4 py-2.5 font-mono text-sm text-on-accent hover:brightness-110 disabled:opacity-60"
          >
            {busy === "create" ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <UserPlus className="h-4 w-4" />
            )}
            Create
          </button>
        </form>
      </section>
    </div>
  );
}
