import type { MemorySession } from '@openai/agents';

const logisticsSessions = new Map<string, MemorySession>();

export function getOrCreateLogisticsMemorySession(
  sessionId: string,
  factory: (id: string) => MemorySession,
): MemorySession {
  let s = logisticsSessions.get(sessionId);
  if (!s) {
    s = factory(sessionId);
    logisticsSessions.set(sessionId, s);
  }
  return s;
}

export function clearLogisticsMemorySession(sessionId: string): void {
  logisticsSessions.delete(sessionId);
}
