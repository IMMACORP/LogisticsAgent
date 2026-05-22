const receptionSessions = new Map();
export function getOrCreateReceptionMemorySession(sessionId, factory) {
    let s = receptionSessions.get(sessionId);
    if (!s) {
        s = factory(sessionId);
        receptionSessions.set(sessionId, s);
    }
    return s;
}
/** Test hook / admin: drop in-process memory for a thread. */
export function clearReceptionMemorySession(sessionId) {
    receptionSessions.delete(sessionId);
}
