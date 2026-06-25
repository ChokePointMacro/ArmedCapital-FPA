import { ButtonLink } from "@/components/Button";

export default function NotFound() {
  return (
    <section className="mx-auto flex min-h-[60vh] max-w-2xl flex-col items-center justify-center px-5 py-20 text-center">
      <div className="glass w-full rounded-xl p-8 text-left font-mono text-sm">
        <div className="mb-3 flex items-center gap-2 border-b border-border-hair pb-3 text-xs text-muted">
          <span className="h-3 w-3 rounded-full bg-[#ff5f56]" />
          <span className="h-3 w-3 rounded-full bg-[#ffbd2e]" />
          <span className="h-3 w-3 rounded-full bg-[#27c93f]" />
          <span className="ml-2">error.log</span>
        </div>
        <p className="text-accent">$ armed-capital --route</p>
        <p className="mt-2 text-[#ff7a72]">
          ✗ 404 — requested page not found
        </p>
        <p className="mt-1 text-muted">
          The model couldn&apos;t resolve that path. Try a known route.
        </p>
      </div>
      <h1 className="mt-8 font-mono text-3xl font-bold text-fg">
        Page not found
      </h1>
      <p className="mt-2 text-sm text-muted">
        The page you&apos;re looking for doesn&apos;t exist or has moved.
      </p>
      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        <ButtonLink href="/" variant="primary">
          Back home
        </ButtonLink>
        <ButtonLink href="/contact" variant="secondary">
          Start an Inquiry
        </ButtonLink>
      </div>
    </section>
  );
}
