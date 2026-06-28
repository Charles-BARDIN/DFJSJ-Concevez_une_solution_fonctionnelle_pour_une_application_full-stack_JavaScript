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

async function startServer(): Promise<{ url: string; close: () => Promise<void> }> {
  const db = openDatabase(':memory:');
  applySchema(db);
  const server = createChatServer({
    identityService: new StubIdentityService(KEY),
    chatRepository: new SqliteChatRepository(db),
  });
  await new Promise<void>((resolve) => server.listen(0, resolve));
  const { port } = server.address() as AddressInfo;
  return {
    url: `ws://127.0.0.1:${port}`,
    close: async () => {
      await new Promise<void>((resolve, reject) => server.close((err) => (err ? reject(err) : resolve())));
      db.close();
    },
  };
}

test('handshake accepts a connection presenting a valid token', async (t) => {
  const server = await startServer();
  const token = signTestToken({ userAccountId: 'u1', accountRole: 'client' }, KEY);
  const ws = new WebSocket(`${server.url}/?token=${token}`);
  ws.on('error', () => {});
  t.after(async () => {
    ws.terminate();
    await server.close();
  });

  await once(ws, 'open');
  assert.equal(ws.readyState, WebSocket.OPEN);
});

test('handshake rejects a connection with no token (HTTP 401)', async (t) => {
  const server = await startServer();
  const ws = new WebSocket(`${server.url}/`);
  ws.on('error', () => {});
  t.after(async () => {
    ws.terminate();
    await server.close();
  });

  const [, response] = await once(ws, 'unexpected-response');
  assert.equal(response.statusCode, 401);
});

test('handshake rejects a connection with an invalid token (HTTP 401)', async (t) => {
  const server = await startServer();
  const forged = signTestToken({ userAccountId: 'u1', accountRole: 'client' }, 'wrong-key');
  const ws = new WebSocket(`${server.url}/?token=${forged}`);
  ws.on('error', () => {});
  t.after(async () => {
    ws.terminate();
    await server.close();
  });

  const [, response] = await once(ws, 'unexpected-response');
  assert.equal(response.statusCode, 401);
});

test('the server survives an aborted upgrade and keeps serving', async (t) => {
  const server = await startServer();
  t.after(async () => {
    await server.close();
  });
  const token = signTestToken({ userAccountId: 'u1', accountRole: 'client' }, KEY);

  // A client that connects then aborts immediately, around handshake time.
  const aborted = new WebSocket(`${server.url}/?token=${token}`);
  aborted.on('error', () => {});
  aborted.terminate();

  // The server must still accept a fresh connection afterwards.
  const ws = new WebSocket(`${server.url}/?token=${token}`);
  ws.on('error', () => {});
  await once(ws, 'open');
  assert.equal(ws.readyState, WebSocket.OPEN);
  ws.terminate();
});
