import { MemorySession } from '@openai/agents';
import type { AgentChannel } from '@inquiry-agent/shared-types';

const sessions = new Map<string, MemorySession>();

function key(channel: AgentChannel, sessionId: string): string {
  return `${channel}:${sessionId}`;
}

export function getOrCreateChatMemorySession(
  channel: AgentChannel,
  sessionId: string,
): MemorySession {
  const k = key(channel, sessionId);
  let s = sessions.get(k);
  if (!s) {
    s = new MemorySession({ sessionId });
    sessions.set(k, s);
  }
  return s;
}

export function clearChatMemorySession(channel: AgentChannel, sessionId: string): void {
  sessions.delete(key(channel, sessionId));
}
