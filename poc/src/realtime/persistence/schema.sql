-- Chat persistence — SQLite realisation of the ch.06 relational model.
--
-- The structure is faithful to the ch.06 DDL: tables, columns, foreign keys, the
-- UNIQUE (conversation_id, user_account_id) constraint and the role CHECK. Only the
-- column type *affinity* differs from the PostgreSQL target (ADR-019): generated
-- ids are INTEGER (rowid-backed, auto-assigned), timestamps are ISO-8601 UTC TEXT.
-- The relational paradigm — referential integrity + ACID — is the architectural
-- commitment (§4.7); the engine is an adapter detail.
--
-- `user_account_id` is an opaque TEXT reference to the (stubbed) identity: the PoC
-- does not persist a `user_account` table, so there is no foreign key to one here.
-- Foreign-key enforcement requires `PRAGMA foreign_keys = ON` (set by the adapter).

CREATE TABLE IF NOT EXISTS conversation (
  id         INTEGER PRIMARY KEY,
  status     TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS participant (
  id              INTEGER PRIMARY KEY,
  conversation_id INTEGER NOT NULL REFERENCES conversation(id),
  user_account_id TEXT NOT NULL,
  role            TEXT NOT NULL CHECK (role IN ('customer', 'agent')),
  UNIQUE (conversation_id, user_account_id)
);

CREATE TABLE IF NOT EXISTS message (
  id                    INTEGER PRIMARY KEY,
  conversation_id       INTEGER NOT NULL REFERENCES conversation(id),
  sender_participant_id INTEGER NOT NULL REFERENCES participant(id),
  body                  TEXT NOT NULL,
  sent_at               TEXT NOT NULL
);
