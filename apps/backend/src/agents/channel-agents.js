import { buildDomainInstructions } from './domain-instructions.js';
import { createDomainAgent } from './runtime/agent-factory.js';
import { AgentToolRegistry } from './runtime/agent-tool-registry.js';
import { registerDefaultAgentToolModules } from './runtime/register-default-agent-tool-modules.js';
function buildRegistry() {
    const registry = new AgentToolRegistry();
    registerDefaultAgentToolModules(registry);
    return registry;
}
let sharedRegistry;
/** Process-wide tool registry (shared by reception + channel specialists). */
export function getSharedToolRegistry() {
    sharedRegistry ??= buildRegistry();
    return sharedRegistry;
}
function agentNameForChannel(channel) {
    switch (channel) {
        case 'reception':
            return 'reception-agent';
        case 'hr':
            return 'hr-agent';
        case 'it':
            return 'it-agent';
        case 'logistics':
            return 'logistics-agent';
        default: {
            const _exhaustive = channel;
            return _exhaustive;
        }
    }
}
const registry = getSharedToolRegistry();
const agents = {
    reception: createDomainAgent({
        name: agentNameForChannel('reception'),
        instructions: buildDomainInstructions('reception'),
        tools: registry.resolveTools('reception'),
    }),
    hr: createDomainAgent({
        name: agentNameForChannel('hr'),
        instructions: buildDomainInstructions('hr'),
        tools: registry.resolveTools('hr'),
    }),
    it: createDomainAgent({
        name: agentNameForChannel('it'),
        instructions: buildDomainInstructions('it'),
        tools: registry.resolveTools('it'),
    }),
    logistics: createDomainAgent({
        name: agentNameForChannel('logistics'),
        instructions: buildDomainInstructions('logistics'),
        tools: registry.resolveTools('logistics'),
    }),
};
export function getChannelAgent(channel) {
    return agents[channel];
}
