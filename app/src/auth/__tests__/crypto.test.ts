/**
 * Unit tests for AES-256-GCM refresh token encryption.
 * T-001: ST-001-7
 */

import { describe, it, expect, beforeAll, afterAll, vi } from "vitest";
import { encryptRefreshToken, decryptRefreshToken } from "../crypto";
import { randomBytes } from "crypto";

// Generate a valid 32-byte key for testing
const TEST_KEY = randomBytes(32).toString("base64");

describe("crypto: encryptRefreshToken / decryptRefreshToken", () => {
  beforeAll(() => {
    vi.stubEnv("DW_REFRESH_TOKEN_KEY", TEST_KEY);
  });

  afterAll(() => {
    vi.unstubAllEnvs();
  });

  it("should encrypt and decrypt a round-trip successfully", () => {
    const plaintext = "ya29.a0AfH6SMB_test_refresh_token_value";
    const encrypted = encryptRefreshToken(plaintext);
    const decrypted = decryptRefreshToken(encrypted);
    expect(decrypted).toBe(plaintext);
  });

  it("should produce different ciphertexts for the same input (random IV)", () => {
    const plaintext = "same-token-value";
    const a = encryptRefreshToken(plaintext);
    const b = encryptRefreshToken(plaintext);
    expect(a).not.toBe(b);
    // But both decrypt to the same value
    expect(decryptRefreshToken(a)).toBe(plaintext);
    expect(decryptRefreshToken(b)).toBe(plaintext);
  });

  it("should produce format iv:authTag:ciphertext (3 hex parts)", () => {
    const encrypted = encryptRefreshToken("test");
    const parts = encrypted.split(":");
    expect(parts).toHaveLength(3);
    // IV is 12 bytes = 24 hex chars
    expect(parts[0]).toHaveLength(24);
    // AuthTag is 16 bytes = 32 hex chars
    expect(parts[1]).toHaveLength(32);
    // Ciphertext is non-empty
    expect(parts[2].length).toBeGreaterThan(0);
  });

  it("should throw on tampered ciphertext", () => {
    const encrypted = encryptRefreshToken("sensitive-data");
    const parts = encrypted.split(":");
    // Tamper with ciphertext
    const tampered = `${parts[0]}:${parts[1]}:${"ff".repeat(parts[2].length / 2)}`;
    expect(() => decryptRefreshToken(tampered)).toThrow();
  });

  it("should throw on invalid format", () => {
    expect(() => decryptRefreshToken("not-valid-format")).toThrow(
      "Invalid encrypted token format"
    );
  });

  it("should handle empty string input", () => {
    const encrypted = encryptRefreshToken("");
    const decrypted = decryptRefreshToken(encrypted);
    expect(decrypted).toBe("");
  });

  it("should handle unicode input", () => {
    const plaintext = "token-with-unicode-\u00e9\u00e8\u00ea";
    const encrypted = encryptRefreshToken(plaintext);
    const decrypted = decryptRefreshToken(encrypted);
    expect(decrypted).toBe(plaintext);
  });
});

describe("crypto: missing key", () => {
  it("should throw when DW_REFRESH_TOKEN_KEY is not set", () => {
    const original = process.env.DW_REFRESH_TOKEN_KEY;
    delete process.env.DW_REFRESH_TOKEN_KEY;
    expect(() => encryptRefreshToken("test")).toThrow(
      "DW_REFRESH_TOKEN_KEY environment variable is not set"
    );
    process.env.DW_REFRESH_TOKEN_KEY = original;
  });

  it("should throw when key is wrong length", () => {
    const original = process.env.DW_REFRESH_TOKEN_KEY;
    process.env.DW_REFRESH_TOKEN_KEY = Buffer.from("short").toString("base64");
    expect(() => encryptRefreshToken("test")).toThrow("must be 32 bytes");
    process.env.DW_REFRESH_TOKEN_KEY = original;
  });
});

describe("crypto: wrong key decryption", () => {
  it("should throw when decrypting with a different key", () => {
    // Encrypt with TEST_KEY
    vi.stubEnv("DW_REFRESH_TOKEN_KEY", TEST_KEY);
    const encrypted = encryptRefreshToken("secret");

    // Try to decrypt with a different key
    const wrongKey = randomBytes(32).toString("base64");
    vi.stubEnv("DW_REFRESH_TOKEN_KEY", wrongKey);
    expect(() => decryptRefreshToken(encrypted)).toThrow();

    vi.unstubAllEnvs();
  });
});
