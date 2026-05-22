import type { AgentChannel } from '@inquiry-agent/shared-types';

import type { ChatStreamRequest } from '../../schemas/chat/chat-stream.schemas.js';
import { conversationService } from '../../services/conversation.service.js';
import {
  assertOpenAIKeyPresent,
  configureOpenAIAgentsSdk,
  isOpenAIAgentsSdkEnabled,
} from '../runtime/sdk-config.js';
import { createAgentRunContext } from '../runtime/create-agent-run-context.js';
import { streamAgentRun } from '../runtime/openai-agents-stream.js';
import { structuredLog } from '../runtime/structured-log.js';
import { getOrCreateChatMemorySession } from './chat-session-store.js';
import { resolveStreamingAgent } from './resolve-streaming-agent.js';

export class ChatStreamError extends Error {
  constructor(
    readonly code: string,
    message: string,
    readonly traceId: string,
    readonly recoverable = false,
  ) {
    super(message);
    this.name = 'ChatStreamError';
  }
}

export type ChatStreamSend = (event: string, data: unknown) => void | Promise<void>;

export interface RunChatStreamOptions {
  request: ChatStreamRequest;
  send: ChatStreamSend;
  signal?: AbortSignal;
}

/**
 * Orchestrates SSE chat: persistence, SDK MemorySession, and streamed agent run.
 */
export async function runChatStream(options: RunChatStreamOptions): Promise<void> {
  if (!isOpenAIAgentsSdkEnabled()) {
    throw new ChatStreamError(
      'SDK_DISABLED',
      'Set INQUIRY_USE_AGENTS_SDK=true to use chat streaming',
      options.request.traceId ?? 'unknown',
      false,
    );
  }

  assertOpenAIKeyPresent();
  configureOpenAIAgentsSdk();

  const agent = resolveStreamingAgent(options.request.channel as AgentChannel);

  const context = createAgentRunContext({
    userId: options.request.userId,
    channel: options.request.channel as AgentChannel,
    agentName: agent.name,
    metadata: {
      ...options.request.metadata,
      traceId: options.request.traceId,
      sessionId: options.request.sessionId,
      conversationId: options.request.conversationId,
    },
  });

  const { conversationId } = await conversationService.ensureConversation({
    userId: options.request.userId,
    channel: options.request.channel as AgentChannel,
    conversationId: options.request.conversationId,
    sessionId: context.sessionId,
    traceId: context.traceId,
  });

  await options.send('meta', {
    traceId: context.traceId,
    sessionId: context.sessionId,
    conversationId,
    channel: context.channel,
    agentName: agent.name,
  });

  await conversationService.appendMessage({
    conversationId,
    userId: options.request.userId,
    role: 'user',
    content: options.request.message,
    agentType: context.channel,
    traceId: context.traceId,
  });

  const session = getOrCreateChatMemorySession(
    options.request.channel as AgentChannel,
    context.sessionId,
  );

  try {
    const result = await streamAgentRun({
      agent,
      input: options.request.message,
      context,
      session,
      signal: options.signal,
      emit: options.send,
      maxTurns: options.request.channel === 'reception' ? 14 : 18,
    });

    await conversationService.appendMessage({
      conversationId,
      role: 'assistant',
      content: result.finalMessage,
      agentType: agent.name,
      traceId: context.traceId,
      metadata: {
        streamed: true,
      },
    });

    await options.send('done', {
      traceId: context.traceId,
      sessionId: context.sessionId,
      conversationId,
      message: result.finalMessage,
      success: true,
      details: {
        channel: context.channel,
        runtime: 'openai-agents-sdk-stream',
      },
    });
  } catch (err) {
    const raw = err instanceof Error ? err.message : String(err);
    const isInvalidApiKey =
      raw.includes('401') ||
      raw.includes('Incorrect API key') ||
      raw.includes('invalid_api_key');
    const message = isInvalidApiKey
      ? 'OpenAI auth failed (401). For sk-proj-* keys add OPENAI_PROJECT_ID=proj_... to apps/backend/.env (same as your other project), then restart. Verify with: npm run check:openai'
      : raw;
    structuredLog('error', 'chat.stream.failed', {
      traceId: context.traceId,
      conversationId,
      channel: context.channel,
      error: message,
    });

    await conversationService.appendMessage({
      conversationId,
      role: 'system',
      content: `[stream error] ${message}`,
      traceId: context.traceId,
      metadata: { error: true },
    });

    throw err instanceof ChatStreamError
      ? err
      : new ChatStreamError(
          isInvalidApiKey ? 'OPENAI_AUTH' : 'AGENT_STREAM_FAILED',
          message,
          context.traceId,
          !isInvalidApiKey,
        );
  }
}
