import type { PrismaClient } from '@prisma/client';

import type { JsonRecord, WorkflowRunRecord, WorkflowStepHistoryEntry } from '../types.js';
import type { WorkflowRunStatus } from '../workflow-error.js';

export interface WorkflowRunStore {
  createRun(input: {
    runId: string;
    workflowKey: string;
    version: string;
    traceId?: string;
    initialState: JsonRecord;
  }): Promise<void>;

  saveProgress(input: {
    runId: string;
    status: WorkflowRunStatus;
    currentStepId: string | null;
    state: JsonRecord;
    stepHistory: WorkflowStepHistoryEntry[];
    lastError?: JsonRecord;
  }): Promise<void>;

  getRun(runId: string): Promise<WorkflowRunRecord | null>;
}

export class InMemoryWorkflowRunStore implements WorkflowRunStore {
  private readonly runs = new Map<string, WorkflowRunRecord>();

  async createRun(input: {
    runId: string;
    workflowKey: string;
    version: string;
    traceId?: string;
    initialState: JsonRecord;
  }): Promise<void> {
    const now = new Date();
    this.runs.set(input.runId, {
      id: input.runId,
      workflowKey: input.workflowKey,
      version: input.version,
      status: 'running',
      currentStepId: null,
      state: { ...input.initialState },
      stepHistory: [],
      traceId: input.traceId,
      createdAt: now,
      updatedAt: now,
    });
  }

  async saveProgress(input: {
    runId: string;
    status: WorkflowRunStatus;
    currentStepId: string | null;
    state: JsonRecord;
    stepHistory: WorkflowStepHistoryEntry[];
    lastError?: JsonRecord;
  }): Promise<void> {
    const cur = this.runs.get(input.runId);
    if (!cur) return;
    this.runs.set(input.runId, {
      ...cur,
      status: input.status,
      currentStepId: input.currentStepId,
      state: { ...input.state },
      stepHistory: [...input.stepHistory],
      lastError: input.lastError,
      updatedAt: new Date(),
    });
  }

  async getRun(runId: string): Promise<WorkflowRunRecord | null> {
    return this.runs.get(runId) ?? null;
  }
}

type WorkflowRunDb = {
  create(args: { data: Record<string, unknown> }): Promise<WorkflowRunRow>;
  update(args: { where: { id: string }; data: Record<string, unknown> }): Promise<WorkflowRunRow>;
  findUnique(args: { where: { id: string } }): Promise<WorkflowRunRow | null>;
};

type WorkflowRunRow = {
  id: string;
  workflowKey: string;
  version: string;
  status: string;
  currentStepId: string | null;
  state: unknown;
  stepHistory: unknown;
  traceId: string | null;
  lastError: unknown | null;
  createdAt: Date;
  updatedAt: Date;
};

function workflowRuns(prisma: PrismaClient): WorkflowRunDb {
  return (prisma as unknown as { workflowRun: WorkflowRunDb }).workflowRun;
}

function rowToRecord(row: WorkflowRunRow): WorkflowRunRecord {
  return {
    id: row.id,
    workflowKey: row.workflowKey,
    version: row.version,
    status: row.status as WorkflowRunStatus,
    currentStepId: row.currentStepId,
    state:
      row.state && typeof row.state === 'object' && !Array.isArray(row.state)
        ? (row.state as JsonRecord)
        : {},
    stepHistory: Array.isArray(row.stepHistory)
      ? (row.stepHistory as WorkflowStepHistoryEntry[])
      : [],
    traceId: row.traceId ?? undefined,
    lastError:
      row.lastError && typeof row.lastError === 'object'
        ? (row.lastError as JsonRecord)
        : undefined,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

export class PrismaWorkflowRunStore implements WorkflowRunStore {
  constructor(private readonly prisma: PrismaClient) {}

  async createRun(input: {
    runId: string;
    workflowKey: string;
    version: string;
    traceId?: string;
    initialState: JsonRecord;
  }): Promise<void> {
    await workflowRuns(this.prisma).create({
      data: {
        id: input.runId,
        workflowKey: input.workflowKey,
        version: input.version,
        status: 'running',
        currentStepId: null,
        state: input.initialState,
        stepHistory: [],
        traceId: input.traceId ?? null,
        lastError: null,
      },
    });
  }

  async saveProgress(input: {
    runId: string;
    status: WorkflowRunStatus;
    currentStepId: string | null;
    state: JsonRecord;
    stepHistory: WorkflowStepHistoryEntry[];
    lastError?: JsonRecord;
  }): Promise<void> {
    await workflowRuns(this.prisma).update({
      where: { id: input.runId },
      data: {
        status: input.status,
        currentStepId: input.currentStepId,
        state: input.state,
        stepHistory: input.stepHistory,
        lastError: input.lastError ?? null,
      },
    });
  }

  async getRun(runId: string): Promise<WorkflowRunRecord | null> {
    const row = await workflowRuns(this.prisma).findUnique({ where: { id: runId } });
    return row ? rowToRecord(row) : null;
  }
}
