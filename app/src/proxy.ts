/**
 * Next.js 16 Proxy (formerly middleware).
 * T-001: Route protection -- redirect unauthenticated users to /login.
 *
 * Uses optimistic JWT check (cookie only, no DB hit).
 * proxy.ts must be in src/ directory (same level as app/).
 */

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

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
    await jwtVerify(token, key, { algorithms: ["HS256"] });
    return NextResponse.next();
  } catch {
    // Invalid or expired token
    return NextResponse.redirect(new URL("/login", request.url));
  }
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon\\.ico|.*\\.png$|.*\\.svg$).*)"],
};
