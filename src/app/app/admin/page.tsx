"use client";

import Link from "next/link";
import { AdminPanel } from "@/components/portal/AdminPanel";

export default function AdminPage() {
  return (
    <div className="mx-auto max-w-6xl px-5 py-10">
      <div className="mb-8 flex items-center justify-between border-b border-border-hair pb-4">
        <div>
          <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-accent">
            armed capital · admin
          </div>
          <h1 className="mt-1 font-mono text-xl font-semibold text-fg">
            Client access
          </h1>
        </div>
        <Link
          href="/app"
          className="font-mono text-[12px] text-muted hover:text-fg"
        >
          ← Workspace
        </Link>
      </div>
      <AdminPanel />
    </div>
  );
}
