/**
 * Demo seed — dev/demo tooling only, never on the nominal server path (guarded by
 * POC_DEMO_SEED in server.ts). It reuses the existing `ChatRepository` and the test
 * token signer to set up a demo conversation with two participants and to sign their
 * test tokens. The signing key is *received as a parameter* (passed by server.ts) —
 * this module never reads the environment. It does not print; server.ts owns the output.
 */
import type { ChatRepository } from './realtime/domain/chat-repository';
import type { ConversationId } from './realtime/domain/conversation';
import { signTestToken } from './realtime/identity/token';

export interface DemoSeed {
  readonly conversationId: ConversationId;
  readonly customerToken: string;
  readonly agentToken: string;
}

export function seedDemo(chatRepository: ChatRepository, signingKey: string): DemoSeed {
  const conversationId = chatRepository.createConversation({
    status: 'open',
    createdAt: new Date().toISOString(),
  });
  chatRepository.addParticipant(conversationId, 'u-customer', 'customer');
  chatRepository.addParticipant(conversationId, 'u-agent', 'agent');

  return {
    conversationId,
    customerToken: signTestToken({ userAccountId: 'u-customer', accountRole: 'client' }, signingKey),
    agentToken: signTestToken({ userAccountId: 'u-agent', accountRole: 'support_agent' }, signingKey),
  };
}
