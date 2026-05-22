import { ToolExecutionError } from '../lib/tools/tool-result';

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function readEnvInt(name: string, fallback: number): number {
  const raw = process.env[name];
  if (raw === undefined || raw === '') {
    return fallback;
  }
  const value = Number.parseInt(raw, 10);
  return Number.isFinite(value) && value >= 0 ? value : fallback;
}

function readWebhookUrl(): string | undefined {
  const primary = process.env.SLACK_ESCALATION_WEBHOOK_URL?.trim();
  const fallback = process.env.SLACK_WEBHOOK_URL?.trim();
  return primary || fallback || undefined;
}

export interface SlackWebhookSendBody {
  text: string;
  blocks?: unknown[];
}

export interface SlackWebhookSendResult {
  ok: boolean;
  status: number;
  /** Raw response body (Incoming Webhooks often return plain `ok`) */
  body: string;
}

/**
 * Posts JSON to a Slack Incoming Webhook with exponential backoff retries.
 *
 * Environment:
 * - `SLACK_ESCALATION_WEBHOOK_URL` — preferred URL for escalations
 * - `SLACK_WEBHOOK_URL` — fallback URL
 * - `SLACK_WEBHOOK_MAX_RETRIES` — default `3`
 * - `SLACK_WEBHOOK_RETRY_BASE_MS` — default `500`
 * - `SLACK_WEBHOOK_TIMEOUT_MS` — default `15000`
 */
export class SlackWebhookService {
  async send(body: SlackWebhookSendBody): Promise<SlackWebhookSendResult> {
    const url = readWebhookUrl();
    if (!url) {
      throw new ToolExecutionError(
        'Slack Incoming Webhook URL が未設定です。SLACK_ESCALATION_WEBHOOK_URL または SLACK_WEBHOOK_URL を設定してください。',
        'SLACK_UNAVAILABLE',
      );
    }

    const maxRetries = readEnvInt('SLACK_WEBHOOK_MAX_RETRIES', 3);
    const baseDelayMs = readEnvInt('SLACK_WEBHOOK_RETRY_BASE_MS', 500);
    const timeoutMs = readEnvInt('SLACK_WEBHOOK_TIMEOUT_MS', 15_000);

    let lastError: unknown;

    for (let attempt = 0; attempt <= maxRetries; attempt += 1) {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), timeoutMs);

      try {
        const response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
          signal: controller.signal,
        });

        const responseText = await response.text();
        const okSlackWebhook =
          response.ok &&
          (responseText === 'ok' || responseText.includes('"ok":true'));

        if (okSlackWebhook) {
          return { ok: true, status: response.status, body: responseText };
        }

        const retryable =
          response.status === 429 ||
          response.status === 408 ||
          (response.status >= 500 && response.status <= 599);

        if (!retryable || attempt === maxRetries) {
          throw new ToolExecutionError(
            `Slack Webhook が失敗しました (HTTP ${response.status}): ${responseText.slice(0, 500)}`,
            'SLACK_UNAVAILABLE',
            { status: response.status },
          );
        }

        lastError = new Error(`HTTP ${response.status}: ${responseText}`);
      } catch (error) {
        if (error instanceof ToolExecutionError) {
          throw error;
        }
        lastError = error;
        const isLast = attempt === maxRetries;
        if (isLast) {
          break;
        }
      } finally {
        clearTimeout(timeout);
      }

      const backoff = baseDelayMs * 2 ** attempt;
      await sleep(backoff);
    }

    if (lastError instanceof ToolExecutionError) {
      throw lastError;
    }

    if (lastError instanceof Error) {
      throw new ToolExecutionError(
        `Slack Webhook のリトライが尽きました: ${lastError.message}`,
        'SLACK_UNAVAILABLE',
      );
    }

    throw new ToolExecutionError(
      'Slack Webhook のリトライが尽きました',
      'SLACK_UNAVAILABLE',
    );
  }
}

export const slackWebhookService = new SlackWebhookService();
