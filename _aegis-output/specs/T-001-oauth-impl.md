# T-001 Implementation Spec: Google OAuth SSO Login

## Library Choice
Custom Google OAuth 2.0 + jose JWT (see ADR-001).

## File Layout

```
app/src/
  auth/
    config.ts          # OAuth config constants + domain allowlist
    session.ts         # JWT encrypt/decrypt/create/delete via jose
    crypto.ts          # AES-256-GCM encrypt/decrypt for refresh tokens
    google.ts          # Google OAuth URL builder + token exchange
    dal.ts             # Data Access Layer: verifySession + getUser
  app/
    api/auth/
      google/route.ts  # GET: redirect to Google consent screen
      callback/route.ts # GET: handle OAuth callback, create session
      logout/route.ts  # POST: delete session cookie, redirect
    (auth)/
      login/page.tsx   # SCR-01: Login page UI
  proxy.ts             # Route protection (Next.js 16 proxy convention)
```

## Token Encryption Strategy
- Algorithm: AES-256-GCM via Node.js `crypto` module
- Key: 32-byte from env `DW_REFRESH_TOKEN_KEY` (base64-encoded)
- Output format: `iv:authTag:ciphertext` (all hex)
- IV: 12 bytes random per encryption

## JWT Session Shape
```typescript
{
  userId: string;
  email: string;
  role: UserRole;
  departmentId: string | null;
  exp: number; // 8 hours from issue
}
```

## Domain Allowlist Config
- Env: `ALLOWED_DOMAINS` (comma-separated, e.g. "company.com,partner.org")
- Empty = allow all (dev mode)
- Checked in callback before user upsert

## SCR-01 Login UI
- Server component page at `/(auth)/login/page.tsx`
- Centered card with DriveWiki logo placeholder, "Sign in with Google" button
- Button links to `/api/auth/google` (server redirect, no client JS needed)
- Error display from URL search param `?error=domain_not_allowed`

## Env Variables Required
- GOOGLE_CLIENT_ID
- GOOGLE_CLIENT_SECRET
- AUTH_SECRET (32+ char, for jose JWT signing)
- DW_REFRESH_TOKEN_KEY (base64-encoded 32-byte key)
- ALLOWED_DOMAINS (comma-separated, optional)
- NEXTAUTH_URL / APP_URL (base URL for callbacks)
