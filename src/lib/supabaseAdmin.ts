import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Server-only Supabase client using the service-role key.
 *
 * NEVER import this from a Client Component. It is used solely by the cron
 * route (/api/cron/keepalive) to call `capacity_snapshot()`, which is granted
 * to service_role only. If the key isn't configured the monitor degrades
 * gracefully — keep-alive still runs, capacity reporting is skipped.
 */
export function getSupabaseAdmin(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false } });
}
