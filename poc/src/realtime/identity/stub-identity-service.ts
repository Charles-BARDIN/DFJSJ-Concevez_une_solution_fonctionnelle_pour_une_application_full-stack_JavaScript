/**
 * Stub of the identity service (ADR-006).
 *
 * Verifies the signed *test* token, then validates its claims before trusting them
 * ("parse, don't trust" at the deserialization boundary): a correctly signed token
 * is not yet a trustworthy one. Any invalid form — bad signature, expired, missing
 * claim, `accountRole` outside the union — is a *verification failure* (typed
 * result), never a derivation error thrown further down the flow.
 *
 * It does NOT reimplement token issuance / refresh / OIDC (architecture-only), and
 * it does NOT derive the seat role — `deriveSeatRole` is applied at the connection
 * in step 2.2. `verify` returns the validated account role, nothing more.
 */
import type { AccountRole, IdentityService, VerificationResult } from './identity-port';
import { verifyTestToken, type Clock } from './token';

const ACCOUNT_ROLES: readonly AccountRole[] = ['client', 'support_agent'];

function isAccountRole(value: unknown): value is AccountRole {
  return typeof value === 'string' && (ACCOUNT_ROLES as readonly string[]).includes(value);
}

export class StubIdentityService implements IdentityService {
  constructor(
    private readonly key: string,
    private readonly now: Clock = Date.now,
  ) {}

  async verify(token: string): Promise<VerificationResult> {
    const payload = verifyTestToken(token, this.key, this.now);
    if (payload === null) {
      return { ok: false, reason: 'invalid_token' };
    }

    const userAccountId = payload['userAccountId'];
    const accountRole = payload['accountRole'];
    if (typeof userAccountId !== 'string' || userAccountId === '' || !isAccountRole(accountRole)) {
      return { ok: false, reason: 'invalid_claims' };
    }

    return { ok: true, identity: { userAccountId, accountRole } };
  }
}
