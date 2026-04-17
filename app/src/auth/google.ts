/**
 * Google OAuth 2.0 helpers.
 * T-001: Google OAuth SSO Login
 *
 * Handles authorization URL generation, token exchange, and user info fetching.
 */

import { AUTH_CONFIG, getGoogleClientId, getGoogleClientSecret, getAppUrl } from "./config";
import { randomBytes } from "crypto";

export interface GoogleTokenResponse {
  access_token: string;
  refresh_token?: string;
  id_token?: string;
  expires_in: number;
  token_type: string;
  scope: string;
}

export interface GoogleUserInfo {
  id: string;
  email: string;
  name: string;
  picture?: string;
  verified_email: boolean;
}

/**
 * Generate the Google OAuth authorization URL.
 * Includes state parameter for CSRF protection.
 */
export function buildGoogleAuthUrl(): { url: string; state: string } {
  const state = randomBytes(16).toString("hex");
  const callbackUrl = `${getAppUrl()}/api/auth/callback`;

  const params = new URLSearchParams({
    client_id: getGoogleClientId(),
    redirect_uri: callbackUrl,
    response_type: "code",
    scope: AUTH_CONFIG.scopes.join(" "),
    access_type: "offline",    // Request refresh token
    prompt: "consent",         // Force consent to get refresh token
    state,
  });

  return {
    url: `${AUTH_CONFIG.google.authUrl}?${params.toString()}`,
    state,
  };
}

/**
 * Exchange authorization code for tokens.
 */
export async function exchangeCodeForTokens(code: string): Promise<GoogleTokenResponse> {
  const callbackUrl = `${getAppUrl()}/api/auth/callback`;

  const response = await fetch(AUTH_CONFIG.google.tokenUrl, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: getGoogleClientId(),
      client_secret: getGoogleClientSecret(),
      redirect_uri: callbackUrl,
      grant_type: "authorization_code",
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Google token exchange failed: ${error}`);
  }

  return response.json();
}

/**
 * Fetch Google user info using an access token.
 */
export async function fetchGoogleUserInfo(accessToken: string): Promise<GoogleUserInfo> {
  const response = await fetch(AUTH_CONFIG.google.userInfoUrl, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch Google user info: ${response.statusText}`);
  }

  return response.json();
}
