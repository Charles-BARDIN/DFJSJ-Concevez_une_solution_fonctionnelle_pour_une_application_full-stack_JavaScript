import { test } from 'node:test';
import * as assert from 'node:assert/strict';

import { StubIdentityService } from '../src/realtime/identity/stub-identity-service';
import { signTestToken } from '../src/realtime/identity/token';

const KEY = 'test-signing-key';

test('verify returns ok with the validated identity for a well-formed token', async () => {
  const service = new StubIdentityService(KEY);
  const token = signTestToken({ userAccountId: 'u1', accountRole: 'support_agent' }, KEY);
  assert.deepEqual(await service.verify(token), {
    ok: true,
    identity: { userAccountId: 'u1', accountRole: 'support_agent' },
  });
});

test('verify fails with invalid_token when the signature does not match', async () => {
  const service = new StubIdentityService(KEY);
  const token = signTestToken({ userAccountId: 'u1', accountRole: 'client' }, 'wrong-key');
  assert.deepEqual(await service.verify(token), { ok: false, reason: 'invalid_token' });
});

test('verify fails with invalid_claims when accountRole is outside the allowed union', async () => {
  const service = new StubIdentityService(KEY);
  // a *correctly signed* token carrying an illegal role: signature is fine, claims are not.
  const token = signTestToken({ userAccountId: 'u1', accountRole: 'admin' }, KEY);
  assert.deepEqual(await service.verify(token), { ok: false, reason: 'invalid_claims' });
});

test('verify fails with invalid_claims when a required claim is missing', async () => {
  const service = new StubIdentityService(KEY);
  const token = signTestToken({ accountRole: 'client' }, KEY);
  assert.deepEqual(await service.verify(token), { ok: false, reason: 'invalid_claims' });
});
