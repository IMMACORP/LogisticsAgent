import { getApiBaseUrl } from "@/lib/api/get-api-base-url";
import { parseSseJson, parseSseStream } from "@/lib/api/parse-sse";

export interface ChatStreamMeta {
  traceId: string;
  sessionId: string;
  conversationId: string;
  channel: string;
  agentName: string;
}

export interface ChatStreamCallbacks {
  onMeta?: (meta: ChatStreamMeta) => void;
  onDelta?: (text: string) => void;
  onAgentUpdate?: (agentName: string) => void;
  onDone?: (payload: {
    message: string;
    traceId: string;
    sessionId: string;
    conversationId: string;
  }) => void;
  onError?: (payload: {
    code: string;
    message: string;
    traceId: string;
    recoverable?: boolean;
  }) => void;
}

export interface StreamChatOptions {
  userId: string;
  channel: "logistics";
  message: string;
  sessionId?: string;
  conversationId?: string;
  traceId?: string;
  signal?: AbortSignal;
  callbacks: ChatStreamCallbacks;
  maxAttempts?: number;
  retryDelayMs?: number;
}

export class ChatStreamClientError extends Error {
  constructor(
    message: string,
    readonly code: string,
    readonly recoverable: boolean,
    readonly traceId?: string,
  ) {
    super(message);
    this.name = "ChatStreamClientError";
  }
}

function isRetryableFetchError(err: unknown): boolean {
  if (err instanceof ChatStreamClientError) {
    return err.recoverable;
  }
  if (err instanceof DOMException && err.name === "AbortError") {
    return false;
  }
  return true;
}

async function streamChatOnce(
  options: StreamChatOptions,
): Promise<void> {
  const apiBase = getApiBaseUrl();
  if (!apiBase) {
    throw new ChatStreamClientError(
      "NEXT_PUBLIC_API_BASE_URL is not configured",
      "CONFIG",
      false,
    );
  }

  const response = await fetch(`${apiBase}/chat/stream`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "text/event-stream",
    },
    body: JSON.stringify({
      userId: options.userId,
      channel: options.channel,
      message: options.message,
      sessionId: options.sessionId,
      conversationId: options.conversationId,
      traceId: options.traceId,
    }),
    signal: options.signal,
    cache: "no-store",
  });

  if (!response.ok) {
    let message = `HTTP ${response.status}`;
    try {
      const json = (await response.json()) as { message?: string; error?: unknown };
      if (json.message) {
        message = json.message;
      }
    } catch {
      // ignore
    }
    throw new ChatStreamClientError(
      message,
      "HTTP_ERROR",
      response.status >= 500 || response.status === 429,
    );
  }

  if (!response.body) {
    throw new ChatStreamClientError("Empty response body", "EMPTY_BODY", true);
  }

  let sawDone = false;

  for await (const chunk of parseSseStream(response.body)) {
    if (options.signal?.aborted) {
      return;
    }

    if (chunk.event === "meta") {
      const meta = parseSseJson<ChatStreamMeta>(chunk.data);
      if (meta) {
        options.callbacks.onMeta?.(meta);
      }
      continue;
    }

    if (chunk.event === "delta") {
      const delta = parseSseJson<{ text?: string }>(chunk.data);
      if (delta?.text) {
        options.callbacks.onDelta?.(delta.text);
      }
      continue;
    }

    if (chunk.event === "agent_update") {
      const update = parseSseJson<{ agentName?: string }>(chunk.data);
      if (update?.agentName) {
        options.callbacks.onAgentUpdate?.(update.agentName);
      }
      continue;
    }

    if (chunk.event === "done") {
      sawDone = true;
      const done = parseSseJson<{
        message?: string;
        traceId?: string;
        sessionId?: string;
        conversationId?: string;
      }>(chunk.data);
      if (done?.message != null) {
        options.callbacks.onDone?.({
          message: done.message,
          traceId: done.traceId ?? options.traceId ?? "",
          sessionId: done.sessionId ?? options.sessionId ?? "",
          conversationId: done.conversationId ?? options.conversationId ?? "",
        });
      }
      continue;
    }

    if (chunk.event === "error") {
      const errPayload = parseSseJson<{
        code?: string;
        message?: string;
        traceId?: string;
        recoverable?: boolean;
      }>(chunk.data);
      options.callbacks.onError?.({
        code: errPayload?.code ?? "STREAM_ERROR",
        message: errPayload?.message ?? "Stream error",
        traceId: errPayload?.traceId ?? options.traceId ?? "",
        recoverable: errPayload?.recoverable,
      });
      throw new ChatStreamClientError(
        errPayload?.message ?? "Stream error",
        errPayload?.code ?? "STREAM_ERROR",
        errPayload?.recoverable ?? false,
        errPayload?.traceId,
      );
    }
  }

  if (!sawDone && !options.signal?.aborted) {
    throw new ChatStreamClientError(
      "Stream ended without a done event",
      "INCOMPLETE_STREAM",
      true,
    );
  }
}

/**
 * POST /chat/stream with retries for transient network failures (before SSE starts).
 */
export async function streamChat(options: StreamChatOptions): Promise<void> {
  const maxAttempts = options.maxAttempts ?? 3;
  const retryDelayMs = options.retryDelayMs ?? 600;
  let lastError: unknown;

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      await streamChatOnce(options);
      return;
    } catch (err) {
      lastError = err;
      if (
        options.signal?.aborted ||
        !isRetryableFetchError(err) ||
        attempt >= maxAttempts
      ) {
        throw err;
      }
      await new Promise((r) => setTimeout(r, retryDelayMs * attempt));
    }
  }

  throw lastError;
}
