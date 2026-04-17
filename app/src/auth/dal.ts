/**
 * Data Access Layer for authentication.
 * T-001 + T-002: Google OAuth SSO Login + JWT Token Management
 *
 * Provides verifySession() and getUser() with React cache memoization.
 * Includes blacklist check (FR-AUTH-09) and auto-refresh (FR-AUTH-08).
 */

import "server-only";

import { cache } from "react";
import { redirect } from "next/navigation";
import { getSession, refreshSessionIfNeeded, type SessionPayload } from "./session";
import { isTokenBlacklisted } from "./token-blacklist";
import { prisma } from "@/lib/prisma";

/**
 * Verify the current session. Redirects to /login if not authenticated
 * or if the token has been blacklisted (FR-AUTH-09).
 * Auto-refreshes token if nearing expiry (FR-AUTH-08).
 * Memoized per React render pass via cache().
 */
export const verifySession = cache(async (): Promise<SessionPayload> => {
  const session = await getSession();

  if (!session?.userId) {
    redirect("/login");
  }

  // FR-AUTH-09: Check blacklist
  if (session.jti && await isTokenBlacklisted(session.jti)) {
    redirect("/login");
  }

  // FR-AUTH-08: Auto-refresh if nearing expiry
  await refreshSessionIfNeeded();

  return session;
});

/**
 * Get the current authenticated user from the database.
 * Returns null if user not found (should not happen with valid session).
 * Memoized per React render pass via cache().
 */
export const getUser = cache(async () => {
  const session = await verifySession();

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        departmentId: true,
        isActive: true,
        consentAt: true,
        consentVersion: true,
        lastLogin: true,
      },
    });

    return user;
  } catch {
    console.error("Failed to fetch user");
    return null;
  }
});
