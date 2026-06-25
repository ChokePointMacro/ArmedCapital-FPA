import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  // Surfaced at build/runtime so a missing env var fails loudly rather than
  // silently dropping inquiry submissions.
  throw new Error(
    "Missing Supabase env vars: set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.",
  );
}

/**
 * Supabase client used by the inquiry Server Action.
 *
 * The anon key is public-safe: the `inquiries` table has an INSERT-only RLS
 * policy and no SELECT policy, so submissions are write-only. The service-role
 * key is never used or exposed to the client.
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: { persistSession: false },
});
