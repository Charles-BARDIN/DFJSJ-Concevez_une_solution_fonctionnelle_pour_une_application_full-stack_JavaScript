/**
 * Identity port — the module's authentication trust boundary.
 *
 * The real-time module *consumes* identity through this port (a TS interface),
 * never through a shared singleton, so an extracted module would only need an
 * implementation of this contract. A "stub of the identity service" will satisfy
 * it at step 2 (verifying the signed test token); token verification is NOT
 * implemented here — only the contract is declared.
 */
import type { UserAccountId } from '../domain/participant';

/**
 * Account role (`user_account.role`, ch.06) — the *identity / RBAC* vocabulary
 * (ADR-002): a human account is either a client or a support agent. Distinct from
 * the seat role (`SeatRole`, `participant.role`); the two are bridged by the pure
 * `deriveSeatRole` seam and never conflated.
 */
export type AccountRole = 'client' | 'support_agent';

/** A verified identity, returned by the identity service after a successful handshake. */
export interface VerifiedIdentity {
  readonly userAccountId: UserAccountId;
  readonly accountRole: AccountRole;
}

/**
 * Port consumed by the real-time module to authenticate a connection. Modelled as
 * potentially remote (returns a promise) so the boundary stays honest even though
 * the step-2 stub verifies the token in process.
 */
export interface IdentityService {
  /**
   * Verify a raw access token presented at the WebSocket handshake and resolve the
   * associated verified identity. Implementations reject when the token is absent
   * or invalid; the transport maps that rejection to a `Refusal` with reason
   * `auth_rejected`. Not implemented at this step.
   *
   * @param token signed access token presented by the connecting client.
   */
  verify(token: string): Promise<VerifiedIdentity>;
}
