"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Menu, X, Search, ChevronDown } from "lucide-react";
import { ButtonLink } from "@/components/Button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { SITE } from "@/lib/content";

function openPalette() {
  window.dispatchEvent(new Event("ac:open-palette"));
}

type NavItem = { href: string; label: string };
type NavEntry =
  | { kind: "link"; href: string; label: string }
  | { kind: "group"; label: string; items: NavItem[] };

const LINKS: NavEntry[] = [
  { kind: "link", href: "/", label: "Home" },
  { kind: "link", href: "/services", label: "Services" },
  {
    kind: "group",
    label: "Product",
    items: [
      { href: "/dashboard", label: "Executive Dashboard" },
      { href: "/demo", label: "Live Demo" },
      { href: "/reports", label: "Reports" },
      { href: "/pipeline", label: "Pipeline Tracker" },
      { href: "/calculator", label: "Savings Calculator" },
      { href: "/assessment", label: "Readiness Assessment" },
    ],
  },
  {
    kind: "group",
    label: "Resources",
    items: [
      { href: "/insights", label: "Insights" },
      { href: "/case-studies", label: "Case Studies" },
    ],
  },
  { kind: "link", href: "/pricing", label: "Pricing" },
  {
    kind: "group",
    label: "Company",
    items: [
      { href: "/about", label: "About" },
      { href: "/investors", label: "Investors" },
      { href: "/trust", label: "Security & Trust" },
    ],
  },
  { kind: "link", href: "/contact", label: "Contact" },
];

export function Nav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [menu, setMenu] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const navRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close everything on route change. UI reset synchronized to navigation
  // (incl. browser back/forward) — a legitimate effect use.
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    setOpen(false);
    setMenu(null);
  }, [pathname]);
  /* eslint-enable react-hooks/set-state-in-effect */

  // Escape closes an open dropdown; outside click does too (touch/keyboard).
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenu(null);
    };
    const onDown = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setMenu(null);
      }
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onDown);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onDown);
    };
  }, []);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);
  const groupActive = (items: NavItem[]) => items.some((i) => isActive(i.href));

  return (
    <header
      ref={navRef}
      className={`sticky top-0 z-50 border-b transition-colors duration-300 ${
        scrolled
          ? "border-border-hair bg-bg/80 backdrop-blur-md"
          : "border-transparent bg-transparent"
      }`}
    >
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
        <Link
          href="/"
          className="group flex items-center gap-2 font-mono text-sm font-semibold"
          aria-label="Armed Capital home"
        >
          <span className="text-accent">{">_"}</span>
          <span className="text-fg">{SITE.logo}</span>
          <span className="caret" aria-hidden />
        </Link>

        {/* desktop */}
        <div className="hidden items-center gap-6 md:flex">
          <ul className="flex items-center gap-6">
            {LINKS.map((entry) => {
              if (entry.kind === "link") {
                const active = isActive(entry.href);
                return (
                  <li key={entry.href}>
                    <Link
                      href={entry.href}
                      className={`font-mono text-sm transition-colors hover:text-accent ${
                        active ? "text-accent" : "text-muted"
                      }`}
                    >
                      {entry.label}
                    </Link>
                  </li>
                );
              }

              const active = groupActive(entry.items);
              const isOpen = menu === entry.label;
              return (
                <li
                  key={entry.label}
                  className="relative"
                  onMouseEnter={() => setMenu(entry.label)}
                  onMouseLeave={() => setMenu(null)}
                >
                  <button
                    type="button"
                    aria-expanded={isOpen}
                    aria-haspopup="true"
                    onClick={() => setMenu(isOpen ? null : entry.label)}
                    className={`flex items-center gap-1 font-mono text-sm transition-colors hover:text-accent ${
                      active || isOpen ? "text-accent" : "text-muted"
                    }`}
                  >
                    {entry.label}
                    <ChevronDown
                      className={`h-3.5 w-3.5 transition-transform duration-200 ${
                        isOpen ? "rotate-180" : ""
                      }`}
                      aria-hidden
                    />
                  </button>

                  {isOpen && (
                    <div className="absolute left-1/2 top-full z-50 -translate-x-1/2 pt-3">
                      <ul className="min-w-[224px] rounded-lg border border-border-hair bg-surface p-1.5 shadow-2xl shadow-black/40">
                        {entry.items.map((item) => (
                          <li key={item.href}>
                            <Link
                              href={item.href}
                              className={`block rounded-md px-3 py-2 font-mono text-sm transition-colors hover:bg-bg/60 hover:text-accent ${
                                isActive(item.href)
                                  ? "text-accent"
                                  : "text-muted"
                              }`}
                            >
                              {item.label}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
          <button
            onClick={openPalette}
            aria-label="Open command palette"
            title="Search (⌘K)"
            className="inline-flex h-9 items-center gap-1.5 rounded-md border border-border-hair px-2.5 text-muted transition-colors hover:border-accent/55 hover:text-accent"
          >
            <Search className="h-4 w-4" aria-hidden />
            <kbd className="font-mono text-[10px]">⌘K</kbd>
          </button>
          <ThemeToggle />
          <Link
            href="/signin"
            className="font-mono text-sm text-muted transition-colors hover:text-accent"
          >
            Sign in
          </Link>
          <ButtonLink href="/contact" variant="primary">
            Start an Inquiry
          </ButtonLink>
        </div>

        {/* mobile controls */}
        <div className="flex items-center gap-2 md:hidden">
          <button
            onClick={openPalette}
            aria-label="Open command palette"
            className="text-muted hover:text-accent"
          >
            <Search className="h-5 w-5" />
          </button>
          <ThemeToggle />
          <button
            className="text-fg"
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
          >
            {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </nav>

      {/* mobile menu */}
      {open && (
        <div className="max-h-[calc(100vh-72px)] overflow-y-auto border-t border-border-hair bg-bg/95 backdrop-blur-md md:hidden">
          <ul className="mx-auto flex max-w-6xl flex-col gap-1 px-5 py-4">
            {LINKS.map((entry) => {
              if (entry.kind === "link") {
                const active = isActive(entry.href);
                return (
                  <li key={entry.href}>
                    <Link
                      href={entry.href}
                      className={`block rounded-md px-3 py-2.5 font-mono text-sm ${
                        active
                          ? "bg-surface text-accent"
                          : "text-muted hover:text-fg"
                      }`}
                    >
                      {entry.label}
                    </Link>
                  </li>
                );
              }

              return (
                <li key={entry.label} className="mt-2">
                  <span className="block px-3 pb-1 font-mono text-[10px] uppercase tracking-[0.2em] text-muted/70">
                    {entry.label}
                  </span>
                  <ul className="flex flex-col gap-1">
                    {entry.items.map((item) => (
                      <li key={item.href}>
                        <Link
                          href={item.href}
                          className={`block rounded-md px-3 py-2.5 pl-5 font-mono text-sm ${
                            isActive(item.href)
                              ? "bg-surface text-accent"
                              : "text-muted hover:text-fg"
                          }`}
                        >
                          {item.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </li>
              );
            })}
            <li>
              <Link
                href="/signin"
                className="block rounded-md px-3 py-2.5 font-mono text-sm text-muted hover:text-fg"
              >
                Sign in
              </Link>
            </li>
            <li className="mt-3">
              <ButtonLink href="/contact" variant="primary" className="w-full">
                Start an Inquiry
              </ButtonLink>
            </li>
          </ul>
        </div>
      )}
    </header>
  );
}
