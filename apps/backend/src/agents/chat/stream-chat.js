import { conversationService } from '../../services/conversation.service.js';
import { assertOpenAIKeyPresent, configureOpenAIAgentsSdk, isOpenAIAgentsSdkEnabled, } from '../runtime/sdk-config.js';
import { createAgentRunContext } from '../runtime/create-agent-run-context.js';
import { streamAgentRun } from '../runtime/openai-agents-stream.js';
import { structuredLog } from '../runtime/structured-log.js';
import { toUserFacingOpenAIError } from '../../lib/openai/user-facing-errors.js';
import { getOrCreateChatMemorySession } from './chat-session-store.js';
import { resolveStreamingAgent } from './resolve-streaming-agent.js';
export class ChatStreamError extends Error {
    code;
    traceId;
    recoverable;
    constructor(code, message, traceId, recoverable = false) {
        super(message);
        this.code = code;
        this.traceId = traceId;
        this.recoverable = recoverable;
        this.name = 'ChatStreamError';
    }
}
/**
 * Orchestrates SSE chat: persistence, SDK MemorySession, and streamed agent run.
 */
export async function runChatStream(options) {
    if (!isOpenAIAgentsSdkEnabled()) {
        throw new ChatStreamError('SDK_DISABLED', 'Set INQUIRY_USE_AGENTS_SDK=true to use chat streaming', options.request.traceId ?? 'unknown', false);
    }
    assertOpenAIKeyPresent();
    configureOpenAIAgentsSdk();
    const agent = resolveStreamingAgent(options.request.channel);
    const context = createAgentRunContext({
        userId: options.request.userId,
        channel: options.request.channel,
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
        channel: options.request.channel,
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
    const session = getOrCreateChatMemorySession(options.request.channel, context.sessionId);
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
                ...(result.finalOutput != null &&
                    typeof result.finalOutput === 'object' &&
                    !Array.isArray(result.finalOutput)
                    ? { structuredOutput: result.finalOutput }
                    : {}),
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
    }
    catch (err) {
        const raw = err instanceof Error ? err.message : String(err);
        const facing = toUserFacingOpenAIError(raw);
        structuredLog('error', 'chat.stream.failed', {
            traceId: context.traceId,
            conversationId,
            channel: context.channel,
            error: facing.message,
            errorCode: facing.code,
        });
        await conversationService.appendMessage({
            conversationId,
            role: 'system',
            content: `[stream error] ${facing.message}`,
            traceId: context.traceId,
            metadata: { error: true, errorCode: facing.code },
        });
        throw err instanceof ChatStreamError
            ? err
            : new ChatStreamError(facing.code, facing.message, context.traceId, facing.recoverable);
    }
}
