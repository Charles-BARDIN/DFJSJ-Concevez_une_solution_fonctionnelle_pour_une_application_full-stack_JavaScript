/**
 * Persistence port — the chat repository contract, in domain vocabulary.
 *
 * The domain depends on nothing: no SQLite / better-sqlite3 type leaks here. The
 * engine is an adapter detail behind this interface (adapter direction: adapter ->
 * domain). The architectural commitment is the *relational paradigm* (referential
 * integrity + ACID, §4.7), not the engine: PostgreSQL is the target (ADR-019),
 * SQLite is the proof substrate. Ids exposed here are the domain `...Id` types,
 * never a raw driver number/bigint.
 *
 * Scope at this step (3.1): persistence only. Conversation isolation rides on the
 * Participant -> Conversation relation; `findParticipant` is the primitive the
 * message handler (step 3.2) uses to answer "is the sender a participant of this
 * conversation?". The methods are synchronous, matching the in-process substrate.
 */
import type { ConversationId } from './conversation';
import type { Participant, ParticipantId, SeatRole, UserAccountId } from './participant';
import type { Message } from './message';

/** Inputs to create a conversation (`conversation`, ch.06). */
export interface NewConversation {
  readonly status: string;
  /** Creation instant, ISO-8601 UTC. */
  readonly createdAt: string;
}

/** Inputs to persist a message (`message`, ch.06). */
export interface NewMessage {
  readonly conversationId: ConversationId;
  readonly senderParticipantId: ParticipantId;
  readonly body: string;
  /** Send instant, ISO-8601 UTC. */
  readonly sentAt: string;
}

/**
 * Result of adding a participant — a typed ok/failure value (same style as the
 * identity port's `VerificationResult`): a duplicate (conversation, account) is a
 * named domain outcome, not a raw driver throw.
 */
export type AddParticipantResult =
  | { readonly ok: true; readonly participantId: ParticipantId }
  | { readonly ok: false; readonly reason: 'duplicate_participant' };

export interface ChatRepository {
  /** Create a conversation and return its id. */
  createConversation(conversation: NewConversation): ConversationId;

  /**
   * Seat an account in a conversation with a role. A given account may sit in a
   * conversation only once (`UNIQUE (conversation_id, user_account_id)`, ch.06):
   * a duplicate yields `{ ok: false, reason: 'duplicate_participant' }`.
   */
  addParticipant(
    conversationId: ConversationId,
    userAccountId: UserAccountId,
    role: SeatRole,
  ): AddParticipantResult;

  /**
   * The isolation primitive: the participant for (conversation, account), or null
   * if that account does not sit in that conversation.
   */
  findParticipant(conversationId: ConversationId, userAccountId: UserAccountId): Participant | null;

  /** Persist a message and return the stored entity (with its generated id). */
  saveMessage(message: NewMessage): Message;

  /** All participants of a conversation (for broadcast and assertions). */
  listParticipants(conversationId: ConversationId): readonly Participant[];

  /** All messages of a conversation, in insertion order. */
  listMessages(conversationId: ConversationId): readonly Message[];
}
