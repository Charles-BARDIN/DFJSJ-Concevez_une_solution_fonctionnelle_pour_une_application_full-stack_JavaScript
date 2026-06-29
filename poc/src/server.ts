/**
 * Composition root / entrypoint. Wires configuration, the stubbed identity service
 * and the relational chat repository into the raw WebSocket gateway, then listens.
 * The database file and path are decided here; the realtime module receives a
 * `ChatRepository`, never a `Database`, and `process.env` is read only in config.ts.
 *
 * Demo mode (POC_DEMO_SEED, off by default) is additive: it seeds a demo
 * conversation and prints test tokens at startup. Without it the server starts
 * exactly as in production — an empty `:memory:` store, no seed, no token printout.
 */
import { loadDemoSeed, loadPort, loadTokenSigningKey } from './config';
import { seedDemo } from './demo-seed';
import { StubIdentityService } from './realtime/identity/stub-identity-service';
import {
  SqliteChatRepository,
  applySchema,
  openDatabase,
} from './realtime/persistence/sqlite-chat-repository';
import { createChatServer } from './realtime/transport/ws-server';

// In-process store for the demo run (no daemon, no file to manage). A file path
// here would persist across restarts; not needed at this step.
const DATABASE_FILE = ':memory:';

// Configuration is a startup fail-fast too: a missing or invalid env var should
// read like the EADDRINUSE handler below — one clear line and exit 1, never a raw
// stack. config.ts throws with an actionable message; we surface it and exit here.
function loadConfig(): { port: number; signingKey: string } {
  try {
    return { port: loadPort(), signingKey: loadTokenSigningKey() };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(message);
    process.exit(1);
  }
}

const { port, signingKey } = loadConfig();
const identityService = new StubIdentityService(signingKey);

const db = openDatabase(DATABASE_FILE);
applySchema(db);
const chatRepository = new SqliteChatRepository(db);

const server = createChatServer({ identityService, chatRepository });

server.on('error', (error: NodeJS.ErrnoException) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`Port ${port} is already in use — set POC_PORT to a free port.`);
    process.exitCode = 1;
    return;
  }
  throw error;
});

server.listen(port, () => {
  console.log(`PoC chat server listening on port ${port}`);

  // Demo seed — off by default, additive. Prints exactly what the harness needs.
  if (loadDemoSeed()) {
    const { conversationId, customerToken, agentToken } = seedDemo(chatRepository, signingKey);
    console.log('--- demo seed (POC_DEMO_SEED) ---');
    console.log(`conversationId: ${conversationId}`);
    console.log(`customer token: ${customerToken}`);
    console.log(`agent token   : ${agentToken}`);
    console.log(`customer page : harness/customer.html?token=${customerToken}&conversationId=${conversationId}`);
    console.log(`agent page    : harness/agent.html?token=${agentToken}&conversationId=${conversationId}`);
    console.log('---------------------------------');
  }
});
