/**
 * GET /api/auth/callback
 * Handles Google OAuth callback: validate state, exchange code, upsert user,
 * encrypt refresh token, create session, redirect.
 * T-001: FR-AUTH-01, FR-AUTH-02, FR-AUTH-03
 */

import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { exchangeCodeForTokens, fetchGoogleUserInfo } from "@/auth/google";
import { isDomainAllowed, getAppUrl } from "@/auth/config";
import { createSession } from "@/auth/session";
import { encryptRefreshToken } from "@/auth/crypto";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");
  const appUrl = getAppUrl();

  // Handle Google-side errors
  if (error) {
    return NextResponse.redirect(`${appUrl}/login?error=oauth_error`);
  }

  // Validate required params
  if (!code || !state) {
    return NextResponse.redirect(`${appUrl}/login?error=missing_params`);
  }

  // CSRF validation: compare state with cookie
  const cookieStore = await cookies();
  const storedState = cookieStore.get("oauth_state")?.value;
  cookieStore.delete("oauth_state");

  if (!storedState || storedState !== state) {
    return NextResponse.redirect(`${appUrl}/login?error=invalid_state`);
  }

  try {
    // Exchange code for tokens
    const tokens = await exchangeCodeForTokens(code);

    // Fetch user info from Google
    const googleUser = await fetchGoogleUserInfo(tokens.access_token);

    // Domain validation (FR-AUTH-03 acceptance: non-registered domain -> error)
    if (!isDomainAllowed(googleUser.email)) {
      return NextResponse.redirect(`${appUrl}/login?error=domain_not_allowed`);
    }

    // Encrypt refresh token if provided
    const encryptedRefreshToken = tokens.refresh_token
      ? encryptRefreshToken(tokens.refresh_token)
      : undefined;

    // Upsert user record (FR-AUTH-03: create/update from Google profile)
    const user = await prisma.user.upsert({
      where: { googleUserId: googleUser.id },
      update: {
        name: googleUser.name,
        email: googleUser.email,
        lastLogin: new Date(),
        ...(encryptedRefreshToken && { refreshToken: encryptedRefreshToken }),
      },
      create: {
        googleUserId: googleUser.id,
        email: googleUser.email,
        name: googleUser.name,
        lastLogin: new Date(),
        ...(encryptedRefreshToken && { refreshToken: encryptedRefreshToken }),
      },
      select: {
        id: true,
        email: true,
        role: true,
        departmentId: true,
        consentAt: true,
      },
    });

    // Create JWT session (FR-AUTH-02)
    await createSession({
      userId: user.id,
      email: user.email,
      role: user.role,
      departmentId: user.departmentId,
    });

    // Check PDPA consent -- redirect to consent page if needed (FR-AUTH-10 stub)
    if (!user.consentAt) {
      return NextResponse.redirect(`${appUrl}/consent`);
    }

    // Redirect to main page
    return NextResponse.redirect(`${appUrl}/`);
  } catch (err) {
    console.error("OAuth callback error:", err);
    return NextResponse.redirect(`${appUrl}/login?error=callback_failed`);
  }
}
