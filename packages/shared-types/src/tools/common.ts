export type ToolExecutionStatus = 'success' | 'failed';

export type ToolErrorCode =
  | 'NOT_FOUND'
  | 'VALIDATION_ERROR'
  | 'INVALID_INPUT'
  | 'DATABASE_ERROR'
  | 'NO_RESULTS'
  | 'INSUFFICIENT_STOCK'
  | 'CONFLICT'
  | 'KB_UNAVAILABLE'
  | 'SLACK_UNAVAILABLE';

export interface ToolResult<T> {
  success: boolean;
  data?: T;
  error?: string;
  errorCode?: ToolErrorCode;
  executionTimeMs?: number;
  metadata?: Record<string, unknown>;
}

export interface ToolExecutionContext {
  sessionId: string;
  userId?: string;
  agentName?: string;
  traceId?: string;
}
