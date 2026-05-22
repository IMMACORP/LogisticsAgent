import { logisticsOperationSupportAgentTools } from '../logistics/logistics-operation-tools.js';
import { knowledgeAgentTools } from '../../tools/knowledge/index.js';
import { slackAgentTools } from '../../tools/slack/index.js';

import type { AgentToolRegistry } from './agent-tool-registry.js';

/**
 * Declarative modules: add a new `{ id, channels, tools }` entry to extend agents.
 */
export function registerDefaultAgentToolModules(registry: AgentToolRegistry): void {
  registry.registerAgentToolModule({
    id: 'knowledge-base',
    channels: ['reception', 'hr', 'it', 'accounting'],
    tools: knowledgeAgentTools,
  });

  registry.registerAgentToolModule({
    id: 'slack-escalation',
    channels: ['reception', 'hr', 'it', 'accounting'],
    tools: slackAgentTools,
  });

  registry.registerAgentToolModule({
    id: 'logistics-operation-support',
    channels: ['logistics'],
    tools: logisticsOperationSupportAgentTools,
  });
}
