/**
 * SQLite chat repository — the persistence adapter (the only file that imports
 * better-sqlite3). It implements the domain `ChatRepository` port using a
 * better-sqlite3 connection received by injection: it never opens the file itself
 * and never reads `process.env`. Generated rowids are converted to the domain
 * `...Id` string types at the boundary, and the UNIQUE (conversation, account)
 * driver error is translated into the port's typed `duplicate_participant` result
 * rather than leaking a raw `SqliteError`.
 *
 * Engine choice is an adapter detail: PostgreSQL is the target (ADR-019), SQLite is
 * the proof substrate. The relational structure is faithful to ch.06 (see
 * schema.sql); only column type affinity differs.
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import Database from 'better-sqlite3';

import type {
  AddParticipantResult,
  ChatRepository,
  NewConversation,
  NewMessage,
} from '../domain/chat-repository';
import type { ConversationId } from '../domain/conversation';
import type { Participant, SeatRole, UserAccountId } from '../domain/participant';
import type { Message } from '../domain/message';

interface ParticipantRow {
  readonly id: number;
  readonly conversation_id: number;
  readonly user_account_id: string;
  readonly role: string;
}

interface MessageRow {
  readonly id: number;
  readonly conversation_id: number;
  readonly sender_participant_id: number;
  readonly body: string;
  readonly sent_at: string;
}

/** Open a better-sqlite3 connection (`:memory:` for tests, a file path otherwise). */
export function openDatabase(filename: string): Database.Database {
  return new Database(filename);
}

/** Apply the relational schema (schema.sql) to a connection. */
export function applySchema(db: Database.Database): void {
  db.exec(readFileSync(join(__dirname, 'schema.sql'), 'utf8'));
}

export class SqliteChatRepository implements ChatRepository {
  private readonly insertConversation: Database.Statement;
  private readonly insertParticipant: Database.Statement;
  private readonly selectParticipant: Database.Statement;
  private readonly insertMessage: Database.Statement;
  private readonly selectParticipants: Database.Statement;
  private readonly selectMessages: Database.Statement;

  constructor(private readonly db: Database.Database) {
    // Foreign keys are per-connection in SQLite and OFF by default.
    this.db.pragma('foreign_keys = ON');
    this.insertConversation = db.prepare('INSERT INTO conversation (status, created_at) VALUES (?, ?)');
    this.insertParticipant = db.prepare(
      'INSERT INTO participant (conversation_id, user_account_id, role) VALUES (?, ?, ?)',
    );
    this.selectParticipant = db.prepare(
      'SELECT id, conversation_id, user_account_id, role FROM participant WHERE conversation_id = ? AND user_account_id = ?',
    );
    this.insertMessage = db.prepare(
      'INSERT INTO message (conversation_id, sender_participant_id, body, sent_at) VALUES (?, ?, ?, ?)',
    );
    this.selectParticipants = db.prepare(
      'SELECT id, conversation_id, user_account_id, role FROM participant WHERE conversation_id = ? ORDER BY id',
    );
    this.selectMessages = db.prepare(
      'SELECT id, conversation_id, sender_participant_id, body, sent_at FROM message WHERE conversation_id = ? ORDER BY id',
    );
  }

  createConversation(conversation: NewConversation): ConversationId {
    const info = this.insertConversation.run(conversation.status, conversation.createdAt);
    return String(info.lastInsertRowid);
  }

  addParticipant(
    conversationId: ConversationId,
    userAccountId: UserAccountId,
    role: SeatRole,
  ): AddParticipantResult {
    try {
      const info = this.insertParticipant.run(Number(conversationId), userAccountId, role);
      return { ok: true, participantId: String(info.lastInsertRowid) };
    } catch (error) {
      if (error instanceof Database.SqliteError && error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
        return { ok: false, reason: 'duplicate_participant' };
      }
      throw error;
    }
  }

  findParticipant(conversationId: ConversationId, userAccountId: UserAccountId): Participant | null {
    const row = this.selectParticipant.get(Number(conversationId), userAccountId) as
      | ParticipantRow
      | undefined;
    return row ? toParticipant(row) : null;
  }

  saveMessage(message: NewMessage): Message {
    const info = this.insertMessage.run(
      Number(message.conversationId),
      Number(message.senderParticipantId),
      message.body,
      message.sentAt,
    );
    return {
      id: String(info.lastInsertRowid),
      conversationId: message.conversationId,
      senderParticipantId: message.senderParticipantId,
      body: message.body,
      sentAt: message.sentAt,
    };
  }

  listParticipants(conversationId: ConversationId): readonly Participant[] {
    const rows = this.selectParticipants.all(Number(conversationId)) as ParticipantRow[];
    return rows.map(toParticipant);
  }

  listMessages(conversationId: ConversationId): readonly Message[] {
    const rows = this.selectMessages.all(Number(conversationId)) as MessageRow[];
    return rows.map((row) => ({
      id: String(row.id),
      conversationId: String(row.conversation_id),
      senderParticipantId: String(row.sender_participant_id),
      body: row.body,
      sentAt: row.sent_at,
    }));
  }
}

function toParticipant(row: ParticipantRow): Participant {
  return {
    id: String(row.id),
    conversationId: String(row.conversation_id),
    userAccountId: row.user_account_id,
    role: row.role as SeatRole, // guaranteed by CHECK (role IN ('customer','agent'))
  };
}
