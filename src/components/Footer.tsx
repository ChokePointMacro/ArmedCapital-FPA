import Link from "next/link";
import { Mail } from "lucide-react";
import { SITE } from "@/lib/content";

const LINKS = [
  { href: "/services", label: "Services" },
  { href: "/about", label: "About" },
  { href: "/investors", label: "Investors" },
  { href: "/contact", label: "Contact" },
];

export function Footer() {
  return (
    <footer className="mt-24 border-t border-border-hair bg-bg/60">
      <div className="mx-auto grid max-w-6xl gap-8 px-5 py-12 md:grid-cols-3">
        <div className="flex flex-col gap-3">
          <Link
            href="/"
            className="flex items-center gap-2 font-mono text-sm font-semibold"
          >
            <span className="text-accent">{">_"}</span>
            <span className="text-fg">{SITE.logo}</span>
          </Link>
          <p className="max-w-xs text-sm leading-relaxed text-muted">
            FP&amp;A &amp; demand forecasting for companies that make real
            things.
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <span className="font-mono text-xs uppercase tracking-[0.2em] text-muted">
            Navigate
          </span>
          <ul className="flex flex-col gap-2">
            {LINKS.map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  className="font-mono text-sm text-muted transition-colors hover:text-accent"
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex flex-col gap-3">
          <span className="font-mono text-xs uppercase tracking-[0.2em] text-muted">
            Contact
          </span>
          {/* TODO(client): replace with the real inbound contact address. */}
          <a
            href={`mailto:${SITE.email}`}
            className="flex items-center gap-2 font-mono text-sm text-muted transition-colors hover:text-accent"
          >
            <Mail className="h-4 w-4" aria-hidden />
            {SITE.email}
          </a>
          <Link
            href="/contact"
            className="mt-1 font-mono text-sm text-accent hover:underline"
          >
            Start an Inquiry →
          </Link>
        </div>
      </div>

      <div className="border-t border-border-hair">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-5 py-5 font-mono text-xs text-muted sm:flex-row">
          <span>
            © {new Date().getFullYear()} {SITE.name}. All rights reserved.
          </span>
          <span className="text-muted">
            <span className="text-accent">{"// "}</span>built with precision{" "}
            <span className="caret" aria-hidden />
          </span>
        </div>
      </div>
    </footer>
  );
}
