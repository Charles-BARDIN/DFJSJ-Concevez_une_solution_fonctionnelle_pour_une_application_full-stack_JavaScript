/**
 * Real-time domain — Message entity.
 *
 * Mirrors `message` (ch.06). The domain depends on no transport and no I/O.
 */
import type { ConversationId } from './conversation';
import type { ParticipantId } from './participant';

/** Opaque message identifier (`message.id` BIGINT, ch.06; opaque here). */
export type MessageId = string;

/**
 * A message posted in a conversation by one of its participants. The sender is
 * referenced by its *participant* id (`sender_participant_id`, ch.06), i.e. the
 * seat in the conversation, not the raw account.
 */
export interface Message {
  readonly id: MessageId;
  readonly conversationId: ConversationId;
  readonly senderParticipantId: ParticipantId;
  readonly body: string;
  /** Send instant, ISO-8601 in UTC (`sent_at TIMESTAMPTZ`, ch.06). */
  readonly sentAt: string;
}
