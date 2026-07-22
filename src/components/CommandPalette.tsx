"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  CornerDownLeft,
  SunMoon,
  CalendarClock,
  ArrowRight,
} from "lucide-react";

type Item = {
  id: string;
  label: string;
  hint?: string;
  keywords?: string;
  run: (ctx: { router: ReturnType<typeof useRouter> }) => void;
};

const NAV: { label: string; href: string; hint?: string }[] = [
  { label: "Home", href: "/" },
  { label: "Services", href: "/services" },
  { label: "Pricing", href: "/pricing" },
  { label: "Savings calculator", href: "/calculator", hint: "tool" },
  { label: "Readiness assessment", href: "/assessment", hint: "tool" },
  { label: "Executive dashboard", href: "/dashboard", hint: "sample" },
  { label: "Live demo", href: "/demo" },
  { label: "Reports", href: "/reports", hint: "sample" },
  { label: "Pipeline Tracker", href: "/pipeline", hint: "sample" },
  { label: "Insights", href: "/insights" },
  { label: "Case studies", href: "/case-studies" },
  { label: "About", href: "/about" },
  { label: "Investors", href: "/investors" },
  { label: "Contact", href: "/contact" },
  { label: "Client sign in", href: "/signin", hint: "portal" },
  { label: "Request portal access", href: "/request-access", hint: "portal" },
  { label: "Security & Trust", href: "/trust" },
];

function toggleTheme() {
  const isLight =
    document.documentElement.getAttribute("data-theme") === "light";
  const next = isLight ? "dark" : "light";
  if (next === "light")
    document.documentElement.setAttribute("data-theme", "light");
  else document.documentElement.removeAttribute("data-theme");
  try {
    localStorage.setItem("ac-theme", next);
  } catch {
    /* ignore */
  }
}

export function CommandPalette() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const items: Item[] = useMemo(() => {
    const navItems: Item[] = NAV.map((n) => ({
      id: `nav:${n.href}`,
      label: n.label,
      hint: n.hint ?? "page",
      keywords: n.href,
      run: ({ router }) => router.push(n.href),
    }));
    const actions: Item[] = [
      {
        id: "action:inquiry",
        label: "Start an inquiry",
        hint: "action",
        keywords: "contact lead",
        run: ({ router }) => router.push("/contact"),
      },
      {
        id: "action:book",
        label: "Book a call",
        hint: "action",
        keywords: "calendly meeting",
        run: ({ router }) => router.push("/contact"),
      },
      {
        id: "action:theme",
        label: "Toggle light / dark theme",
        hint: "action",
        keywords: "dark light mode",
        run: () => toggleTheme(),
      },
    ];
    return [...navItems, ...actions];
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter((i) =>
      `${i.label} ${i.hint ?? ""} ${i.keywords ?? ""}`
        .toLowerCase()
        .includes(q),
    );
  }, [items, query]);

  const close = useCallback(() => {
    setOpen(false);
    setQuery("");
    setActive(0);
  }, []);

  // Global ⌘K / Ctrl+K
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((v) => !v);
      }
      if (e.key === "Escape") close();
    };
    const onOpen = () => setOpen(true);
    window.addEventListener("keydown", onKey);
    window.addEventListener("ac:open-palette", onOpen);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("ac:open-palette", onOpen);
    };
  }, [close]);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 10);
  }, [open]);

  if (!open) return null;

  const activate = (item?: Item) => {
    const target = item ?? filtered[active];
    if (!target) return;
    close();
    target.run({ router });
  };

  return (
    <div
      className="fixed inset-0 z-[80] flex items-start justify-center px-4 pt-[12vh]"
      role="dialog"
      aria-modal="true"
      aria-label="Command palette"
    >
      <div
        className="absolute inset-0 bg-bg/70 backdrop-blur-sm"
        onClick={close}
        aria-hidden
      />
      <div className="glass relative w-full max-w-lg overflow-hidden rounded-xl shadow-2xl shadow-black/50">
        <div className="flex items-center gap-2 border-b border-border-hair px-4">
          <Search className="h-4 w-4 text-muted" aria-hidden />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setActive(0);
            }}
            onKeyDown={(e) => {
              if (e.key === "ArrowDown") {
                e.preventDefault();
                setActive((a) => Math.min(a + 1, filtered.length - 1));
              } else if (e.key === "ArrowUp") {
                e.preventDefault();
                setActive((a) => Math.max(a - 1, 0));
              } else if (e.key === "Enter") {
                e.preventDefault();
                activate();
              }
            }}
            placeholder="Jump to… (try 'pricing', 'calculator', 'theme')"
            className="w-full bg-transparent py-3.5 font-mono text-sm text-fg placeholder:text-muted/60 focus:outline-none"
          />
          <kbd className="hidden rounded border border-border-hair px-1.5 py-0.5 font-mono text-[10px] text-muted sm:inline">
            esc
          </kbd>
        </div>

        <ul className="max-h-[50vh] overflow-y-auto p-2">
          {filtered.length === 0 && (
            <li className="px-3 py-6 text-center font-mono text-xs text-muted">
              No matches.
            </li>
          )}
          {filtered.map((item, i) => (
            <li key={item.id}>
              <button
                onMouseEnter={() => setActive(i)}
                onClick={() => activate(item)}
                className={`flex w-full items-center justify-between gap-3 rounded-md px-3 py-2.5 text-left text-sm ${
                  i === active
                    ? "bg-accent/10 text-fg"
                    : "text-fg/80 hover:bg-surface/60"
                }`}
              >
                <span className="flex items-center gap-2.5">
                  {item.hint === "action" ? (
                    item.id === "action:theme" ? (
                      <SunMoon className="h-4 w-4 text-violet" aria-hidden />
                    ) : item.id === "action:book" ? (
                      <CalendarClock className="h-4 w-4 text-cyan" aria-hidden />
                    ) : (
                      <ArrowRight className="h-4 w-4 text-accent" aria-hidden />
                    )
                  ) : (
                    <span className="font-mono text-xs text-muted">{">"}</span>
                  )}
                  {item.label}
                </span>
                <span className="flex items-center gap-2">
                  <span className="font-mono text-[10px] uppercase tracking-wider text-muted">
                    {item.hint}
                  </span>
                  {i === active && (
                    <CornerDownLeft className="h-3.5 w-3.5 text-accent" aria-hidden />
                  )}
                </span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
