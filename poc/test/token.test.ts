import { test } from 'node:test';
import * as assert from 'node:assert/strict';

import { signTestToken, verifyTestToken } from '../src/realtime/identity/token';

const KEY = 'test-signing-key';

test('verifyTestToken returns the claims for a token signed with the same key', () => {
  const token = signTestToken({ userAccountId: 'u1', accountRole: 'client' }, KEY);
  const payload = verifyTestToken(token, KEY);
  assert.ok(payload);
  assert.equal(payload?.['userAccountId'], 'u1');
  assert.equal(payload?.['accountRole'], 'client');
});

test('verifyTestToken rejects a token whose payload was tampered with', () => {
  const token = signTestToken({ userAccountId: 'u1', accountRole: 'client' }, KEY);
  const signature = token.split('.')[1];
  const swapped = Buffer.from(
    JSON.stringify({ userAccountId: 'attacker', accountRole: 'support_agent', exp: 9_999_999_999_999 }),
  ).toString('base64url');
  assert.equal(verifyTestToken(`${swapped}.${signature}`, KEY), null);
});

test('verifyTestToken rejects a token signed with a different key', () => {
  const token = signTestToken({ userAccountId: 'u1', accountRole: 'client' }, KEY);
  assert.equal(verifyTestToken(token, 'another-key'), null);
});

test('verifyTestToken rejects an absent or malformed token', () => {
  assert.equal(verifyTestToken('', KEY), null);
  assert.equal(verifyTestToken('garbage', KEY), null);
  assert.equal(verifyTestToken('a.b.c', KEY), null);
});

test('verifyTestToken rejects an expired token using the injected clock', () => {
  const issuedAt = 1_000_000;
  const token = signTestToken({ userAccountId: 'u1', accountRole: 'client' }, KEY, () => issuedAt);
  assert.equal(verifyTestToken(token, KEY, () => issuedAt + 60 * 60 * 1000), null);
  assert.ok(verifyTestToken(token, KEY, () => issuedAt + 1));
});
