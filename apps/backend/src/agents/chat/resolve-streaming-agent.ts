import type { Agent } from '@openai/agents';
import type { AgentChannel, AgentRunContext } from '@inquiry-agent/shared-types';

import { getChannelAgent, getSharedToolRegistry } from '../channel-agents.js';
import { createLogisticsOperationSupportAgent } from '../logistics/logistics-operation-agent.js';
import { createReceptionAgent } from '../reception/reception-agent.js';

let receptionStreamingAgent: Agent<AgentRunContext> | undefined;
let logisticsStreamingAgent: Agent<AgentRunContext> | undefined;

export function resolveStreamingAgent(channel: AgentChannel): Agent<AgentRunContext> {
  switch (channel) {
    case 'reception':
      receptionStreamingAgent ??= createReceptionAgent(
        getSharedToolRegistry().resolveTools('reception'),
      );
      return receptionStreamingAgent;
    case 'logistics': {
      logisticsStreamingAgent ??= createLogisticsOperationSupportAgent(
        getSharedToolRegistry().resolveTools('logistics'),
      );
      return logisticsStreamingAgent;
    }
    default:
      return getChannelAgent(channel);
  }
}
