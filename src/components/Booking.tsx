"use client";

import { useEffect } from "react";
import { CalendarClock, ArrowUpRight } from "lucide-react";
import { ButtonLink } from "@/components/Button";
import { track } from "@/lib/analytics";

const BOOKING_URL = process.env.NEXT_PUBLIC_BOOKING_URL;

function isCalendly(url: string) {
  return /calendly\.com/i.test(url);
}

/**
 * f03 — Inline meeting booking for the Contact page.
 * Calendly link → inline widget; any other link → prominent button;
 * unset → a clearly-marked placeholder for the client to fill in.
 */
export function BookingEmbed() {
  useEffect(() => {
    if (!BOOKING_URL || !isCalendly(BOOKING_URL)) return;
    const id = "calendly-widget-script";
    if (document.getElementById(id)) return;
    const s = document.createElement("script");
    s.id = id;
    s.src = "https://assets.calendly.com/assets/external/widget.js";
    s.async = true;
    document.body.appendChild(s);
  }, []);

  if (!BOOKING_URL) {
    return (
      <div className="glass rounded-xl p-6">
        <div className="flex items-center gap-2 font-mono text-xs uppercase tracking-wider text-muted">
          <CalendarClock className="h-4 w-4 text-cyan" aria-hidden />
          Book a call
        </div>
        <div className="mt-4 rounded-lg border-2 border-dashed border-border-hair px-4 py-6 text-center font-mono text-xs text-muted">
          TODO — set NEXT_PUBLIC_BOOKING_URL (Calendly / Cal.com) to embed booking
        </div>
      </div>
    );
  }

  if (isCalendly(BOOKING_URL)) {
    return (
      <div className="glass overflow-hidden rounded-xl p-2">
        <div
          className="calendly-inline-widget"
          data-url={`${BOOKING_URL}?hide_gdpr_banner=1&background_color=0a0e16&text_color=e6edf3&primary_color=1bd17a`}
          style={{ minWidth: "320px", height: "640px" }}
        />
      </div>
    );
  }

  return (
    <div className="glass rounded-xl p-6 text-center">
      <CalendarClock className="mx-auto h-8 w-8 text-cyan" aria-hidden />
      <p className="mt-3 text-sm text-muted">
        Grab a time that works for you.
      </p>
      <div className="mt-4">
        <BookingButton label="Book a discovery call" />
      </div>
    </div>
  );
}

/**
 * Reusable "Book a call" CTA. Routes to the booking URL when configured,
 * otherwise to /contact. Fires a `booking_clicked` analytics event.
 */
export function BookingButton({
  label = "Book a call",
  variant = "secondary",
}: {
  label?: string;
  variant?: "primary" | "secondary" | "ghost";
}) {
  const href = BOOKING_URL || "/contact";
  return (
    <ButtonLink
      href={href}
      variant={variant}
      onClick={() => track("booking_clicked", { href })}
    >
      <CalendarClock className="h-4 w-4" aria-hidden />
      {label}
      {BOOKING_URL ? <ArrowUpRight className="h-4 w-4" aria-hidden /> : null}
    </ButtonLink>
  );
}
