import type { ReactNode } from "react";
import { Reveal } from "@/components/Reveal";

type SectionHeadingProps = {
  /** Small mono kicker, e.g. "// services" or "01 / overview" */
  kicker?: string;
  title: ReactNode;
  subtitle?: ReactNode;
  align?: "left" | "center";
  className?: string;
  /**
   * Heading level. Defaults to h2. Set to 1 for the top-of-page hero heading
   * so every page has exactly one <h1> (a11y + on-page SEO).
   */
  level?: 1 | 2;
};

export function SectionHeading({
  kicker,
  title,
  subtitle,
  align = "left",
  className = "",
  level = 2,
}: SectionHeadingProps) {
  const Heading = level === 1 ? "h1" : "h2";
  return (
    <Reveal
      className={`flex flex-col gap-3 ${
        align === "center" ? "items-center text-center" : "items-start"
      } ${className}`}
    >
      {kicker && (
        <span className="font-mono text-xs uppercase tracking-[0.25em] text-accent">
          {kicker}
        </span>
      )}
      <Heading className="font-mono text-2xl font-semibold leading-tight text-fg sm:text-3xl md:text-4xl">
        {title}
      </Heading>
      {subtitle && (
        <p
          className={`max-w-2xl text-sm leading-relaxed text-muted sm:text-base ${
            align === "center" ? "mx-auto" : ""
          }`}
        >
          {subtitle}
        </p>
      )}
    </Reveal>
  );
}
