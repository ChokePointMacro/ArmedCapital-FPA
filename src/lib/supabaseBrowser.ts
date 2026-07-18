"use client";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Browser Supabase client for the client portal.
 *
 * Separate from `@/lib/supabase` (which is the write-only server client with
 * persistSession disabled). This one keeps a session so magic-link auth works.
 *
 * Security note: this uses the public anon key by design. Every portal table
 * is protected by Row Level Security keyed on auth.uid(), so a signed-in user
 * can only read rows for orgs they belong to — the key alone grants nothing.
 */
let client: SupabaseClient | null = null;

export function getBrowserSupabase(): SupabaseClient {
  if (client) return client;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  client = createClient(url, anon, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true, // completes the magic-link redirect
      flowType: "implicit",
    },
  });
  return client;
}
