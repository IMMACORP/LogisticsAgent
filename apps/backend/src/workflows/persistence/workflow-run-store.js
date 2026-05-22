export class InMemoryWorkflowRunStore {
    runs = new Map();
    async createRun(input) {
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
    async saveProgress(input) {
        const cur = this.runs.get(input.runId);
        if (!cur)
            return;
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
    async getRun(runId) {
        return this.runs.get(runId) ?? null;
    }
}
function workflowRuns(prisma) {
    return prisma.workflowRun;
}
function rowToRecord(row) {
    return {
        id: row.id,
        workflowKey: row.workflowKey,
        version: row.version,
        status: row.status,
        currentStepId: row.currentStepId,
        state: row.state && typeof row.state === 'object' && !Array.isArray(row.state)
            ? row.state
            : {},
        stepHistory: Array.isArray(row.stepHistory)
            ? row.stepHistory
            : [],
        traceId: row.traceId ?? undefined,
        lastError: row.lastError && typeof row.lastError === 'object'
            ? row.lastError
            : undefined,
        createdAt: row.createdAt,
        updatedAt: row.updatedAt,
    };
}
export class PrismaWorkflowRunStore {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async createRun(input) {
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
    async saveProgress(input) {
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
    async getRun(runId) {
        const row = await workflowRuns(this.prisma).findUnique({ where: { id: runId } });
        return row ? rowToRecord(row) : null;
    }
}
