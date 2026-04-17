/**
 * AES-256-GCM encryption/decryption for refresh tokens.
 * T-001: Encrypted refresh token storage (FR-AUTH-02)
 *
 * Format: iv:authTag:ciphertext (all hex-encoded)
 * Key: 32-byte from env DW_REFRESH_TOKEN_KEY (base64-encoded)
 */

import { randomBytes, createCipheriv, createDecipheriv } from "crypto";

function getEncryptionKey(): Buffer {
  const keyBase64 = process.env.DW_REFRESH_TOKEN_KEY;
  if (!keyBase64) {
    throw new Error("DW_REFRESH_TOKEN_KEY environment variable is not set");
  }
  const key = Buffer.from(keyBase64, "base64");
  if (key.length !== 32) {
    throw new Error(
      `DW_REFRESH_TOKEN_KEY must be 32 bytes (got ${key.length}). Generate with: openssl rand -base64 32`
    );
  }
  return key;
}

/**
 * Encrypt a plaintext string using AES-256-GCM.
 * Returns "iv:authTag:ciphertext" (hex-encoded).
 */
export function encryptRefreshToken(plaintext: string): string {
  const key = getEncryptionKey();
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key, iv);

  let encrypted = cipher.update(plaintext, "utf8", "hex");
  encrypted += cipher.final("hex");
  const authTag = cipher.getAuthTag().toString("hex");

  return `${iv.toString("hex")}:${authTag}:${encrypted}`;
}

/**
 * Decrypt an "iv:authTag:ciphertext" string using AES-256-GCM.
 * Returns the original plaintext.
 * Throws on tampered data or wrong key.
 */
export function decryptRefreshToken(encrypted: string): string {
  const key = getEncryptionKey();
  const parts = encrypted.split(":");
  if (parts.length !== 3) {
    throw new Error("Invalid encrypted token format (expected iv:authTag:ciphertext)");
  }
  const [ivHex, authTagHex, ciphertextHex] = parts;

  const iv = Buffer.from(ivHex, "hex");
  const authTag = Buffer.from(authTagHex, "hex");
  const decipher = createDecipheriv("aes-256-gcm", key, iv);
  decipher.setAuthTag(authTag);

  let decrypted = decipher.update(ciphertextHex, "hex", "utf8");
  decrypted += decipher.final("utf8");

  return decrypted;
}
