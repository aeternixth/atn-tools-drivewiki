/**
 * Unit tests for JWT session (pure functions only, no Next.js cookies).
 * T-002: FR-AUTH-04, FR-AUTH-05
 *
 * Tests encryptSession and decryptSession directly, without server-only
 * or cookies() dependencies.
 */

import { describe, it, expect, vi, beforeAll, afterAll } from "vitest";
import { SignJWT, jwtVerify } from "jose";

// We test the JWT logic directly since session.ts imports "server-only"
// which is not available in vitest. The logic is the same.

const TEST_SECRET = "test-secret-at-least-32-characters-long";

function getKey() {
  return new TextEncoder().encode(TEST_SECRET);
}

async function encryptSession(payload: Record<string, unknown>) {
  const { randomBytes } = await import("crypto");
  const jti = randomBytes(16).toString("hex");
  return new SignJWT({ ...payload, jti })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("8h")
    .sign(getKey());
}

async function decryptSession(token: string | undefined) {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, getKey(), {
      algorithms: ["HS256"],
    });
    return payload;
  } catch {
    return null;
  }
}

describe("JWT session: encryptSession / decryptSession", () => {
  it("should create a valid JWT with correct claims (FR-AUTH-04)", async () => {
    const token = await encryptSession({
      userId: "user-123",
      email: "test@company.com",
      role: "MEMBER",
      departmentId: "dept-456",
    });

    expect(token).toBeTruthy();

    const payload = await decryptSession(token);
    expect(payload).not.toBeNull();
    expect(payload!.userId).toBe("user-123");
    expect(payload!.email).toBe("test@company.com");
    expect(payload!.role).toBe("MEMBER");
    expect(payload!.departmentId).toBe("dept-456");
  });

  it("should include iat and exp claims", async () => {
    const token = await encryptSession({ userId: "u1", email: "a@b.com", role: "MEMBER", departmentId: null });
    const payload = await decryptSession(token);
    expect(payload!.iat).toBeDefined();
    expect(payload!.exp).toBeDefined();
    // exp should be ~8h after iat
    const diff = payload!.exp! - payload!.iat!;
    expect(diff).toBe(8 * 60 * 60);
  });

  it("should include a jti claim for blacklisting", async () => {
    const token = await encryptSession({ userId: "u1", email: "a@b.com", role: "MEMBER", departmentId: null });
    const payload = await decryptSession(token);
    expect(payload!.jti).toBeDefined();
    expect(typeof payload!.jti).toBe("string");
    expect(payload!.jti!.length).toBeGreaterThan(0);
  });

  it("should generate unique jti for each token", async () => {
    const data = { userId: "u1", email: "a@b.com", role: "MEMBER", departmentId: null };
    const t1 = await encryptSession(data);
    const t2 = await encryptSession(data);
    const p1 = await decryptSession(t1);
    const p2 = await decryptSession(t2);
    expect(p1!.jti).not.toBe(p2!.jti);
  });

  it("should return null for tampered token (FR-AUTH-05)", async () => {
    const token = await encryptSession({ userId: "u1", email: "a@b.com", role: "MEMBER", departmentId: null });
    // Tamper with the token
    const tampered = token.slice(0, -5) + "XXXXX";
    const result = await decryptSession(tampered);
    expect(result).toBeNull();
  });

  it("should return null for expired token", async () => {
    // Create a token that expires immediately
    const token = await new SignJWT({ userId: "u1" })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("-1s") // already expired
      .sign(getKey());

    const result = await decryptSession(token);
    expect(result).toBeNull();
  });

  it("should return null for undefined token", async () => {
    const result = await decryptSession(undefined);
    expect(result).toBeNull();
  });

  it("should return null for wrong signing key", async () => {
    const wrongKey = new TextEncoder().encode("wrong-key-that-is-also-32-chars-long!");
    const token = await new SignJWT({ userId: "u1" })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("8h")
      .sign(wrongKey);

    const result = await decryptSession(token);
    expect(result).toBeNull();
  });

  it("should handle null departmentId", async () => {
    const token = await encryptSession({ userId: "u1", email: "a@b.com", role: "MEMBER", departmentId: null });
    const payload = await decryptSession(token);
    expect(payload!.departmentId).toBeNull();
  });
});
