/**
 * Admin allowlist. Server-only — reads ADMIN_EMAILS (comma-separated) from env.
 *
 * This is the gate for the owner-only approval panel. It is checked on the
 * server inside every admin server action (see src/app/actions/admin.ts); the
 * client tab visibility is cosmetic only.
 */
export function adminEmails(): string[] {
  return (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
}

export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  return adminEmails().includes(email.toLowerCase());
}

/** URL-safe slug from an org name, with a fallback. */
export function slugify(name: string): string {
  return (
    name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 50) || "client"
  );
}
