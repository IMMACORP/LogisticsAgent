import { run } from '@openai/agents';
import { structuredLog } from './structured-log.js';
import { formatFinalOutputMessage } from './format-final-output.js';
function extractTextDelta(event) {
    if (!event || typeof event !== 'object') {
        return null;
    }
    const e = event;
    if (e.type !== 'raw_model_stream_event') {
        return null;
    }
    const data = e.data;
    if (!data || typeof data !== 'object') {
        return null;
    }
    if (data.type === 'output_text_delta' && typeof data.delta === 'string') {
        return data.delta;
    }
    return null;
}
/**
 * Runs an agent with `{ stream: true }` and forwards text deltas + lifecycle events to `emit`.
 */
export async function streamAgentRun(input) {
    const { agent, context, emit } = input;
    structuredLog('info', 'agent.stream.start', {
        traceId: context.traceId,
        channel: context.channel,
        agent: agent.name,
        sessionId: context.sessionId,
    });
    const started = Date.now();
    const streamResult = await run(agent, input.input, {
        context,
        session: input.session,
        signal: input.signal,
        stream: true,
        ...(typeof input.maxTurns === 'number' ? { maxTurns: input.maxTurns } : {}),
    });
    for await (const event of streamResult) {
        if (input.signal?.aborted) {
            break;
        }
        const delta = extractTextDelta(event);
        if (delta) {
            await emit('delta', { text: delta });
            continue;
        }
        if (event && typeof event === 'object' && 'type' in event) {
            const t = event.type;
            if (t === 'agent_updated_stream_event') {
                const name = event.agent?.name;
                if (name) {
                    await emit('agent_update', { agentName: name });
                }
            }
            else if (t === 'run_item_stream_event') {
                const name = event.name;
                await emit('tool', { name, item: event.item });
            }
        }
    }
    await streamResult.completed;
    const finalMessage = formatFinalOutputMessage(streamResult.finalOutput);
    structuredLog('info', 'agent.stream.complete', {
        traceId: context.traceId,
        channel: context.channel,
        agent: agent.name,
        durationMs: Date.now() - started,
    });
    return {
        finalOutput: streamResult.finalOutput,
        finalMessage,
        traceId: context.traceId,
    };
}
