/**
 * Public surface of the real-time module — the extraction seam (ADR-003).
 *
 * This is what the module would expose if it were pulled out into a separate
 * service: the message contract, the domain entities, the identity port, and the
 * role seam. The transport (raw `ws` server, step 2) and the persistence port
 * (step 3) will be added behind this same surface, so consumers depend on the
 * module, not on its internals.
 */
export * from './domain/conversation';
export * from './domain/participant';
export * from './domain/message';
export * from './contract/messages';
export * from './identity/identity-port';
export { deriveSeatRole } from './identity/seat-role';
