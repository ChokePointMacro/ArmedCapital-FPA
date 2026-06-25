import Link from "next/link";
import type { ComponentProps } from "react";

// Styling for MDX-rendered blog content (f11). Matches the coder-vibe theme.
export const mdxComponents = {
  h2: (p: ComponentProps<"h2">) => (
    <h2
      className="mt-10 font-mono text-xl font-semibold text-fg sm:text-2xl"
      {...p}
    />
  ),
  h3: (p: ComponentProps<"h3">) => (
    <h3 className="mt-8 font-mono text-lg font-semibold text-fg" {...p} />
  ),
  p: (p: ComponentProps<"p">) => (
    <p className="mt-4 text-[15px] leading-relaxed text-muted" {...p} />
  ),
  ul: (p: ComponentProps<"ul">) => (
    <ul className="mt-4 list-disc space-y-2 pl-5 text-[15px] text-muted" {...p} />
  ),
  ol: (p: ComponentProps<"ol">) => (
    <ol
      className="mt-4 list-decimal space-y-2 pl-5 text-[15px] text-muted"
      {...p}
    />
  ),
  li: (p: ComponentProps<"li">) => <li className="leading-relaxed" {...p} />,
  strong: (p: ComponentProps<"strong">) => (
    <strong className="font-semibold text-fg" {...p} />
  ),
  blockquote: (p: ComponentProps<"blockquote">) => (
    <blockquote
      className="mt-6 border-l-2 border-accent/60 bg-accent/5 px-5 py-3 font-mono text-sm italic text-fg/90"
      {...p}
    />
  ),
  code: (p: ComponentProps<"code">) => (
    <code
      className="rounded bg-bg/60 px-1.5 py-0.5 font-mono text-[13px] text-accent"
      {...p}
    />
  ),
  a: ({ href = "#", ...rest }: ComponentProps<"a">) => {
    const internal = href.startsWith("/");
    if (internal) {
      return (
        <Link
          href={href}
          className="text-cyan underline decoration-cyan/40 underline-offset-2 hover:decoration-cyan"
          {...rest}
        />
      );
    }
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="text-cyan underline decoration-cyan/40 underline-offset-2 hover:decoration-cyan"
        {...rest}
      />
    );
  },
};
