/**
 * JWT session management using jose.
 * T-001 + T-002: Google OAuth SSO Login + JWT Token Management
 *
 * Session stored as HttpOnly cookie with HS256-signed JWT.
 * Claims: userId, email, role, departmentId, jti, exp (8h).
 *
 * T-002 additions: jti for blacklisting, token refresh, revocation.
 */

import "server-only";

import { SignJWT, jwtVerify, type JWTPayload } from "jose";
import { cookies } from "next/headers";
import { AUTH_CONFIG } from "./config";
import { randomBytes } from "crypto";

export interface SessionPayload extends JWTPayload {
  userId: string;
  email: string;
  role: string;
  departmentId: string | null;
  jti?: string;
}

function getSigningKey(): Uint8Array {
  const secret = process.env.AUTH_SECRET;
  if (!secret) throw new Error("AUTH_SECRET environment variable is not set");
  return new TextEncoder().encode(secret);
}

/**
 * Create a signed JWT from the session payload.
 * Includes a unique jti (JWT ID) for blacklisting support (FR-AUTH-09).
 */
export async function encryptSession(payload: Omit<SessionPayload, "iat" | "exp" | "jti"> & { jti?: string }): Promise<string> {
  const jti = payload.jti ?? randomBytes(16).toString("hex");
  return new SignJWT({ ...payload, jti } as Record<string, unknown>)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${AUTH_CONFIG.sessionExpirySeconds}s`)
    .sign(getSigningKey());
}

/**
 * Verify and decode a JWT session token.
 * Returns null if invalid or expired.
 */
export async function decryptSession(token: string | undefined): Promise<SessionPayload | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, getSigningKey(), {
      algorithms: ["HS256"],
    });
    return payload as SessionPayload;
  } catch {
    return null;
  }
}

/**
 * Create a new session: sign JWT and set as HttpOnly cookie.
 */
export async function createSession(data: Omit<SessionPayload, "iat" | "exp" | "jti">): Promise<void> {
  const expiresAt = new Date(Date.now() + AUTH_CONFIG.sessionExpirySeconds * 1000);
  const token = await encryptSession(data);
  const cookieStore = await cookies();

  cookieStore.set(AUTH_CONFIG.sessionCookieName, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    expires: expiresAt,
    sameSite: "lax",
    path: "/",
  });
}

/**
 * Delete the session cookie (logout).
 */
export async function deleteSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(AUTH_CONFIG.sessionCookieName);
}

/**
 * Read and verify the current session from cookies.
 * Returns null if no valid session exists.
 */
export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_CONFIG.sessionCookieName)?.value;
  return decryptSession(token);
}

/**
 * Get the raw JWT token string from cookies (for blacklisting on logout).
 */
export async function getRawSessionToken(): Promise<string | undefined> {
  const cookieStore = await cookies();
  return cookieStore.get(AUTH_CONFIG.sessionCookieName)?.value;
}

/**
 * Refresh the current session if it's past the refresh threshold.
 * FR-AUTH-08: Auto-refresh tokens before expiry using refresh token.
 *
 * Called from proxy.ts on each request. If token is valid but will expire
 * within the refresh window, issues a new token with fresh expiry.
 *
 * @returns true if token was refreshed, false otherwise
 */
export async function refreshSessionIfNeeded(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_CONFIG.sessionCookieName)?.value;
  const session = await decryptSession(token);

  if (!session?.exp) return false;

  const now = Math.floor(Date.now() / 1000);
  const timeRemaining = session.exp - now;

  // Refresh if less than 1 hour remaining (out of 8h total)
  if (timeRemaining > AUTH_CONFIG.refreshThresholdSeconds) return false;

  // Issue new token with same claims but fresh expiry + new jti
  await createSession({
    userId: session.userId,
    email: session.email,
    role: session.role,
    departmentId: session.departmentId,
  });

  return true;
}
