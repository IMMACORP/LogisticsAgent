import { Hono } from 'hono';
import { z } from 'zod';
import { escalationWorkflowInputSchema } from '../schemas/escalation/escalation.schemas.js';
import { ESCALATION_WORKFLOW_KEY, INVENTORY_SHORTAGE_WORKFLOW_KEY, listWorkflowKeys, SHIPMENT_INQUIRY_WORKFLOW_KEY, workflowOrchestrator, } from '../workflows/index.js';
const workflowsRouter = new Hono();
const startBody = z.discriminatedUnion('workflowKey', [
    z.object({
        workflowKey: z.literal(ESCALATION_WORKFLOW_KEY),
        input: escalationWorkflowInputSchema,
        traceId: z.string().optional(),
        enableCompensation: z.boolean().optional(),
    }),
    z.object({
        workflowKey: z.enum([SHIPMENT_INQUIRY_WORKFLOW_KEY, INVENTORY_SHORTAGE_WORKFLOW_KEY]),
        initialState: z.record(z.string(), z.unknown()),
        traceId: z.string().optional(),
        enableCompensation: z.boolean().optional(),
    }),
]);
workflowsRouter.get('/', (c) => {
    return c.json({ workflows: listWorkflowKeys() });
});
workflowsRouter.post('/runs', async (c) => {
    const body = await c.req.json();
    const parsed = startBody.safeParse(body);
    if (!parsed.success) {
        return c.json({ success: false, error: parsed.error.flatten() }, 400);
    }
    const initialState = parsed.data.workflowKey === ESCALATION_WORKFLOW_KEY
        ? { input: parsed.data.input }
        : parsed.data.initialState;
    const result = await workflowOrchestrator.startWorkflow({
        workflowKey: parsed.data.workflowKey,
        initialState,
        traceId: parsed.data.traceId,
        enableCompensation: parsed.data.enableCompensation,
    });
    return c.json({
        success: result.status === 'completed',
        runId: result.runId,
        workflowKey: result.workflowKey,
        status: result.status,
        state: result.state,
        stepHistory: result.stepHistory,
    });
});
workflowsRouter.get('/runs/:runId', async (c) => {
    const run = await workflowOrchestrator.getWorkflowRun(c.req.param('runId'));
    if (!run) {
        return c.json({ success: false, message: 'Workflow run not found' }, 404);
    }
    return c.json({ success: true, run });
});
export { workflowsRouter };
