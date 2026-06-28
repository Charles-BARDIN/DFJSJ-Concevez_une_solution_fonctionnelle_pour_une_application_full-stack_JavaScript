/**
 * Composition root / entrypoint. Wires configuration, the stubbed identity service
 * and the relational chat repository into the raw WebSocket gateway, then listens.
 * The database file and path are decided here; the realtime module receives a
 * `ChatRepository`, never a `Database`, and `process.env` is read only in config.ts.
 */
import { loadPort, loadTokenSigningKey } from './config';
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

const port = loadPort();
const identityService = new StubIdentityService(loadTokenSigningKey());

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
});
