/**
 * Real-time domain — Conversation entity.
 *
 * The domain layer depends on no transport and no I/O: it declares entities and
 * their type-level invariants only. Dependencies flow transport -> domain, never
 * the reverse. Mirrors `conversation` (ch.06 data model).
 */

/**
 * Opaque conversation identifier. The relational substrate uses BIGINT (ch.06);
 * on the wire and in the domain it is treated as an opaque id, so the domain
 * stays agnostic to the persistence layer's id type (mapping is an adapter
 * concern, added with the persistence port at step 3).
 */
export type ConversationId = string;

/**
 * A support conversation. `status` is intentionally a free-form string: the data
 * model (ch.06) declares `conversation.status` as TEXT with no CHECK constraint,
 * so the PoC does not lock a status vocabulary it was not given.
 */
export interface Conversation {
  readonly id: ConversationId;
  readonly status: string;
  /** Creation instant, ISO-8601 in UTC (`created_at TIMESTAMPTZ`, ch.06). */
  readonly createdAt: string;
}
