/**
 * Raw WebSocket gateway — the real-time transport (ADR-005/019: bare `ws`, no
 * framework). It depends on the identity and persistence ports and the domain;
 * nothing depends back on it (transport -> domain). Both ports are injected, never
 * singletons; the gateway never opens the database and never reads the environment.
 *
 * Scope at this step (3.2a): the authenticated handshake (step 2.2) plus the
 * nominal Customer<->Agent message exchange. A `send` frame is parsed, the sender
 * is resolved from the *connection* (never the payload), the message is persisted,
 * and the resulting `MessageEvent` is broadcast to every connection whose account
 * is a participant of that conversation (the sender included — echo). Conversation
 * isolation as *access control* (refusing a non-participant with
 * `Refusal{isolation_denied}`) is step 3.2b; here `findParticipant` only resolves
 * the sender's participant id.
 *
 * Authentication is enforced at the HTTP upgrade: any failure collapses to a
 * neutral HTTP 401 (anti-enumeration, NFR-SEC-04); no `auth_rejected` frame.
 */
import { createServer, type IncomingMessage, type Server } from 'node:http';
import type { Duplex } from 'node:stream';
import { WebSocket, WebSocketServer } from 'ws';

import type { IdentityService } from '../identity/identity-port';
import { deriveSeatRole } from '../identity/seat-role';
import type { ChatRepository } from '../domain/chat-repository';
import type { ConversationId } from '../domain/conversation';
import type { SeatRole, UserAccountId } from '../domain/participant';
import type { MessageEvent, SendMessageCommand } from '../contract/messages';

export interface ConnectionContext {
  readonly userAccountId: UserAccountId;
  readonly seatRole: SeatRole;
}

export interface ChatServerDeps {
  readonly identityService: IdentityService;
  readonly chatRepository: ChatRepository;
}

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

function extractToken(url: string | undefined): string | null {
  if (url === undefined) return null;
  let token: string | null;
  try {
    token = new URL(url, 'http://localhost').searchParams.get('token');
  } catch {
    return null;
  }
  return token === null || token === '' ? null : token;
}

/**
 * Parse and minimally validate a raw client frame against the contract
 * ("parse, don't trust"): only a well-formed `send` command is accepted. Anything
 * else returns null; the caller silently drops the frame (no crash, no broadcast,
 * the connection is kept) — the contract's only Refusal, `isolation_denied`, is 3.2b.
 */
function parseSendCommand(raw: string): SendMessageCommand | null {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return null;
  }
  if (typeof parsed !== 'object' || parsed === null) return null;
  const frame = parsed as Record<string, unknown>;
  const conversationId = frame['conversationId'];
  const body = frame['body'];
  if (frame['type'] !== 'send') return null;
  if (typeof conversationId !== 'string' || conversationId === '') return null;
  if (typeof body !== 'string' || body === '') return null;
  return { type: 'send', conversationId, body };
}

export function createChatServer({ identityService, chatRepository }: ChatServerDeps): Server {
  const httpServer = createServer();
  const wss = new WebSocketServer({ noServer: true });

  // Per-connection identity, bound at the handshake. A connection is not bound to a
  // conversation; membership is resolved per message from the store.
  const connections = new Map<WebSocket, ConnectionContext>();

  function broadcastToConversation(conversationId: ConversationId, event: MessageEvent): void {
    const memberAccountIds = new Set(
      chatRepository.listParticipants(conversationId).map((participant) => participant.userAccountId),
    );
    const payload = JSON.stringify(event);
    for (const [clientWs, clientContext] of connections) {
      if (clientWs.readyState === WebSocket.OPEN && memberAccountIds.has(clientContext.userAccountId)) {
        clientWs.send(payload);
      }
    }
  }

  function handleClientMessage(senderWs: WebSocket, raw: string): void {
    const senderContext = connections.get(senderWs);
    if (senderContext === undefined) return;

    const command = parseSendCommand(raw);
    if (command === null) return;

    // Resolve the sender's participant from the *connection* identity (trust
    // boundary — never the payload). This is resolution, not access control: a
    // non-participant is dropped here, and turns into Refusal{isolation_denied} at 3.2b.
    const sender = chatRepository.findParticipant(command.conversationId, senderContext.userAccountId);
    if (sender === null) return;

    const saved = chatRepository.saveMessage({
      conversationId: command.conversationId,
      senderParticipantId: sender.id,
      body: command.body,
      sentAt: new Date().toISOString(), // server-stamped, never client-supplied
    });

    broadcastToConversation(command.conversationId, {
      type: 'message',
      id: saved.id,
      conversationId: saved.conversationId,
      senderParticipantId: saved.senderParticipantId,
      body: saved.body,
      sentAt: saved.sentAt,
    });
  }

  httpServer.on('upgrade', (request: IncomingMessage, socket: Duplex, head: Buffer) => {
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

        wss.handleUpgrade(request, socket, head, (ws) => {
          try {
            connections.set(ws, context);
            ws.on('message', (data) => handleClientMessage(ws, data.toString()));
            ws.on('error', () => {
              connections.delete(ws);
            });
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
