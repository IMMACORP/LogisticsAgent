import { getChannelAgent } from './channel-agents.js';
import { runLogisticsOperationAgentTurn } from './logistics/logistics-runner.js';
import { runReceptionAgentTurn } from './reception/reception-runner.js';
import { createAgentRunContext } from './runtime/create-agent-run-context.js';
import { formatFinalOutputMessage } from './runtime/format-final-output.js';
import { getDefaultOpenAIAgentsRuntime } from './runtime/openai-agents-runtime.js';
import { assertOpenAIKeyPresent, configureOpenAIAgentsSdk } from './runtime/sdk-config.js';
import { structuredLog } from './runtime/structured-log.js';
export async function runAgentWithOpenAISdk(request) {
    assertOpenAIKeyPresent();
    configureOpenAIAgentsSdk();
    if (request.channel === 'reception') {
        return runReceptionAgentTurn(request);
    }
    if (request.channel === 'logistics') {
        return runLogisticsOperationAgentTurn(request);
    }
    const agent = getChannelAgent(request.channel);
    const context = createAgentRunContext({
        userId: request.userId,
        channel: request.channel,
        agentName: agent.name,
        metadata: request.metadata,
    });
    const runtime = getDefaultOpenAIAgentsRuntime();
    try {
        const { finalOutput, traceId } = await runtime.run({
            agent,
            input: request.prompt,
            context,
        });
        return {
            success: true,
            message: formatFinalOutputMessage(finalOutput),
            details: {
                traceId,
                channel: request.channel,
                sessionId: context.sessionId,
                runtime: 'openai-agents-sdk',
            },
        };
    }
    catch (err) {
        structuredLog('error', 'agent.http.failed', {
            traceId: context.traceId,
            channel: request.channel,
            error: err instanceof Error ? err.message : String(err),
        });
        return {
            success: false,
            message: 'Agent run failed. See server logs for details.',
            details: {
                traceId: context.traceId,
                channel: request.channel,
                sessionId: context.sessionId,
                runtime: 'openai-agents-sdk',
            },
        };
    }
}
