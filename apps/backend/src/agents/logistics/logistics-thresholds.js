function readEnvInt(name, fallback) {
    const raw = process.env[name]?.trim();
    if (!raw) {
        return fallback;
    }
    const n = Number.parseInt(raw, 10);
    return Number.isFinite(n) && n > 0 ? n : fallback;
}
function readEnvFloat(name, fallback) {
    const raw = process.env[name]?.trim();
    if (!raw) {
        return fallback;
    }
    const n = Number(raw);
    return Number.isFinite(n) ? n : fallback;
}
/** Max SDK `run()` attempts including the first try. */
export function logisticsRunMaxAttempts() {
    return readEnvInt('INQUIRY_LOGISTICS_RUN_MAX_ATTEMPTS', 3);
}
/** Base delay in ms before retry (linear backoff: attempt * delay). */
export function logisticsRetryBaseDelayMs() {
    return readEnvInt('INQUIRY_LOGISTICS_RETRY_BASE_DELAY_MS', 800);
}
/** At or below this confidence we send a programmatic Slack escalation (in addition to tool use). */
export function logisticsEscalateMaxConfidence() {
    const v = readEnvFloat('INQUIRY_LOGISTICS_ESCALATE_MAX_CONFIDENCE', 0.4);
    return Math.min(1, Math.max(0, v));
}
