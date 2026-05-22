import { prisma } from '../database/client.js';
import { structuredLog } from '../agents/runtime/structured-log.js';
import { executeWorkflow } from './workflow-engine.js';
import {
  InMemoryWorkflowRunStore,
  PrismaWorkflowRunStore,
  type WorkflowRunStore,
} from './persistence/workflow-run-store.js';
import { resolveWorkflowDefinition } from './workflow-registry.js';
import type { JsonRecord, WorkflowExecutionResult } from './types.js';

function usePrismaWorkflowStore(): boolean {
  return process.env.INQUIRY_WORKFLOW_STORE !== 'memory';
}

let storeSingleton: WorkflowRunStore | undefined;

export function getWorkflowRunStore(): WorkflowRunStore {
  if (storeSingleton) {
    return storeSingleton;
  }
  storeSingleton = usePrismaWorkflowStore()
    ? new PrismaWorkflowRunStore(prisma)
    : new InMemoryWorkflowRunStore();
  return storeSingleton;
}

export class WorkflowOrchestratorService {
  constructor(private readonly store: WorkflowRunStore = getWorkflowRunStore()) {}

  async startWorkflow(input: {
    workflowKey: string;
    initialState: JsonRecord;
    traceId?: string;
    signal?: AbortSignal;
    enableCompensation?: boolean;
  }): Promise<WorkflowExecutionResult> {
    const definition = resolveWorkflowDefinition(input.workflowKey);

    structuredLog('info', 'workflow.start', {
      workflowKey: input.workflowKey,
      traceId: input.traceId,
    });

    const result = await executeWorkflow(definition, {
      store: this.store,
      initialState: input.initialState,
      traceId: input.traceId,
      signal: input.signal,
      enableCompensation: input.enableCompensation,
    });

    structuredLog('info', 'workflow.complete', {
      workflowKey: result.workflowKey,
      runId: result.runId,
      status: result.status,
      traceId: input.traceId,
    });

    return result;
  }

  async getWorkflowRun(runId: string) {
    return this.store.getRun(runId);
  }
}

export const workflowOrchestrator = new WorkflowOrchestratorService();
