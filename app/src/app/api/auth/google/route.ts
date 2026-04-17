/**
 * GET /api/auth/google
 * Initiates Google OAuth flow by redirecting to Google consent screen.
 * T-001: FR-AUTH-01
 */

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { buildGoogleAuthUrl } from "@/auth/google";

export async function GET() {
  const { url, state } = buildGoogleAuthUrl();

  // Store state in a short-lived HttpOnly cookie for CSRF validation
  const cookieStore = await cookies();
  cookieStore.set("oauth_state", state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 600, // 10 minutes
    sameSite: "lax",
    path: "/",
  });

  return NextResponse.redirect(url);
}
