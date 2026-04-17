/**
 * API route request validation utility.
 * T-002: FR-AUTH-05 — validate JWT on every API request.
 *
 * Use in route handlers that need authenticated access:
 *   const session = await validateRequest(request);
 *   if (!session) return new Response(null, { status: 401 });
 */

import { jwtVerify } from "jose";
import { isTokenBlacklisted } from "./token-blacklist";
import { AUTH_CONFIG } from "./config";

import type { SessionPayload } from "./session";

/**
 * Validate JWT from request cookies or Authorization header.
 * Returns session payload if valid, null if invalid/expired/blacklisted.
 *
 * FR-AUTH-05: Invalid/expired JWT -> null (caller returns 401).
 */
export async function validateRequest(request: Request): Promise<SessionPayload | null> {
  const secret = process.env.AUTH_SECRET;
  if (!secret) return null;

  // Try cookie first, then Authorization header
  let token: string | undefined;

  // Parse cookie from request headers
  const cookieHeader = request.headers.get("cookie") ?? "";
  const cookieMatch = cookieHeader.match(new RegExp(`${AUTH_CONFIG.sessionCookieName}=([^;]+)`));
  if (cookieMatch) {
    token = cookieMatch[1];
  }

  // Fall back to Authorization: Bearer <token>
  if (!token) {
    const authHeader = request.headers.get("authorization") ?? "";
    if (authHeader.startsWith("Bearer ")) {
      token = authHeader.slice(7);
    }
  }

  if (!token) return null;

  try {
    const key = new TextEncoder().encode(secret);
    const { payload } = await jwtVerify(token, key, { algorithms: ["HS256"] });
    const session = payload as SessionPayload;

    // FR-AUTH-09: Check blacklist
    if (session.jti && await isTokenBlacklisted(session.jti)) {
      return null;
    }

    return session;
  } catch {
    // Invalid or expired
    return null;
  }
}
