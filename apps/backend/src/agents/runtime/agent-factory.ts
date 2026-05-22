import { Agent, type Tool } from '@openai/agents';
import type { AgentRunContext } from '@inquiry-agent/shared-types';

import { resolveAgentsModel } from './sdk-config.js';

export interface CreateDomainAgentOptions {
  name: string;
  instructions: string;
  tools: unknown[];
  /** Defaults to `INQUIRY_AGENTS_MODEL` or SDK default when unset. */
  model?: string;
}

/**
 * Base factory for channel specialists: shared shape for name, instructions, tools, model.
 */
export function createDomainAgent(options: CreateDomainAgentOptions): Agent<AgentRunContext> {
  const model = options.model ?? resolveAgentsModel();

  return new Agent<AgentRunContext>({
    name: options.name,
    instructions: options.instructions,
    tools: options.tools as Tool<AgentRunContext>[],
    ...(model ? { model } : {}),
  });
}
