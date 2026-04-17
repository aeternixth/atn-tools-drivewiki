/**
 * OAuth and authentication configuration constants.
 * T-001: Google OAuth SSO Login
 */

export const AUTH_CONFIG = {
  /** JWT session expiry in seconds (8 hours per FR-AUTH-04) */
  sessionExpirySeconds: 8 * 60 * 60,

  /** Refresh threshold in seconds -- refresh token if less than this remaining (FR-AUTH-08) */
  refreshThresholdSeconds: 1 * 60 * 60, // 1 hour

  /** Cookie name for the JWT session */
  sessionCookieName: "dw-session",

  /** Google OAuth endpoints */
  google: {
    authUrl: "https://accounts.google.com/o/oauth2/v2/auth",
    tokenUrl: "https://oauth2.googleapis.com/token",
    userInfoUrl: "https://www.googleapis.com/oauth2/v2/userinfo",
  },

  /** Required OAuth scopes */
  scopes: [
    "openid",
    "email",
    "profile",
  ],
} as const;

/**
 * Parse comma-separated ALLOWED_DOMAINS env into a Set.
 * Empty set means allow all domains (dev mode).
 */
export function getAllowedDomains(): Set<string> {
  const raw = process.env.ALLOWED_DOMAINS?.trim() ?? "";
  if (!raw) return new Set();
  return new Set(
    raw.split(",").map((d) => d.trim().toLowerCase()).filter(Boolean)
  );
}

/**
 * Check if an email domain is allowed.
 * Returns true if allowlist is empty (dev mode) or domain is in list.
 */
export function isDomainAllowed(email: string): boolean {
  const domains = getAllowedDomains();
  if (domains.size === 0) return true;
  const emailDomain = email.split("@")[1]?.toLowerCase();
  if (!emailDomain) return false;
  return domains.has(emailDomain);
}

export function getAppUrl(): string {
  return process.env.APP_URL ?? process.env.NEXTAUTH_URL ?? "http://localhost:3000";
}

export function getGoogleClientId(): string {
  const id = process.env.GOOGLE_CLIENT_ID;
  if (!id) throw new Error("GOOGLE_CLIENT_ID is not set");
  return id;
}

export function getGoogleClientSecret(): string {
  const secret = process.env.GOOGLE_CLIENT_SECRET;
  if (!secret) throw new Error("GOOGLE_CLIENT_SECRET is not set");
  return secret;
}
