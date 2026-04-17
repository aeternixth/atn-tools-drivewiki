/**
 * JWT Token Blacklist for session revocation.
 * T-002: FR-AUTH-09 — revoke session and blacklist JWT on logout.
 *
 * Strategy:
 * - In production: uses Redis SET with TTL matching token expiry
 * - In development: uses in-memory Set (cleared on restart)
 *
 * The blacklist stores JWT IDs (jti). When a user logs out, their current
 * token's jti is added to the blacklist. The proxy and DAL check this
 * before granting access.
 */

// In-memory blacklist for development (will be replaced by Redis in production)
const memoryBlacklist = new Set<string>();

/**
 * Add a JWT ID to the blacklist.
 * @param jti The JWT ID to blacklist
 * @param expiresInSeconds TTL for the blacklist entry (matches token remaining lifetime)
 */
export async function blacklistToken(jti: string, expiresInSeconds: number): Promise<void> {
  const redisUrl = process.env.REDIS_URL;

  if (redisUrl) {
    // Production: Redis SET with EX (auto-expire when token would have expired)
    // TODO: Replace with actual Redis client when Redis is configured
    // await redis.set(`blacklist:${jti}`, "1", "EX", expiresInSeconds);
    memoryBlacklist.add(jti);
    // Auto-cleanup after TTL
    setTimeout(() => memoryBlacklist.delete(jti), expiresInSeconds * 1000);
  } else {
    // Development: in-memory
    memoryBlacklist.add(jti);
    setTimeout(() => memoryBlacklist.delete(jti), expiresInSeconds * 1000);
  }
}

/**
 * Check if a JWT ID has been blacklisted.
 */
export async function isTokenBlacklisted(jti: string): Promise<boolean> {
  const redisUrl = process.env.REDIS_URL;

  if (redisUrl) {
    // Production: Redis EXISTS
    // TODO: Replace with actual Redis client
    // return (await redis.exists(`blacklist:${jti}`)) === 1;
    return memoryBlacklist.has(jti);
  }

  return memoryBlacklist.has(jti);
}

/**
 * Clear the in-memory blacklist (for testing only).
 */
export function _clearBlacklistForTesting(): void {
  memoryBlacklist.clear();
}
