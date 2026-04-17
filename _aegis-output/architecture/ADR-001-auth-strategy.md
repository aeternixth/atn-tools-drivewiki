# ADR-001: Authentication Strategy

| Field | Value |
|-------|-------|
| Status | ACCEPTED |
| Date | 2026-04-17 |
| Decider | Iron Man (AEGIS) |
| Task | T-001 Google OAuth SSO Login |

## Context

DriveWiki needs Google OAuth 2.0 SSO with JWT sessions, domain allowlist validation,
encrypted refresh token storage, and RBAC-aware session claims. The project uses
Next.js 16 (App Router), Prisma 7, and already has `jose` installed.

Options considered:
- A) NextAuth v5 (Auth.js) with @auth/prisma-adapter
- B) Custom Google OAuth + jose JWT (following Next.js 16 auth guide)
- C) Passport.js (google-oauth2 strategy)

## Decision

**Option B: Custom Google OAuth + jose JWT.**

## Rationale

1. **Prisma 7 compatibility**: @auth/prisma-adapter has not been verified against Prisma 7
   client generation changes. Custom code eliminates adapter risk.
2. **Next.js 16 proxy.ts**: NextAuth middleware integration assumes `middleware.ts`, but
   Next.js 16 renamed it to `proxy.ts` with different export conventions. Custom proxy
   integration is straightforward.
3. **jose already installed**: The project has jose for JWT signing/verification. No new
   dependency needed for session management.
4. **Full control**: Domain allowlist, encrypted refresh token storage, and custom JWT
   claims (userId, departmentId, role, exp) are easier to implement without fighting
   NextAuth's abstraction.
5. **Passport.js rejected**: Node.js-only, not Edge-compatible, adds unnecessary
   middleware layer in App Router architecture.

## Consequences

- (+) Zero third-party auth library dependency risk
- (+) Full control over token claims, session shape, and domain validation
- (+) Aligns with official Next.js 16 authentication guide pattern
- (-) More code to write than NextAuth (mitigated: ~6 files, well-scoped)
- (-) Must implement CSRF protection manually (mitigated: SameSite=Lax + state param)

## Implementation

- Google OAuth flow via route handlers (`/api/auth/google`, `/api/auth/callback`)
- JWT session in HttpOnly cookie via jose (HS256, 8h expiry)
- Refresh token encrypted with AES-256-GCM, stored in User.refreshToken
- Domain validation in OAuth callback before user creation
- `proxy.ts` for route protection (redirect unauth to /login)
