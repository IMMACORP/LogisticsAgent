import { prisma } from '../database/client.js';
import { structuredLog } from '../agents/runtime/structured-log.js';
import { executeWorkflow } from './workflow-engine.js';
import { InMemoryWorkflowRunStore, PrismaWorkflowRunStore, } from './persistence/workflow-run-store.js';
import { resolveWorkflowDefinition } from './workflow-registry.js';
function usePrismaWorkflowStore() {
    return process.env.INQUIRY_WORKFLOW_STORE !== 'memory';
}
let storeSingleton;
export function getWorkflowRunStore() {
    if (storeSingleton) {
        return storeSingleton;
    }
    storeSingleton = usePrismaWorkflowStore()
        ? new PrismaWorkflowRunStore(prisma)
        : new InMemoryWorkflowRunStore();
    return storeSingleton;
}
export class WorkflowOrchestratorService {
    store;
    constructor(store = getWorkflowRunStore()) {
        this.store = store;
    }
    async startWorkflow(input) {
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
    async getWorkflowRun(runId) {
        return this.store.getRun(runId);
    }
}
export const workflowOrchestrator = new WorkflowOrchestratorService();
