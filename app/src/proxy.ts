/**
 * Next.js 16 Proxy (formerly middleware).
 * T-001 + T-002: Route protection, token validation, blacklist check, auto-refresh.
 *
 * Uses optimistic JWT check (cookie only, no DB hit).
 * proxy.ts must be in src/ directory (same level as app/).
 */

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";
import { isTokenBlacklisted } from "@/auth/token-blacklist";

const PUBLIC_PATHS = new Set(["/login", "/consent"]);

function isPublicPath(pathname: string): boolean {
  if (PUBLIC_PATHS.has(pathname)) return true;
  if (pathname.startsWith("/api/auth/")) return true;
  return false;
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public routes
  if (isPublicPath(pathname)) {
    return NextResponse.next();
  }

  // Check for session cookie
  const token = request.cookies.get("dw-session")?.value;

  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Optimistic JWT verification (no DB hit)
  try {
    const secret = process.env.AUTH_SECRET;
    if (!secret) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    const key = new TextEncoder().encode(secret);
    const { payload } = await jwtVerify(token, key, { algorithms: ["HS256"] });

    // FR-AUTH-09: Check if token has been blacklisted (revoked on logout)
    const jti = payload.jti;
    if (jti && await isTokenBlacklisted(jti)) {
      const response = NextResponse.redirect(new URL("/login", request.url));
      response.cookies.delete("dw-session");
      return response;
    }

    // FR-AUTH-08: Token auto-refresh check
    // Note: actual refresh happens via session.ts refreshSessionIfNeeded()
    // which is called from server components / API routes that can set cookies.
    // Proxy can only flag that refresh is needed via a header.
    if (payload.exp) {
      const now = Math.floor(Date.now() / 1000);
      const remaining = payload.exp - now;
      if (remaining < 3600) {
        // Signal to server components that refresh is needed
        const response = NextResponse.next();
        response.headers.set("x-session-refresh-needed", "true");
        return response;
      }
    }

    return NextResponse.next();
  } catch {
    // Invalid or expired token -- clear cookie and redirect
    const response = NextResponse.redirect(new URL("/login", request.url));
    response.cookies.delete("dw-session");
    return response;
  }
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon\\.ico|.*\\.png$|.*\\.svg$).*)"],
};
