/**
 * POST /api/auth/logout
 * Blacklists current JWT, deletes session cookie, redirects to login.
 * T-002: FR-AUTH-09 — revoke session and blacklist JWT on logout.
 */

import { NextResponse } from "next/server";
import { deleteSession, getRawSessionToken, decryptSession } from "@/auth/session";
import { blacklistToken } from "@/auth/token-blacklist";
import { getAppUrl } from "@/auth/config";

export async function POST() {
  // Get current token for blacklisting
  const token = await getRawSessionToken();
  if (token) {
    const session = await decryptSession(token);
    if (session?.jti && session?.exp) {
      const now = Math.floor(Date.now() / 1000);
      const remainingSeconds = Math.max(session.exp - now, 0);
      // Blacklist the jti for the remaining lifetime of the token
      await blacklistToken(session.jti, remainingSeconds);
    }
  }

  await deleteSession();
  return NextResponse.redirect(`${getAppUrl()}/login`);
}
