import { test } from 'node:test';
import * as assert from 'node:assert/strict';

import { loadPort, loadTokenSigningKey } from '../src/config';

test('loadTokenSigningKey returns the key when the variable is set', () => {
  assert.equal(loadTokenSigningKey({ POC_TOKEN_SIGNING_KEY: 'a-key' }), 'a-key');
});

test('loadTokenSigningKey trims surrounding whitespace', () => {
  assert.equal(loadTokenSigningKey({ POC_TOKEN_SIGNING_KEY: '  a-key  ' }), 'a-key');
});

test('loadTokenSigningKey throws when the variable is absent', () => {
  assert.throws(() => loadTokenSigningKey({}));
});

test('loadTokenSigningKey throws when the variable is empty or blank', () => {
  assert.throws(() => loadTokenSigningKey({ POC_TOKEN_SIGNING_KEY: '' }));
  assert.throws(() => loadTokenSigningKey({ POC_TOKEN_SIGNING_KEY: '   ' }));
});

test('loadPort returns the default 8080 when POC_PORT is absent or blank', () => {
  assert.equal(loadPort({}), 8080);
  assert.equal(loadPort({ POC_PORT: '   ' }), 8080);
});

test('loadPort reads a valid POC_PORT', () => {
  assert.equal(loadPort({ POC_PORT: '8787' }), 8787);
});

test('loadPort throws on a non-numeric or out-of-range POC_PORT', () => {
  assert.throws(() => loadPort({ POC_PORT: 'abc' }));
  assert.throws(() => loadPort({ POC_PORT: '0' }));
  assert.throws(() => loadPort({ POC_PORT: '70000' }));
});
