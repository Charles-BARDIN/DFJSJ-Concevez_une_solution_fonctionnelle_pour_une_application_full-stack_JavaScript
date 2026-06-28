/**
 * Composition root / entrypoint.
 *
 * Wires configuration and the stubbed identity service into the raw WebSocket
 * gateway, then starts listening. Dependencies are assembled here and injected; the
 * only place that reads `process.env` is `config.ts`, so the realtime module stays
 * environment-agnostic. Run as `node dist/server.js` (after `npm run build`).
 */
import { loadTokenSigningKey } from './config';
import { StubIdentityService } from './realtime/identity/stub-identity-service';
import { createChatServer } from './realtime/transport/ws-server';

const PORT = 8080;

const identityService = new StubIdentityService(loadTokenSigningKey());
const server = createChatServer({ identityService });

server.listen(PORT, () => {
  console.log(`PoC chat handshake server listening on port ${PORT}`);
});
