import { test } from 'node:test';
import * as assert from 'node:assert/strict';

import { loadTokenSigningKey } from '../src/config';

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
