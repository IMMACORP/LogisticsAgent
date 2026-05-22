import type { ToolExecutionContext } from './tools/common';

/** Routing channel for specialized agents (matches `AgentRequest.channel`). */
export type AgentChannel =
  | 'hr'
  | 'it'
  | 'logistics'
  | 'accounting'
  | 'reception';

/**
 * App-defined object passed to OpenAI Agents SDK as `run(..., { context })`.
 * Available inside tools as `runContext.context` (`RunContext<AgentRunContext>`).
 */
export interface AgentRunContext extends Omit<ToolExecutionContext, 'traceId'> {
  channel: AgentChannel;
  /** Correlates logs, HTTP response `details`, and optional OpenAI tracing. */
  traceId: string;
  metadata?: Record<string, unknown>;
}
