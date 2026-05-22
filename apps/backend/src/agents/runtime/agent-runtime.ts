import type { Agent } from '@openai/agents';
import type { Session } from '@openai/agents-core';
import type { AgentRunContext } from '@inquiry-agent/shared-types';

/** Optional SDK session (e.g. `MemorySession`) for multi-turn memory. */
export type AgentSession = Session;

export interface AgentRunInput {
  agent: Agent<AgentRunContext>;
  input: string;
  context: AgentRunContext;
  signal?: AbortSignal;
  maxTurns?: number | null;
  session?: AgentSession;
}

export interface AgentRunOutput {
  /** Raw `run()` final output (string or structured object when `outputType` is set). */
  finalOutput: unknown;
  traceId: string;
}
/**
 * Pluggable executor so tests or alternate providers can swap `run()` behavior.
 */
export interface AgentRuntime {
  run(input: AgentRunInput): Promise<AgentRunOutput>;
}
