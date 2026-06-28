/**
 * Identity port — the module's authentication trust boundary.
 *
 * The real-time module *consumes* identity through this port (a TS interface),
 * never through a shared singleton, so an extracted module would only need an
 * implementation of this contract. A "stub of the identity service" satisfies it
 * in the PoC (verifying a signed test token); the target identity stack
 * (issuance / refresh / OIDC) is architecture-only (ADR-006).
 */
import type { UserAccountId } from '../domain/participant';

/**
 * Account role (`user_account.role`, ch.06) — the *identity / RBAC* vocabulary
 * (ADR-002): a human account is either a client or a support agent. Distinct from
 * the seat role (`SeatRole`, `participant.role`); the two are bridged by the pure
 * `deriveSeatRole` seam and never conflated.
 */
export type AccountRole = 'client' | 'support_agent';

/** A verified identity, returned by the identity service on success. */
export interface VerifiedIdentity {
  readonly userAccountId: UserAccountId;
  readonly accountRole: AccountRole;
}

/** Why a verification failed: token integrity vs claim shape. */
export type VerificationFailureReason = 'invalid_token' | 'invalid_claims';

/**
 * Result of a verification — a typed ok/failure value, never a throw, so the
 * handshake (step 2.2) can branch cleanly and tests can assert on the outcome.
 * The transport maps any failure to a `Refusal` with reason `auth_rejected`,
 * without leaking which check failed.
 */
export type VerificationResult =
  | { readonly ok: true; readonly identity: VerifiedIdentity }
  | { readonly ok: false; readonly reason: VerificationFailureReason };

export interface IdentityService {
  /**
   * Verify a raw access token presented at the WebSocket handshake. Returns a
   * typed result (never throws on an invalid token). The PoC implementation is a
   * stub (ADR-006); a real implementation could be remote, hence the promise.
   *
   * @param token raw access token presented by the connecting client.
   */
  verify(token: string): Promise<VerificationResult>;
}
