function toolKey(tool) {
    if (tool && typeof tool === 'object' && 'name' in tool) {
        const n = tool.name;
        return typeof n === 'string' ? n : undefined;
    }
    return undefined;
}
function dedupeByName(tools) {
    const seen = new Set();
    const out = [];
    for (const t of tools) {
        const key = toolKey(t) ?? `__anonymous_${out.length}`;
        if (seen.has(key)) {
            continue;
        }
        seen.add(key);
        out.push(t);
    }
    return out;
}
/**
 * Modular tool registration: each channel receives merged tools from every module
 * that lists that channel in `channels`.
 */
export class AgentToolRegistry {
    byChannel = new Map();
    /** Append tools for a channel (used by `registerAgentToolModule`). */
    registerTools(channel, tools) {
        const cur = this.byChannel.get(channel) ?? [];
        this.byChannel.set(channel, dedupeByName([...cur, ...tools]));
    }
    registerAgentToolModule(module) {
        for (const ch of module.channels) {
            this.registerTools(ch, [...module.tools]);
        }
    }
    resolveTools(channel) {
        return [...(this.byChannel.get(channel) ?? [])];
    }
}
export function toolContextFromRun(runContext) {
    return runContext?.context;
}
