import { runTool } from '../../lib/tools/tool-result';
import { reserveInventoryInputSchema } from '../../schemas/inventory/inventory.schemas';
import { inventoryService } from '../../services';
export async function reserveInventory(input, _context) {
    const parsed = reserveInventoryInputSchema.safeParse(input);
    if (!parsed.success) {
        return {
            success: false,
            error: parsed.error.issues[0]?.message ?? '入力値が不正です',
            errorCode: 'VALIDATION_ERROR',
        };
    }
    return runTool(() => inventoryService.reserveInventory(parsed.data));
}
