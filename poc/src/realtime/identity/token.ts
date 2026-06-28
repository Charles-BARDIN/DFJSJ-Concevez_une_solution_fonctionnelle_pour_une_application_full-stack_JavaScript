/**
 * Signed test token — a minimal HMAC-SHA256 envelope for the PoC handshake.
 *
 * This is the *stub* primitive of the identity service (ADR-006): it proves the
 * "signed token verified at connection" principle only. It is NOT the target
 * identity stack (OIDC ID tokens / argon2id / issuance / refresh), which is
 * architecture-only. The signing key is always passed in by the caller — this
 * module never reads `process.env` and never hardcodes a key.
 *
 * Token layout: `base64url(JSON(payload)) + "." + base64url(HMAC_SHA256(payload))`.
 * The layer enforces only envelope integrity and expiry; claim validation ("parse,
 * don't trust") belongs to the identity service stub.
 */
import { createHmac, timingSafeEqual } from 'node:crypto';

/** A clock returning epoch milliseconds; injectable so expiry is deterministic in tests. */
export type Clock = () => number;

/** Lifetime granted to a freshly signed test token. */
const TOKEN_TTL_MS = 5 * 60 * 1000;

function hmac(encodedPayload: string, key: string): Buffer {
  return createHmac('sha256', key).update(encodedPayload).digest();
}

/**
 * Sign a test token. `exp` is derived from the injected clock and embedded in the
 * payload. The key is a parameter — never read from the environment here.
 */
export function signTestToken(claims: Record<string, unknown>, key: string, now: Clock = Date.now): string {
  const payload = { ...claims, exp: now() + TOKEN_TTL_MS };
  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = hmac(encodedPayload, key).toString('base64url');
  return `${encodedPayload}.${signature}`;
}

/**
 * Verify a test token's signature and expiry. Returns the decoded payload on
 * success, or `null` on any failure (malformed, bad signature, expired) — a typed
 * result, never a throw. The signature is compared in constant time.
 */
export function verifyTestToken(token: string, key: string, now: Clock = Date.now): Record<string, unknown> | null {
  const parts = token.split('.');
  if (parts.length !== 2) return null;
  const [encodedPayload, encodedSignature] = parts;
  if (!encodedPayload || !encodedSignature) return null;

  const expected = hmac(encodedPayload, key);
  const provided = Buffer.from(encodedSignature, 'base64url');
  // Different lengths must fail *before* timingSafeEqual, which throws on unequal lengths.
  if (provided.length !== expected.length) return null;
  if (!timingSafeEqual(provided, expected)) return null;

  let decoded: unknown;
  try {
    decoded = JSON.parse(Buffer.from(encodedPayload, 'base64url').toString('utf8'));
  } catch {
    return null;
  }
  if (typeof decoded !== 'object' || decoded === null) return null;

  const payload = decoded as Record<string, unknown>;
  const exp = payload['exp'];
  if (typeof exp !== 'number' || exp <= now()) return null;

  return payload;
}
