import { inventoryService } from '../../services/index.js';
import { ToolExecutionError } from '../../lib/tools/tool-result.js';
import { WorkflowError } from '../workflow-error.js';
export const INVENTORY_SHORTAGE_WORKFLOW_KEY = 'inventory_shortage';
const DEFAULT_AVAILABLE_THRESHOLD = 0;
export function createInventoryShortageWorkflow() {
    return {
        key: INVENTORY_SHORTAGE_WORKFLOW_KEY,
        version: '1',
        steps: [
            {
                id: 'validate_input',
                timeoutMs: 2_000,
                run: async (ctx) => {
                    const warehouseCode = String(ctx.state.warehouseCode ?? '').trim();
                    const itemCode = String(ctx.state.itemCode ?? '').trim();
                    const requiredQuantity = Number(ctx.state.requiredQuantity);
                    if (!warehouseCode || !itemCode || !Number.isFinite(requiredQuantity) || requiredQuantity <= 0) {
                        throw new WorkflowError('VALIDATION', 'warehouseCode, itemCode, and positive requiredQuantity are required');
                    }
                    ctx.state.warehouseCode = warehouseCode;
                    ctx.state.itemCode = itemCode;
                    ctx.state.requiredQuantity = requiredQuantity;
                },
            },
            {
                id: 'check_availability',
                timeoutMs: 15_000,
                retry: { maxAttempts: 3, baseDelayMs: 500 },
                run: async (ctx) => {
                    try {
                        const result = await inventoryService.checkStockAvailability({
                            warehouseCode: String(ctx.state.warehouseCode),
                            itemCode: String(ctx.state.itemCode),
                            requestedQuantity: Number(ctx.state.requiredQuantity),
                        });
                        ctx.state.availability = result;
                        ctx.state.availableQuantity = result.availableQuantity;
                        ctx.state.shortage =
                            result.availableQuantity < Number(ctx.state.requiredQuantity);
                    }
                    catch (err) {
                        if (err instanceof ToolExecutionError && err.code === 'NOT_FOUND') {
                            throw new WorkflowError('NOT_FOUND', err.message, err);
                        }
                        throw err;
                    }
                },
                compensate: async (ctx) => {
                    ctx.state.compensationNote = 'inventory check: read-only (no rollback)';
                },
            },
            {
                id: 'search_alternate_stock',
                description: 'Find other warehouses with available stock when shortage',
                timeoutMs: 15_000,
                run: async (ctx) => {
                    if (!ctx.state.shortage) {
                        ctx.state.alternateWarehouses = [];
                        return;
                    }
                    const itemCode = String(ctx.state.itemCode);
                    const records = await inventoryService.searchInventory({
                        itemCode,
                        limit: 20,
                    });
                    const required = Number(ctx.state.requiredQuantity);
                    const alternates = records.filter((r) => r.warehouseCode !== ctx.state.warehouseCode &&
                        r.availableQuantity >= required);
                    ctx.state.alternateWarehouses = alternates.map((r) => ({
                        warehouseCode: r.warehouseCode,
                        availableQuantity: r.availableQuantity,
                    }));
                },
            },
            {
                id: 'evaluate_shortage',
                timeoutMs: 2_000,
                run: async (ctx) => {
                    const available = Number(ctx.state.availableQuantity ?? 0);
                    const required = Number(ctx.state.requiredQuantity);
                    ctx.state.severity =
                        available <= DEFAULT_AVAILABLE_THRESHOLD
                            ? 'critical'
                            : available < required
                                ? 'warning'
                                : 'ok';
                    ctx.state.summary =
                        ctx.state.severity === 'ok'
                            ? `在庫は要求数量を満たしています（可能数: ${available}）。`
                            : `在庫不足: 必要 ${required} / 可能 ${available}。代替倉庫: ${ctx.state.alternateWarehouses?.length ?? 0} 件`;
                },
            },
        ],
    };
}
