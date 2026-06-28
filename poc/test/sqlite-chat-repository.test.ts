import { test } from 'node:test';
import * as assert from 'node:assert/strict';

import {
  SqliteChatRepository,
  applySchema,
  openDatabase,
} from '../src/realtime/persistence/sqlite-chat-repository';

function newRepo(): SqliteChatRepository {
  const db = openDatabase(':memory:');
  applySchema(db);
  return new SqliteChatRepository(db);
}

test('round-trip: create conversation, add participants, save and list messages', () => {
  const repo = newRepo();
  const conversationId = repo.createConversation({ status: 'open', createdAt: '2026-06-29T10:00:00.000Z' });

  const customer = repo.addParticipant(conversationId, 'u-customer', 'customer');
  if (!customer.ok) throw new Error('expected the customer to be added');
  assert.ok(repo.addParticipant(conversationId, 'u-agent', 'agent').ok);

  const saved = repo.saveMessage({
    conversationId,
    senderParticipantId: customer.participantId,
    body: 'hello',
    sentAt: '2026-06-29T10:01:00.000Z',
  });
  assert.equal(saved.body, 'hello');
  assert.equal(saved.conversationId, conversationId);
  assert.equal(saved.senderParticipantId, customer.participantId);

  const messages = repo.listMessages(conversationId);
  assert.equal(messages.length, 1);
  assert.equal(messages[0]?.body, 'hello');
  assert.equal(messages[0]?.senderParticipantId, customer.participantId);
  assert.equal(repo.listParticipants(conversationId).length, 2);
});

test('addParticipant rejects a duplicate (conversation, account) with a typed result', () => {
  const repo = newRepo();
  const conversationId = repo.createConversation({ status: 'open', createdAt: '2026-06-29T10:00:00.000Z' });
  assert.ok(repo.addParticipant(conversationId, 'u1', 'customer').ok);
  assert.deepEqual(repo.addParticipant(conversationId, 'u1', 'agent'), {
    ok: false,
    reason: 'duplicate_participant',
  });
});

test('addParticipant allows two different accounts in the same conversation', () => {
  const repo = newRepo();
  const conversationId = repo.createConversation({ status: 'open', createdAt: '2026-06-29T10:00:00.000Z' });
  assert.ok(repo.addParticipant(conversationId, 'u1', 'customer').ok);
  assert.ok(repo.addParticipant(conversationId, 'u2', 'agent').ok);
});

test('foreign keys are enforced: a message with a non-existent participant is rejected', () => {
  const repo = newRepo();
  const conversationId = repo.createConversation({ status: 'open', createdAt: '2026-06-29T10:00:00.000Z' });
  assert.throws(() =>
    repo.saveMessage({
      conversationId,
      senderParticipantId: '9999',
      body: 'nope',
      sentAt: '2026-06-29T10:02:00.000Z',
    }),
  );
});

test('foreign keys are enforced: a message in a non-existent conversation is rejected', () => {
  const repo = newRepo();
  assert.throws(() =>
    repo.saveMessage({
      conversationId: '9999',
      senderParticipantId: '9999',
      body: 'nope',
      sentAt: '2026-06-29T10:02:00.000Z',
    }),
  );
});

test('findParticipant returns the participant when present and null when absent', () => {
  const repo = newRepo();
  const conversationId = repo.createConversation({ status: 'open', createdAt: '2026-06-29T10:00:00.000Z' });
  assert.ok(repo.addParticipant(conversationId, 'u1', 'customer').ok);

  const found = repo.findParticipant(conversationId, 'u1');
  assert.equal(found?.userAccountId, 'u1');
  assert.equal(found?.role, 'customer');
  assert.equal(found?.conversationId, conversationId);
  assert.equal(repo.findParticipant(conversationId, 'u-absent'), null);
});
