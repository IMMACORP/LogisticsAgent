import { shipmentService } from '../../services/index.js';
import { ToolExecutionError } from '../../lib/tools/tool-result.js';
import { WorkflowError } from '../workflow-error.js';
export const SHIPMENT_INQUIRY_WORKFLOW_KEY = 'shipment_inquiry';
export function createShipmentInquiryWorkflow() {
    return {
        key: SHIPMENT_INQUIRY_WORKFLOW_KEY,
        version: '1',
        steps: [
            {
                id: 'validate_input',
                description: 'Validate tracking number',
                timeoutMs: 2_000,
                run: async (ctx) => {
                    const tn = String(ctx.state.trackingNumber ?? '').trim();
                    if (!tn) {
                        throw new WorkflowError('VALIDATION', 'trackingNumber is required');
                    }
                    ctx.state.trackingNumber = tn;
                },
            },
            {
                id: 'fetch_shipment_status',
                description: 'Load shipment from operational DB',
                timeoutMs: 15_000,
                retry: { maxAttempts: 3, baseDelayMs: 500 },
                run: async (ctx) => {
                    try {
                        const status = await shipmentService.getShipmentStatus(String(ctx.state.trackingNumber));
                        ctx.state.shipmentStatus = status;
                    }
                    catch (err) {
                        if (err instanceof ToolExecutionError && err.code === 'NOT_FOUND') {
                            throw new WorkflowError('NOT_FOUND', err.message, err);
                        }
                        throw err;
                    }
                },
                compensate: async (ctx) => {
                    ctx.state.compensationNote =
                        'shipment inquiry: no automatic rollback (read-only step)';
                },
            },
            {
                id: 'format_response',
                description: 'Build user-facing summary',
                timeoutMs: 2_000,
                run: async (ctx) => {
                    const s = ctx.state.shipmentStatus;
                    if (!s) {
                        throw new WorkflowError('INTERNAL', 'shipmentStatus missing after fetch');
                    }
                    ctx.state.summary = [
                        `送り状: ${s.trackingNumber}`,
                        `ステータス: ${s.shipmentStatus}`,
                        `現在地: ${s.currentLocation}`,
                        s.estimatedArrival ? `ETA: ${s.estimatedArrival}` : '',
                        s.delayReason ? `遅延理由: ${s.delayReason}` : '',
                    ]
                        .filter(Boolean)
                        .join('\n');
                },
            },
        ],
    };
}
