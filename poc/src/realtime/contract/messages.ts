/**
 * Real-time message contract — the wire shape exchanged over the WebSocket.
 *
 * The two directions are modelled separately on purpose. The transport (added at
 * step 2) speaks this contract; the contract references domain ids but carries no
 * behaviour. Dependency direction: transport/contract -> domain.
 */
import type { ConversationId } from '../domain/conversation';
import type { ParticipantId } from '../domain/participant';
import type { MessageId } from '../domain/message';

/**
 * Client -> server: post a message to a conversation.
 *
 * The payload carries *no sender identity*. Identity is bound to the connection,
 * derived from the token at the handshake (step 2), and is never asserted by the
 * client — a trust boundary: a client cannot claim to be someone else by putting
 * an id in the payload.
 */
export interface SendMessageCommand {
  readonly type: 'send';
  readonly conversationId: ConversationId;
  readonly body: string;
}

/** Every frame a client may send (one variant for now), discriminated by `type`. */
export type ClientCommand = SendMessageCommand;

/**
 * Server -> client: a message was accepted and broadcast to the conversation.
 * The sender is exposed as a *participant* reference (the seat), not an account.
 */
export interface MessageEvent {
  readonly type: 'message';
  readonly id: MessageId;
  readonly conversationId: ConversationId;
  readonly senderParticipantId: ParticipantId;
  readonly body: string;
  /** Send instant, ISO-8601 in UTC. */
  readonly sentAt: string;
}

/**
 * Why the server refused something *after* the handshake. Authentication is NOT
 * refused with a frame: an unauthenticated client is rejected with a neutral HTTP
 * 401 at the upgrade and never gets a WebSocket (see the identity port). This frame
 * is therefore only for post-handshake refusals over an established connection.
 */
export type RefusalReason =
  /** Access to a conversation the connection is not a participant of (step 3). */
  'isolation_denied';

/**
 * Server -> client: an expressible refusal over an *established* connection. Used
 * at step 3 for an out-of-isolation access; declared now so that rejection is part
 * of the contract rather than an ad-hoc socket close.
 */
export interface Refusal {
  readonly type: 'refusal';
  readonly reason: RefusalReason;
  readonly detail?: string;
}

/** Every frame the server may send, discriminated by `type`. */
export type ServerEvent = MessageEvent | Refusal;
