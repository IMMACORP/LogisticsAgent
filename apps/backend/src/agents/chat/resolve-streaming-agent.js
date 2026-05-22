import { getChannelAgent, getSharedToolRegistry } from '../channel-agents.js';
import { createLogisticsOperationSupportAgent } from '../logistics/logistics-operation-agent.js';
import { createReceptionAgent } from '../reception/reception-agent.js';
let receptionStreamingAgent;
let logisticsStreamingAgent;
export function resolveStreamingAgent(channel) {
    switch (channel) {
        case 'reception':
            receptionStreamingAgent ??= createReceptionAgent(getSharedToolRegistry().resolveTools('reception'));
            return receptionStreamingAgent;
        case 'logistics': {
            logisticsStreamingAgent ??= createLogisticsOperationSupportAgent(getSharedToolRegistry().resolveTools('logistics'));
            return logisticsStreamingAgent;
        }
        default:
            return getChannelAgent(channel);
    }
}
