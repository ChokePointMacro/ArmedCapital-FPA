import { NextResponse, type NextRequest } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabaseAdmin";

/**
 * Google OAuth callback: exchanges the auth code for tokens and stores the
 * (offline) refresh token as the single active central Drive connection.
 */
export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const origin = url.origin;
  const done = (status: string) =>
    NextResponse.redirect(`${origin}/app/admin?drive=${status}`);

  if (url.searchParams.get("error") || !url.searchParams.get("code")) {
    return done("error");
  }
  const code = url.searchParams.get("code")!;
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  if (!clientId || !clientSecret) return done("notconfigured");

  // Exchange the code for tokens.
  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: `${origin}/api/drive/callback`,
      grant_type: "authorization_code",
    }),
  });
  if (!tokenRes.ok) return done("error");
  const tok = (await tokenRes.json()) as {
    access_token?: string;
    refresh_token?: string;
    expires_in?: number;
    scope?: string;
  };
  if (!tok.refresh_token) {
    // No refresh token means re-consent is needed (Google only returns it with
    // prompt=consent + access_type=offline). Treat as a soft failure.
    return done("norefresh");
  }

  // Which Google account did we just connect?
  let email = "unknown";
  try {
    const uRes = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
      headers: { Authorization: `Bearer ${tok.access_token}` },
    });
    if (uRes.ok) email = ((await uRes.json()).email as string) ?? "unknown";
  } catch {
    /* non-fatal */
  }

  const admin = getSupabaseAdmin();
  if (!admin) return done("error");

  await admin
    .from("drive_connection")
    .update({ is_active: false })
    .eq("is_active", true);

  const expiry = tok.expires_in
    ? new Date(Date.now() + tok.expires_in * 1000).toISOString()
    : null;

  const { error } = await admin.from("drive_connection").insert({
    google_email: email,
    refresh_token: tok.refresh_token,
    access_token: tok.access_token ?? null,
    token_expiry: expiry,
    scope: tok.scope ?? null,
  });
  if (error) return done("error");

  return done("connected");
}
