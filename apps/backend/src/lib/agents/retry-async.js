/**
 * Retry transient SDK / network failures for logistics runs.
 */
export function isRetryableAgentError(err) {
    const msg = err instanceof Error ? `${err.name} ${err.message}` : String(err);
    const m = msg.toLowerCase();
    if (m.includes('econnreset') ||
        m.includes('etimedout') ||
        m.includes('socket') ||
        m.includes('fetch failed') ||
        m.includes('network') ||
        m.includes('overloaded') ||
        m.includes('rate limit') ||
        m.includes('429') ||
        m.includes('503') ||
        m.includes('502') ||
        m.includes('504')) {
        return true;
    }
    return false;
}
export async function sleep(ms) {
    await new Promise((r) => setTimeout(r, ms));
}
export async function runWithRetries(fn, options) {
    let lastErr;
    for (let attempt = 1; attempt <= options.maxAttempts; attempt += 1) {
        try {
            return await fn();
        }
        catch (err) {
            lastErr = err;
            options.onAttempt?.(attempt, err);
            const retryable = options.isRetryable(err);
            if (!retryable || attempt >= options.maxAttempts) {
                throw err;
            }
            await sleep(options.baseDelayMs * attempt);
        }
    }
    throw lastErr;
}
