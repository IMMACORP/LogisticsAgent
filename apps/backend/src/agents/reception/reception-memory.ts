import type { MemorySession } from '@openai/agents';

const receptionSessions = new Map<string, MemorySession>();

export function getOrCreateReceptionMemorySession(
  sessionId: string,
  factory: (id: string) => MemorySession,
): MemorySession {
  let s = receptionSessions.get(sessionId);
  if (!s) {
    s = factory(sessionId);
    receptionSessions.set(sessionId, s);
  }
  return s;
}

/** Test hook / admin: drop in-process memory for a thread. */
export function clearReceptionMemorySession(sessionId: string): void {
  receptionSessions.delete(sessionId);
}
