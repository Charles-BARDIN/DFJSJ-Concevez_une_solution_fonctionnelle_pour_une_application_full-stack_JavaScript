/**
 * Raw WebSocket gateway — the real-time transport (ADR-005/019: bare `ws`, no
 * framework). It depends on the identity port and the domain; nothing depends back
 * on it (transport -> domain). The identity service is injected, never a singleton.
 *
 * Scope of this step (2.2): the *authenticated handshake only*. The gateway
 * accepts or refuses a connection and binds the verified identity to it. There is
 * deliberately no message routing, no broadcast, no persistence and no isolation
 * here — those are step 3.
 *
 * Authentication is enforced at the HTTP upgrade: any failure (missing/empty token,
 * verification failure, or an unexpected exception) collapses to a single neutral
 * HTTP 401. No WebSocket is ever opened for an unauthenticated client, and the
 * failing check is never revealed (anti-enumeration, NFR-SEC-04). No `auth_rejected`
 * frame is ever emitted.
 */
import { createServer, type IncomingMessage, type Server } from 'node:http';
import type { Duplex } from 'node:stream';
import { WebSocketServer, type WebSocket } from 'ws';

import type { IdentityService } from '../identity/identity-port';
import { deriveSeatRole } from '../identity/seat-role';
import type { SeatRole, UserAccountId } from '../domain/participant';

/**
 * Identity bound to a connection at the handshake — derived from the token, never
 * asserted by the client. Kept out-of-band (a Map) rather than monkey-patched onto
 * the socket, so there is no `any` augmentation of the `ws` type.
 */
export interface ConnectionContext {
  readonly userAccountId: UserAccountId;
  readonly seatRole: SeatRole;
}

export interface ChatServerDeps {
  readonly identityService: IdentityService;
}

/**
 * Reply with a neutral 401 and tear the socket down. Idempotent and never throws:
 * a second call (e.g. a verify-failure rejection racing a socket 'error') finds the
 * socket no longer writable, skips the write, and `socket.destroy()` is a no-op on
 * an already-destroyed socket.
 */
function rejectUnauthorized(socket: Duplex): void {
  try {
    if (socket.writable) {
      socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n');
    }
  } catch {
    // The socket may already be gone; destroying it is enough.
  } finally {
    socket.destroy();
  }
}

/** Extract a non-empty `token` query parameter, or null. */
function extractToken(url: string | undefined): string | null {
  if (url === undefined) return null;
  let token: string | null;
  try {
    // request.url is path-only; resolve against a dummy origin to read the query.
    token = new URL(url, 'http://localhost').searchParams.get('token');
  } catch {
    return null;
  }
  return token === null || token === '' ? null : token;
}

/**
 * Build the chat server (an `http.Server` with the upgrade handler wired). It is
 * NOT started — the caller decides when to `.listen()`.
 */
export function createChatServer({ identityService }: ChatServerDeps): Server {
  const httpServer = createServer();
  const wss = new WebSocketServer({ noServer: true });

  // Per-connection identity. Bound here, read by step 3 (routing / isolation).
  const connections = new Map<WebSocket, ConnectionContext>();

  httpServer.on('upgrade', (request: IncomingMessage, socket: Duplex, head: Buffer) => {
    // Guard the raw socket *first*: an EPIPE/ECONNRESET during rejection or upgrade
    // must never surface as an uncaught exception.
    socket.on('error', () => {});

    void (async () => {
      try {
        const token = extractToken(request.url);
        if (token === null) {
          rejectUnauthorized(socket);
          return;
        }

        const result = await identityService.verify(token);
        if (!result.ok) {
          rejectUnauthorized(socket);
          return;
        }

        const context: ConnectionContext = {
          userAccountId: result.identity.userAccountId,
          seatRole: deriveSeatRole(result.identity.accountRole),
        };

        // The outer try also covers handleUpgrade itself: a synchronous throw here
        // (socket still not upgraded) lands in the catch below → neutral 401.
        wss.handleUpgrade(request, socket, head, (ws) => {
          // The socket is now upgraded — a 401 is no longer possible. If installing
          // the handlers fails, tear the WebSocket down instead of abandoning it.
          try {
            connections.set(ws, context);
            ws.on('error', () => {});
            ws.on('close', () => {
              connections.delete(ws);
            });
            wss.emit('connection', ws, request);
          } catch {
            connections.delete(ws);
            ws.terminate();
          }
        });
      } catch {
        rejectUnauthorized(socket);
      }
    })();
  });

  return httpServer;
}
