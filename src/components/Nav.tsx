"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, X, Search } from "lucide-react";
import { ButtonLink } from "@/components/Button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { SITE } from "@/lib/content";

function openPalette() {
  window.dispatchEvent(new Event("ac:open-palette"));
}

const LINKS = [
  { href: "/", label: "Home" },
  { href: "/services", label: "Services" },
  { href: "/pricing", label: "Pricing" },
  { href: "/about", label: "About" },
  { href: "/investors", label: "Investors" },
  { href: "/contact", label: "Contact" },
];

export function Nav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close the mobile menu on route change.
  useEffect(() => setOpen(false), [pathname]);

  return (
    <header
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
        <div className="hidden items-center gap-7 md:flex">
          <ul className="flex items-center gap-7">
            {LINKS.map((l) => {
              const active =
                l.href === "/" ? pathname === "/" : pathname.startsWith(l.href);
              return (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className={`font-mono text-sm transition-colors hover:text-accent ${
                      active ? "text-accent" : "text-muted"
                    }`}
                  >
                    {l.label}
                  </Link>
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
        <div className="border-t border-border-hair bg-bg/95 backdrop-blur-md md:hidden">
          <ul className="mx-auto flex max-w-6xl flex-col gap-1 px-5 py-4">
            {LINKS.map((l) => {
              const active =
                l.href === "/" ? pathname === "/" : pathname.startsWith(l.href);
              return (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className={`block rounded-md px-3 py-2.5 font-mono text-sm ${
                      active
                        ? "bg-surface text-accent"
                        : "text-muted hover:text-fg"
                    }`}
                  >
                    {l.label}
                  </Link>
                </li>
              );
            })}
            <li className="mt-2">
              <ButtonLink
                href="/contact"
                variant="primary"
                className="w-full"
              >
                Start an Inquiry
              </ButtonLink>
            </li>
          </ul>
        </div>
      )}
    </header>
  );
}
