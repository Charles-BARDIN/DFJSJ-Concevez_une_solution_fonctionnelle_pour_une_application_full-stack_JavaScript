import { test } from 'node:test';
import * as assert from 'node:assert/strict';
import { once } from 'node:events';
import type { AddressInfo } from 'node:net';
import { WebSocket } from 'ws';

import { createChatServer } from '../src/realtime/transport/ws-server';
import { StubIdentityService } from '../src/realtime/identity/stub-identity-service';
import { signTestToken } from '../src/realtime/identity/token';
import {
  SqliteChatRepository,
  applySchema,
  openDatabase,
} from '../src/realtime/persistence/sqlite-chat-repository';

const KEY = 'integration-test-key';

async function startExchange() {
  const db = openDatabase(':memory:');
  applySchema(db);
  const repo = new SqliteChatRepository(db);

  const conversationId = repo.createConversation({ status: 'open', createdAt: '2026-06-29T10:00:00.000Z' });
  const customer = repo.addParticipant(conversationId, 'u-customer', 'customer');
  const agent = repo.addParticipant(conversationId, 'u-agent', 'agent');
  if (!customer.ok) throw new Error('failed to seed the customer');
  if (!agent.ok) throw new Error('failed to seed the agent');

  const server = createChatServer({
    identityService: new StubIdentityService(KEY),
    chatRepository: repo,
  });
  await new Promise<void>((resolve) => server.listen(0, resolve));
  const { port } = server.address() as AddressInfo;
  const url = `ws://127.0.0.1:${port}`;

  const customerWs = new WebSocket(
    `${url}/?token=${signTestToken({ userAccountId: 'u-customer', accountRole: 'client' }, KEY)}`,
  );
  const agentWs = new WebSocket(
    `${url}/?token=${signTestToken({ userAccountId: 'u-agent', accountRole: 'support_agent' }, KEY)}`,
  );
  customerWs.on('error', () => {});
  agentWs.on('error', () => {});
  await Promise.all([once(customerWs, 'open'), once(agentWs, 'open')]);

  const close = async (): Promise<void> => {
    customerWs.terminate();
    agentWs.terminate();
    await new Promise<void>((resolve, reject) => server.close((err) => (err ? reject(err) : resolve())));
    db.close();
  };

  return {
    repo,
    conversationId,
    customerParticipantId: customer.participantId,
    agentParticipantId: agent.participantId,
    customerWs,
    agentWs,
    close,
  };
}

test('a customer message reaches the agent and is persisted', async (t) => {
  const x = await startExchange();
  t.after(x.close);

  const received = once(x.agentWs, 'message', { signal: AbortSignal.timeout(2000) });
  x.customerWs.send(JSON.stringify({ type: 'send', conversationId: x.conversationId, body: 'hello from the customer' }));

  const [raw] = await received;
  const event = JSON.parse(raw.toString());
  assert.equal(event.type, 'message');
  assert.equal(event.body, 'hello from the customer');
  assert.equal(event.conversationId, x.conversationId);
  assert.equal(event.senderParticipantId, x.customerParticipantId);

  const messages = x.repo.listMessages(x.conversationId);
  assert.equal(messages.length, 1);
  assert.equal(messages[0]?.body, 'hello from the customer');
  assert.equal(messages[0]?.senderParticipantId, x.customerParticipantId);
});

test('an agent reply reaches the customer (reciprocal)', async (t) => {
  const x = await startExchange();
  t.after(x.close);

  const received = once(x.customerWs, 'message', { signal: AbortSignal.timeout(2000) });
  x.agentWs.send(JSON.stringify({ type: 'send', conversationId: x.conversationId, body: 'hello from the agent' }));

  const [raw] = await received;
  const event = JSON.parse(raw.toString());
  assert.equal(event.body, 'hello from the agent');
  assert.equal(event.senderParticipantId, x.agentParticipantId);
});
