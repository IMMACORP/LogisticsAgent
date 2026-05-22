import { Agent } from '@openai/agents';
import { resolveAgentsModel } from './sdk-config.js';
/**
 * Base factory for channel specialists: shared shape for name, instructions, tools, model.
 */
export function createDomainAgent(options) {
    const model = options.model ?? resolveAgentsModel();
    return new Agent({
        name: options.name,
        instructions: options.instructions,
        tools: options.tools,
        ...(model ? { model } : {}),
    });
}
