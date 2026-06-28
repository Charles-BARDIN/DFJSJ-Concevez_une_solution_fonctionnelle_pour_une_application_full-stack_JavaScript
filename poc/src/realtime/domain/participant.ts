/**
 * Real-time domain — Participant entity.
 *
 * Mirrors `participant` (ch.06). The domain depends on no transport and no I/O.
 */
import type { ConversationId } from './conversation';

/** Opaque participant identifier (`participant.id` BIGINT, ch.06; opaque here). */
export type ParticipantId = string;

/**
 * Opaque reference to a user account (`user_account.id`, ch.06). The real-time
 * domain stores this foreign reference on a participant but knows nothing else
 * about the account; the account vocabulary (role, etc.) lives behind the
 * identity port. Reused by the identity port so both sides speak the same id.
 */
export type UserAccountId = string;

/**
 * Seat role inside a conversation (`participant.role`, ch.06): the two sides of a
 * support chat. This is the *domain* vocabulary, distinct from the *account*
 * vocabulary (`AccountRole`, `user_account.role`) carried by the identity port.
 * The two are bridged by the pure `deriveSeatRole` seam — never conflated, and a
 * third vocabulary is never introduced.
 */
export type SeatRole = 'customer' | 'agent';

/**
 * A participant binds a user account to a conversation with a seat role. The
 * (conversation, account) pair is unique (ch.06); conversation isolation rides on
 * this Participant -> Conversation relation and is enforced at step 3.
 */
export interface Participant {
  readonly id: ParticipantId;
  readonly conversationId: ConversationId;
  readonly userAccountId: UserAccountId;
  readonly role: SeatRole;
}
