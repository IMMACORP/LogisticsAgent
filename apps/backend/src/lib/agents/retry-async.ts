/**
 * Retry transient SDK / network failures for logistics runs.
 */
export function isRetryableAgentError(err: unknown): boolean {
  const msg = err instanceof Error ? `${err.name} ${err.message}` : String(err);
  const m = msg.toLowerCase();

  if (
    m.includes('econnreset') ||
    m.includes('etimedout') ||
    m.includes('socket') ||
    m.includes('fetch failed') ||
    m.includes('network') ||
    m.includes('overloaded') ||
    m.includes('rate limit') ||
    m.includes('429') ||
    m.includes('503') ||
    m.includes('502') ||
    m.includes('504')
  ) {
    return true;
  }

  return false;
}

export async function sleep(ms: number): Promise<void> {
  await new Promise((r) => setTimeout(r, ms));
}

export async function runWithRetries<T>(
  fn: () => Promise<T>,
  options: {
    maxAttempts: number;
    baseDelayMs: number;
    isRetryable: (err: unknown) => boolean;
    onAttempt?: (attempt: number, err: unknown) => void;
  },
): Promise<T> {
  let lastErr: unknown;
  for (let attempt = 1; attempt <= options.maxAttempts; attempt += 1) {
    try {
      return await fn();
    } catch (err) {
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
