import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";

type Variant = "primary" | "secondary" | "ghost";

const base =
  "inline-flex items-center justify-center gap-2 rounded-md px-5 py-2.5 text-sm font-medium font-mono tracking-tight transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60 focus-visible:ring-offset-2 focus-visible:ring-offset-bg disabled:opacity-50 disabled:pointer-events-none";

const variants: Record<Variant, string> = {
  primary:
    "bg-accent text-bg hover:shadow-[0_0_24px_-4px_var(--color-accent)] hover:brightness-110 active:translate-y-px",
  secondary:
    "border border-border-hair text-fg hover:border-accent/55 hover:text-accent glow-hover",
  ghost: "text-muted hover:text-accent",
};

type ButtonLinkProps = {
  href: string;
  variant?: Variant;
  children: ReactNode;
  className?: string;
} & Omit<ComponentProps<typeof Link>, "href" | "className">;

export function ButtonLink({
  href,
  variant = "primary",
  children,
  className = "",
  ...rest
}: ButtonLinkProps) {
  const external = href.startsWith("http") || href.startsWith("mailto:");
  if (external) {
    return (
      <a href={href} className={`${base} ${variants[variant]} ${className}`}>
        {children}
      </a>
    );
  }
  return (
    <Link
      href={href}
      className={`${base} ${variants[variant]} ${className}`}
      {...rest}
    >
      {children}
    </Link>
  );
}

type ButtonProps = {
  variant?: Variant;
  children: ReactNode;
  className?: string;
} & ComponentProps<"button">;

export function Button({
  variant = "primary",
  children,
  className = "",
  ...rest
}: ButtonProps) {
  return (
    <button className={`${base} ${variants[variant]} ${className}`} {...rest}>
      {children}
    </button>
  );
}
