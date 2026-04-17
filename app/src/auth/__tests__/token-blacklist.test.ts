/**
 * Unit tests for token blacklist.
 * T-002: FR-AUTH-09 — session revocation
 */

import { describe, it, expect, beforeEach } from "vitest";
import {
  blacklistToken,
  isTokenBlacklisted,
  _clearBlacklistForTesting,
} from "../token-blacklist";

describe("token-blacklist", () => {
  beforeEach(() => {
    _clearBlacklistForTesting();
  });

  it("should not blacklist tokens by default", async () => {
    expect(await isTokenBlacklisted("some-jti")).toBe(false);
  });

  it("should blacklist a token", async () => {
    await blacklistToken("jti-123", 3600);
    expect(await isTokenBlacklisted("jti-123")).toBe(true);
  });

  it("should not affect other tokens", async () => {
    await blacklistToken("jti-123", 3600);
    expect(await isTokenBlacklisted("jti-456")).toBe(false);
  });

  it("should handle multiple blacklisted tokens", async () => {
    await blacklistToken("jti-a", 3600);
    await blacklistToken("jti-b", 3600);
    await blacklistToken("jti-c", 3600);
    expect(await isTokenBlacklisted("jti-a")).toBe(true);
    expect(await isTokenBlacklisted("jti-b")).toBe(true);
    expect(await isTokenBlacklisted("jti-c")).toBe(true);
    expect(await isTokenBlacklisted("jti-d")).toBe(false);
  });

  it("should clear blacklist for testing", async () => {
    await blacklistToken("jti-123", 3600);
    _clearBlacklistForTesting();
    expect(await isTokenBlacklisted("jti-123")).toBe(false);
  });
});
