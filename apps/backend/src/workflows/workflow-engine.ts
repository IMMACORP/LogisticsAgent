import { randomUUID } from 'node:crypto';

import { mergeRetryPolicy, runWithRetries } from './workflow-retry.js';
import { withTimeout } from './timeout.js';
import { WorkflowError, type WorkflowRunStatus } from './workflow-error.js';
import type { WorkflowRunStore } from './persistence/workflow-run-store.js';
import type {
  JsonRecord,
  WorkflowDefinition,
  WorkflowExecutionContext,
  WorkflowExecutionResult,
  WorkflowStepHistoryEntry,
} from './types.js';

export interface ExecuteWorkflowOptions {
  store: WorkflowRunStore;
  initialState?: JsonRecord;
  traceId?: string;
  signal?: AbortSignal;
  enableCompensation?: boolean;
}

function nowIso(): string {
  return new Date().toISOString();
}

async function runStepBody(
  ctx: WorkflowExecutionContext,
  step: WorkflowDefinition['steps'][number],
): Promise<void> {
  const policy = mergeRetryPolicy(step.retry);
  const inner = () => step.run(ctx);
  const timed =
    step.timeoutMs != null
      ? () => withTimeout(inner, step.timeoutMs!, ctx.signal)
      : () => inner();

  if (policy.maxAttempts <= 1) {
    await timed();
    return;
  }

  await runWithRetries(timed, {
    maxAttempts: policy.maxAttempts,
    baseDelayMs: policy.baseDelayMs,
    isRetryable: policy.isRetryable ?? (() => false),
  });
}

export async function executeWorkflow(
  definition: WorkflowDefinition,
  options: ExecuteWorkflowOptions,
): Promise<WorkflowExecutionResult> {
  const runId = randomUUID();
  const state: JsonRecord = { ...(options.initialState ?? {}) };
  const stepHistory: WorkflowStepHistoryEntry[] = [];
  const enableCompensation = options.enableCompensation !== false;

  const ctx: WorkflowExecutionContext = {
    runId,
    workflowKey: definition.key,
    version: definition.version,
    state,
    traceId: options.traceId,
    startedAt: nowIso(),
    signal: options.signal,
  };

  await options.store.createRun({
    runId,
    workflowKey: definition.key,
    version: definition.version,
    traceId: options.traceId,
    initialState: state,
  });

  const succeeded: WorkflowDefinition['steps'] = [];

  const persist = async (
    status: WorkflowRunStatus,
    currentStepId: string | null,
    lastError?: JsonRecord,
  ) => {
    await options.store.saveProgress({
      runId,
      status,
      currentStepId,
      state,
      stepHistory,
      lastError,
    });
  };

  for (const step of definition.steps) {
    await persist('running', step.id);
    try {
      await runStepBody(ctx, step);
      succeeded.push(step);
      stepHistory.push({ stepId: step.id, status: 'ok', at: nowIso() });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      stepHistory.push({ stepId: step.id, status: 'failed', at: nowIso(), error: message });
      const lastError: JsonRecord = {
        stepId: step.id,
        message,
        code: err instanceof WorkflowError ? err.code : 'STEP_FAILED',
      };
      await persist('failed', step.id, lastError);

      if (enableCompensation) {
        await persist('compensating', step.id, lastError);
        for (const s of [...succeeded].reverse()) {
          if (!s.compensate) continue;
          try {
            await s.compensate(ctx, err);
            stepHistory.push({ stepId: `${s.id}:compensate`, status: 'compensated', at: nowIso() });
          } catch (compErr) {
            const cmsg = compErr instanceof Error ? compErr.message : String(compErr);
            stepHistory.push({
              stepId: `${s.id}:compensate`,
              status: 'failed',
              at: nowIso(),
              error: cmsg,
            });
          }
        }
        await persist('compensated', step.id, lastError);
      }

      return {
        runId,
        workflowKey: definition.key,
        status: enableCompensation ? 'compensated' : 'failed',
        state,
        stepHistory,
      };
    }
  }

  await persist('completed', null);
  return {
    runId,
    workflowKey: definition.key,
    status: 'completed',
    state,
    stepHistory,
  };
}
