import { run } from '@openai/agents';
import { structuredLog } from './structured-log.js';
/**
 * Default runtime: delegates to OpenAI Agents SDK `run()` with structured logging
 * and per-request `context` (see SDK context guide).
 */
export class OpenAIAgentsRuntime {
    async run(input) {
        const { agent, context } = input;
        structuredLog('info', 'agent.run.start', {
            traceId: context.traceId,
            channel: context.channel,
            agent: agent.name,
            sessionId: context.sessionId,
            userId: context.userId,
        });
        const started = Date.now();
        try {
            const result = await run(agent, input.input, {
                context,
                signal: input.signal,
                ...(input.session ? { session: input.session } : {}),
                ...(typeof input.maxTurns === 'number' ? { maxTurns: input.maxTurns } : {}),
            });
            structuredLog('info', 'agent.run.complete', {
                traceId: context.traceId,
                channel: context.channel,
                agent: agent.name,
                durationMs: Date.now() - started,
            });
            return { finalOutput: result.finalOutput, traceId: context.traceId };
        }
        catch (err) {
            structuredLog('error', 'agent.run.failed', {
                traceId: context.traceId,
                channel: context.channel,
                agent: agent.name,
                durationMs: Date.now() - started,
                error: err instanceof Error ? err.message : String(err),
            });
            throw err;
        }
    }
}
let defaultRuntime;
export function getDefaultOpenAIAgentsRuntime() {
    defaultRuntime ??= new OpenAIAgentsRuntime();
    return defaultRuntime;
}
