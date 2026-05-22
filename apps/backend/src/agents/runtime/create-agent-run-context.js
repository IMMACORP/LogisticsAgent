import { randomUUID } from 'node:crypto';
/**
 * Builds the object passed to `run(..., { context })` for a single HTTP/agent request.
 * Honors `metadata.traceId` and `metadata.sessionId` when strings are provided.
 */
export function createAgentRunContext(params) {
    const traceFromMeta = params.metadata?.traceId;
    const sessionFromMeta = params.metadata?.sessionId;
    const traceId = typeof traceFromMeta === 'string' && traceFromMeta.length > 0
        ? traceFromMeta
        : randomUUID();
    const sessionId = typeof sessionFromMeta === 'string' && sessionFromMeta.length > 0
        ? sessionFromMeta
        : randomUUID();
    return {
        sessionId,
        userId: params.userId,
        channel: params.channel,
        traceId,
        agentName: params.agentName,
        metadata: params.metadata,
    };
}
