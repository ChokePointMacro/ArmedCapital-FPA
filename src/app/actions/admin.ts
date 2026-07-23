"use server";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { z } from "zod";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";
import { isAdminEmail, slugify } from "@/lib/admin";

/**
 * Owner-only admin actions: approve access requests into real workspaces.
 *
 * AUTH MODEL: the portal uses client-side (implicit-flow) Supabase sessions,
 * so these server actions can't read the caller from a cookie. Instead the
 * client passes its short-lived access token (JWT); we verify it here with the
 * anon client and check the email against the ADMIN_EMAILS allowlist before
 * doing anything with the service role. Never trust the client's claim of who
 * they are — always re-verify the token server-side.
 */

export type AdminResult<T = unknown> =
  | { ok: true; data?: T }
  | { ok: false; error: string };

export type AccessRequestRow = {
  id: string;
  created_at: string;
  email: string;
  name: string | null;
  company: string | null;
  message: string | null;
  status: "pending" | "approved" | "denied";
  org_id: string | null;
};

async function verifiedAdminEmail(accessToken: string): Promise<string> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anon) throw new Error("Auth not configured.");
  const authed = createClient(url, anon, { auth: { persistSession: false } });
  const { data, error } = await authed.auth.getUser(accessToken);
  if (error || !data.user) throw new Error("Not signed in.");
  if (!isAdminEmail(data.user.email)) throw new Error("Not authorized.");
  return data.user.email!.toLowerCase();
}

/** Create the auth user if needed, returning its id. Idempotent. */
async function ensureUser(
  admin: SupabaseClient,
  email: string,
): Promise<string | null> {
  const created = await admin.auth.admin.createUser({
    email,
    email_confirm: true,
  });
  if (created.data?.user) return created.data.user.id;
  // Already exists (or similar) — recover the id via a magic-link generation,
  // which resolves the existing user without sending anything to the client.
  const link = await admin.auth.admin.generateLink({ type: "magiclink", email });
  return link.data?.user?.id ?? null;
}

/** Lightweight check the client uses to decide whether to show the Admin tab. */
export async function isAdmin(accessToken: string): Promise<boolean> {
  try {
    await verifiedAdminEmail(accessToken);
    return true;
  } catch {
    return false;
  }
}

export async function listAccessRequests(
  accessToken: string,
): Promise<AdminResult<AccessRequestRow[]>> {
  try {
    await verifiedAdminEmail(accessToken);
    const admin = getSupabaseAdmin();
    if (!admin) return { ok: false, error: "Service role not configured." };
    const { data, error } = await admin
      .from("access_requests")
      .select("id, created_at, email, name, company, message, status, org_id")
      .order("created_at", { ascending: false });
    if (error) return { ok: false, error: error.message };
    return { ok: true, data: (data ?? []) as AccessRequestRow[] };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}

const approveSchema = z.object({
  requestId: z.string().uuid(),
  orgName: z.string().min(1).max(160),
});

export async function approveAccessRequest(
  accessToken: string,
  raw: unknown,
): Promise<AdminResult> {
  try {
    await verifiedAdminEmail(accessToken);
    const admin = getSupabaseAdmin();
    if (!admin) return { ok: false, error: "Service role not configured." };
    const parsed = approveSchema.safeParse(raw);
    if (!parsed.success) {
      return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid." };
    }
    const { requestId, orgName } = parsed.data;

    const { data: req, error: reqErr } = await admin
      .from("access_requests")
      .select("id, email, status")
      .eq("id", requestId)
      .single();
    if (reqErr || !req) return { ok: false, error: "Request not found." };
    if (req.status === "approved") {
      return { ok: false, error: "This request is already approved." };
    }

    const result = await provisionWorkspace(admin, req.email as string, orgName);
    if (!result.ok) return result;

    await admin
      .from("access_requests")
      .update({ status: "approved", org_id: (result.data as { orgId: string }).orgId })
      .eq("id", requestId);

    return { ok: true };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}

export async function denyAccessRequest(
  accessToken: string,
  requestId: string,
): Promise<AdminResult> {
  try {
    await verifiedAdminEmail(accessToken);
    const admin = getSupabaseAdmin();
    if (!admin) return { ok: false, error: "Service role not configured." };
    if (!z.string().uuid().safeParse(requestId).success) {
      return { ok: false, error: "Invalid request id." };
    }
    const { error } = await admin
      .from("access_requests")
      .update({ status: "denied" })
      .eq("id", requestId);
    if (error) return { ok: false, error: error.message };
    return { ok: true };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}

const createSchema = z.object({
  email: z.string().email().max(200),
  orgName: z.string().min(1).max(160),
});

/** Directly create a client workspace (no access request needed). */
export async function createWorkspace(
  accessToken: string,
  raw: unknown,
): Promise<AdminResult> {
  try {
    await verifiedAdminEmail(accessToken);
    const admin = getSupabaseAdmin();
    if (!admin) return { ok: false, error: "Service role not configured." };
    const parsed = createSchema.safeParse(raw);
    if (!parsed.success) {
      return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid." };
    }
    const result = await provisionWorkspace(admin, parsed.data.email, parsed.data.orgName);
    return result.ok ? { ok: true } : result;
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}

/** Shared: create org + user + membership. Returns the new org id. */
async function provisionWorkspace(
  admin: SupabaseClient,
  emailRaw: string,
  orgName: string,
): Promise<AdminResult<{ orgId: string }>> {
  const email = emailRaw.toLowerCase();

  const { data: org, error: orgErr } = await admin
    .from("orgs")
    .insert({ name: orgName, slug: slugify(orgName) })
    .select("id")
    .single();
  if (orgErr || !org) {
    return { ok: false, error: orgErr?.message ?? "Could not create workspace." };
  }

  const userId = await ensureUser(admin, email);
  if (!userId) return { ok: false, error: "Could not provision the user account." };

  const { error: memErr } = await admin
    .from("org_members")
    .insert({ org_id: org.id, user_id: userId, role: "member" });
  if (memErr && !/duplicate key/i.test(memErr.message)) {
    return { ok: false, error: memErr.message };
  }

  return { ok: true, data: { orgId: org.id as string } };
}
