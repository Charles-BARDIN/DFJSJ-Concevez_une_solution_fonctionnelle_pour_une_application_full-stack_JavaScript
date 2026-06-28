import { test } from 'node:test';
import * as assert from 'node:assert/strict';

import { deriveSeatRole } from '../src/realtime/identity/seat-role';

test('deriveSeatRole maps the account role "client" to the seat role "customer"', () => {
  assert.equal(deriveSeatRole('client'), 'customer');
});

test('deriveSeatRole maps the account role "support_agent" to the seat role "agent"', () => {
  assert.equal(deriveSeatRole('support_agent'), 'agent');
});
