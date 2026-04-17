/**
 * JWT session management using jose.
 * T-001: Google OAuth SSO Login
 *
 * Session stored as HttpOnly cookie with HS256-signed JWT.
 * Claims: userId, email, role, departmentId, exp (8h).
 */

import "server-only";

import { SignJWT, jwtVerify, type JWTPayload } from "jose";
import { cookies } from "next/headers";
import { AUTH_CONFIG } from "./config";

export interface SessionPayload extends JWTPayload {
  userId: string;
  email: string;
  role: string;
  departmentId: string | null;
}

function getSigningKey(): Uint8Array {
  const secret = process.env.AUTH_SECRET;
  if (!secret) throw new Error("AUTH_SECRET environment variable is not set");
  return new TextEncoder().encode(secret);
}

/**
 * Create a signed JWT from the session payload.
 */
export async function encryptSession(payload: Omit<SessionPayload, "iat" | "exp">): Promise<string> {
  return new SignJWT(payload)
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
export async function createSession(data: Omit<SessionPayload, "iat" | "exp">): Promise<void> {
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
