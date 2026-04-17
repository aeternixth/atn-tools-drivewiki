/**
 * Data Access Layer for authentication.
 * T-001: Google OAuth SSO Login
 *
 * Provides verifySession() and getUser() with React cache memoization.
 */

import "server-only";

import { cache } from "react";
import { redirect } from "next/navigation";
import { getSession, type SessionPayload } from "./session";
import { prisma } from "@/lib/prisma";

/**
 * Verify the current session. Redirects to /login if not authenticated.
 * Memoized per React render pass via cache().
 */
export const verifySession = cache(async (): Promise<SessionPayload> => {
  const session = await getSession();

  if (!session?.userId) {
    redirect("/login");
  }

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
