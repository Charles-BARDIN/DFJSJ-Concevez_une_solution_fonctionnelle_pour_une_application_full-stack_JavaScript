/**
 * Role seam — the single bridge between the identity vocabulary and the domain
 * vocabulary of the locked model (ch.06).
 *
 * Translates an *account* role (`AccountRole`, `user_account.role`) into a *seat*
 * role (`SeatRole`, `participant.role`): `client -> customer`, `support_agent ->
 * agent`. Pure function. The exhaustive `switch` keeps the mapping total and
 * guards, at compile time, against introducing a third vocabulary: adding an
 * account role without mapping it stops the build.
 */
import type { AccountRole } from './identity-port';
import type { SeatRole } from '../domain/participant';

export function deriveSeatRole(accountRole: AccountRole): SeatRole {
  switch (accountRole) {
    case 'client':
      return 'customer';
    case 'support_agent':
      return 'agent';
    default: {
      const unexpected: never = accountRole;
      throw new Error(`Unknown account role: ${String(unexpected)}`);
    }
  }
}
