import type { AgentChannel, AgentRunContext } from '@inquiry-agent/shared-types';

function toolKey(tool: unknown): string | undefined {
  if (tool && typeof tool === 'object' && 'name' in tool) {
    const n = (tool as { name: unknown }).name;
    return typeof n === 'string' ? n : undefined;
  }
  return undefined;
}

function dedupeByName<T>(tools: T[]): T[] {
  const seen = new Set<string>();
  const out: T[] = [];
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
  private readonly byChannel = new Map<AgentChannel, unknown[]>();

  /** Append tools for a channel (used by `registerAgentToolModule`). */
  registerTools(channel: AgentChannel, tools: unknown[]): void {
    const cur = this.byChannel.get(channel) ?? [];
    this.byChannel.set(channel, dedupeByName([...cur, ...tools]));
  }

  registerAgentToolModule(module: {
    id: string;
    channels: readonly AgentChannel[];
    tools: readonly unknown[];
  }): void {
    for (const ch of module.channels) {
      this.registerTools(ch, [...module.tools]);
    }
  }

  resolveTools(channel: AgentChannel): unknown[] {
    return [...(this.byChannel.get(channel) ?? [])];
  }
}

export function toolContextFromRun(
  runContext?: { context?: AgentRunContext },
): AgentRunContext | undefined {
  return runContext?.context;
}
