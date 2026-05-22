import { MemorySession } from '@openai/agents';
const sessions = new Map();
function key(channel, sessionId) {
    return `${channel}:${sessionId}`;
}
export function getOrCreateChatMemorySession(channel, sessionId) {
    const k = key(channel, sessionId);
    let s = sessions.get(k);
    if (!s) {
        s = new MemorySession({ sessionId });
        sessions.set(k, s);
    }
    return s;
}
export function clearChatMemorySession(channel, sessionId) {
    sessions.delete(key(channel, sessionId));
}
