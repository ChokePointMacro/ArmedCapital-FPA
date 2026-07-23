import { NextResponse, type NextRequest } from "next/server";

/**
 * Starts the Google OAuth flow to connect Armed Capital's central Drive.
 *
 * Requires GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET (set in Vercel env) plus a
 * Google Cloud OAuth app whose authorized redirect URI is
 *   https://armed-capital-fpa.vercel.app/api/drive/callback
 * Scopes: read-only Drive + email (to record which account was connected).
 *
 * Note: this initiates a top-level redirect, so it isn't session-gated here.
 * Completing it requires consenting on Armed Capital's own Google app, which
 * in "testing" mode only permits the owner's allow-listed Google account.
 */
export async function GET(req: NextRequest) {
  const origin = new URL(req.url).origin;
  const clientId = process.env.GOOGLE_CLIENT_ID;
  if (!clientId) {
    return NextResponse.redirect(`${origin}/app/admin?drive=notconfigured`);
  }
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: `${origin}/api/drive/callback`,
    response_type: "code",
    scope: "openid email https://www.googleapis.com/auth/drive.readonly",
    access_type: "offline",
    prompt: "consent",
    include_granted_scopes: "true",
  });
  return NextResponse.redirect(
    `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`,
  );
}
