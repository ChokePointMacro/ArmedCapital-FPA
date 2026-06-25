import type { ReactNode } from "react";
import { Reveal } from "@/components/Reveal";

type SectionHeadingProps = {
  /** Small mono kicker, e.g. "// services" or "01 / overview" */
  kicker?: string;
  title: ReactNode;
  subtitle?: ReactNode;
  align?: "left" | "center";
  className?: string;
};

export function SectionHeading({
  kicker,
  title,
  subtitle,
  align = "left",
  className = "",
}: SectionHeadingProps) {
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
      <h2 className="font-mono text-2xl font-semibold leading-tight text-fg sm:text-3xl md:text-4xl">
        {title}
      </h2>
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
