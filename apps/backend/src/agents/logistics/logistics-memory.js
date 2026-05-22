const logisticsSessions = new Map();
export function getOrCreateLogisticsMemorySession(sessionId, factory) {
    let s = logisticsSessions.get(sessionId);
    if (!s) {
        s = factory(sessionId);
        logisticsSessions.set(sessionId, s);
    }
    return s;
}
export function clearLogisticsMemorySession(sessionId) {
    logisticsSessions.delete(sessionId);
}
