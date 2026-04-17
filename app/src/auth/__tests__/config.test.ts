/**
 * Unit tests for domain allowlist logic.
 * T-001: ST-001-5
 */

import { describe, it, expect, vi, afterEach } from "vitest";
import { isDomainAllowed, getAllowedDomains } from "../config";

describe("isDomainAllowed", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("should allow any domain when ALLOWED_DOMAINS is empty (dev mode)", () => {
    vi.stubEnv("ALLOWED_DOMAINS", "");
    expect(isDomainAllowed("user@random.com")).toBe(true);
    expect(isDomainAllowed("admin@anything.org")).toBe(true);
  });

  it("should allow any domain when ALLOWED_DOMAINS is not set", () => {
    delete process.env.ALLOWED_DOMAINS;
    expect(isDomainAllowed("user@example.com")).toBe(true);
  });

  it("should allow emails from registered domains", () => {
    vi.stubEnv("ALLOWED_DOMAINS", "company.com,partner.org");
    expect(isDomainAllowed("user@company.com")).toBe(true);
    expect(isDomainAllowed("admin@partner.org")).toBe(true);
  });

  it("should reject emails from non-registered domains", () => {
    vi.stubEnv("ALLOWED_DOMAINS", "company.com");
    expect(isDomainAllowed("user@evil.com")).toBe(false);
    expect(isDomainAllowed("user@company.org")).toBe(false);
  });

  it("should be case-insensitive for domain matching", () => {
    vi.stubEnv("ALLOWED_DOMAINS", "Company.COM");
    expect(isDomainAllowed("user@company.com")).toBe(true);
    expect(isDomainAllowed("user@COMPANY.COM")).toBe(true);
  });

  it("should handle whitespace in ALLOWED_DOMAINS", () => {
    vi.stubEnv("ALLOWED_DOMAINS", " company.com , partner.org ");
    expect(isDomainAllowed("user@company.com")).toBe(true);
    expect(isDomainAllowed("user@partner.org")).toBe(true);
  });

  it("should reject emails with no @ sign", () => {
    vi.stubEnv("ALLOWED_DOMAINS", "company.com");
    expect(isDomainAllowed("no-at-sign")).toBe(false);
  });

  it("should reject empty email", () => {
    vi.stubEnv("ALLOWED_DOMAINS", "company.com");
    expect(isDomainAllowed("")).toBe(false);
  });
});

describe("getAllowedDomains", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("should return empty set when not configured", () => {
    delete process.env.ALLOWED_DOMAINS;
    expect(getAllowedDomains().size).toBe(0);
  });

  it("should parse multiple domains", () => {
    vi.stubEnv("ALLOWED_DOMAINS", "a.com,b.org,c.net");
    const domains = getAllowedDomains();
    expect(domains.size).toBe(3);
    expect(domains.has("a.com")).toBe(true);
    expect(domains.has("b.org")).toBe(true);
    expect(domains.has("c.net")).toBe(true);
  });

  it("should filter empty entries from trailing comma", () => {
    vi.stubEnv("ALLOWED_DOMAINS", "a.com,,b.org,");
    const domains = getAllowedDomains();
    expect(domains.size).toBe(2);
  });
});
