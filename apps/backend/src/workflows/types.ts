import type { WorkflowRunStatus } from './workflow-error.js';

export type JsonRecord = Record<string, unknown>;

export interface RetryPolicy {
  maxAttempts: number;
  baseDelayMs: number;
  isRetryable?: (err: unknown) => boolean;
}

export interface WorkflowStepHistoryEntry {
  stepId: string;
  status: 'ok' | 'failed' | 'compensated';
  at: string;
  error?: string;
}

export interface WorkflowExecutionContext {
  runId: string;
  workflowKey: string;
  version: string;
  /** Mutable bag shared across steps */
  state: JsonRecord;
  traceId?: string;
  startedAt: string;
  /** Optional external abort (e.g. HTTP disconnect) */
  signal?: AbortSignal;
}

export interface WorkflowStep {
  id: string;
  description?: string;
  run: (ctx: WorkflowExecutionContext) => Promise<void>;
  /**
   * Saga-style compensation hook (placeholder-friendly).
   * Invoked in reverse order after a step failure for steps that completed successfully.
   */
  compensate?: (ctx: WorkflowExecutionContext, err: unknown) => Promise<void>;
  retry?: RetryPolicy;
  /** Per-step wall-clock budget; combined with retry attempts */
  timeoutMs?: number;
}

export interface WorkflowDefinition {
  key: string;
  version: string;
  steps: WorkflowStep[];
}

export interface WorkflowRunRecord {
  id: string;
  workflowKey: string;
  version: string;
  status: WorkflowRunStatus;
  currentStepId: string | null;
  state: JsonRecord;
  stepHistory: WorkflowStepHistoryEntry[];
  traceId?: string;
  lastError?: JsonRecord;
  createdAt: Date;
  updatedAt: Date;
}

export interface WorkflowExecutionResult {
  runId: string;
  workflowKey: string;
  status: WorkflowRunStatus;
  state: JsonRecord;
  stepHistory: WorkflowStepHistoryEntry[];
}
