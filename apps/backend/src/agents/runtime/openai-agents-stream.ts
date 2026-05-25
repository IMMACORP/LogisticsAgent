import { run, type Agent } from '@openai/agents';
import type { AgentRunContext } from '@inquiry-agent/shared-types';

import type { AgentSession } from './agent-runtime.js';
import { configureOpenAIAgentsSdk } from './sdk-config.js';
import { structuredLog } from './structured-log.js';
import {
  channelUsesStructuredDialogueOutput,
  formatFinalOutputMessage,
} from './format-final-output.js';

export type StreamEmit = (event: string, data: unknown) => void | Promise<void>;

export interface StreamAgentRunInput {
  agent: Agent<AgentRunContext>;
  input: string;
  context: AgentRunContext;
  session: AgentSession;
  signal?: AbortSignal;
  emit: StreamEmit;
  maxTurns?: number;
}

export interface StreamAgentRunOutput {
  finalOutput: unknown;
  finalMessage: string;
  traceId: string;
}

function extractTextDelta(event: unknown): string | null {
  if (!event || typeof event !== 'object') {
    return null;
  }
  const e = event as { type?: string; data?: { type?: string; delta?: string } };
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
export async function streamAgentRun(input: StreamAgentRunInput): Promise<StreamAgentRunOutput> {
  const { agent, context, emit } = input;
  configureOpenAIAgentsSdk();

  structuredLog('info', 'agent.stream.start', {
    traceId: context.traceId,
    channel: context.channel,
    agent: agent.name,
    sessionId: context.sessionId,
  });

  const suppressJsonDeltas = channelUsesStructuredDialogueOutput(context.channel);
  const started = Date.now();
  const streamResult = await run(agent as Agent<AgentRunContext>, input.input, {
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
    if (delta && !suppressJsonDeltas) {
      await emit('delta', { text: delta });
      continue;
    }

    if (event && typeof event === 'object' && 'type' in event) {
      const t = (event as { type: string }).type;
      if (t === 'agent_updated_stream_event') {
        const name = (event as { agent?: { name?: string } }).agent?.name;
        if (name) {
          await emit('agent_update', { agentName: name });
        }
      } else if (t === 'run_item_stream_event') {
        const name = (event as { name?: string; item?: unknown }).name;
        await emit('tool', { name, item: (event as { item?: unknown }).item });
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
