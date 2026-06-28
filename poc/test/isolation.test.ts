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

function connect(url: string, userAccountId: string, accountRole: 'client' | 'support_agent'): WebSocket {
  const ws = new WebSocket(`${url}/?token=${signTestToken({ userAccountId, accountRole }, KEY)}`);
  ws.on('error', () => {});
  return ws;
}

test('a non-participant is refused and the conversation stays isolated (triple negative)', async (t) => {
  const db = openDatabase(':memory:');
  applySchema(db);
  const repo = new SqliteChatRepository(db);

  // C1 has two legitimate participants; 'u-intruder' is authenticated but a
  // participant of no conversation — in particular, not of C1.
  const c1 = repo.createConversation({ status: 'open', createdAt: '2026-06-29T10:00:00.000Z' });
  const customer = repo.addParticipant(c1, 'u-customer', 'customer');
  const agent = repo.addParticipant(c1, 'u-agent', 'agent');
  if (!customer.ok) throw new Error('failed to seed the customer');
  if (!agent.ok) throw new Error('failed to seed the agent');

  const server = createChatServer({ identityService: new StubIdentityService(KEY), chatRepository: repo });
  await new Promise<void>((resolve) => server.listen(0, resolve));
  const { port } = server.address() as AddressInfo;
  const url = `ws://127.0.0.1:${port}`;

  const customerWs = connect(url, 'u-customer', 'client');
  const agentWs = connect(url, 'u-agent', 'support_agent');
  const intruderWs = connect(url, 'u-intruder', 'client');
  await Promise.all([once(customerWs, 'open'), once(agentWs, 'open'), once(intruderWs, 'open')]);

  t.after(async () => {
    customerWs.terminate();
    agentWs.terminate();
    intruderWs.terminate();
    await new Promise<void>((resolve, reject) => server.close((err) => (err ? reject(err) : resolve())));
    db.close();
  });

  // (c) Legitimate members must never see the attempt: arm the listeners BEFORE it.
  let customerReceived = false;
  let agentReceived = false;
  customerWs.on('message', () => {
    customerReceived = true;
  });
  agentWs.on('message', () => {
    agentReceived = true;
  });

  // (a) The intruder targets C1 with an otherwise valid frame and must be refused.
  const refused = once(intruderWs, 'message', { signal: AbortSignal.timeout(2000) });
  intruderWs.send(JSON.stringify({ type: 'send', conversationId: c1, body: 'let me in' }));
  const [rawRefusal] = await refused;
  const refusal = JSON.parse(rawRefusal.toString());
  assert.equal(refusal.type, 'refusal');
  assert.equal(refusal.reason, 'isolation_denied');

  // Let any (erroneous) delivery land before checking the negatives.
  await new Promise((resolve) => setTimeout(resolve, 100));

  // (b) Nothing persisted.
  assert.equal(repo.listMessages(c1).length, 0);
  // (c) Nothing delivered to legitimate members — isolation protects them, not just the sender.
  assert.equal(customerReceived, false);
  assert.equal(agentReceived, false);

  // Non-regression: the refusal did not break the channel — a legitimate member's
  // message in C1 is still delivered and persisted.
  const delivered = once(agentWs, 'message', { signal: AbortSignal.timeout(2000) });
  customerWs.send(JSON.stringify({ type: 'send', conversationId: c1, body: 'hello after the refusal' }));
  const [rawDelivered] = await delivered;
  assert.equal(JSON.parse(rawDelivered.toString()).body, 'hello after the refusal');
  assert.equal(repo.listMessages(c1).length, 1);
});
