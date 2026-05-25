import { runTool } from '../../lib/tools/tool-result';
import { stripNullFields } from '../../schemas/agent-zod.js';
import { searchInventoryInputSchema } from '../../schemas/inventory/inventory.schemas';
import { inventoryService } from '../../services';
export async function searchInventory(input, _context) {
    const parsed = searchInventoryInputSchema.safeParse(input);
    if (!parsed.success) {
        return {
            success: false,
            error: parsed.error.issues[0]?.message ?? '入力値が不正です',
            errorCode: 'VALIDATION_ERROR',
        };
    }
    return runTool(() => inventoryService.searchInventory(stripNullFields(parsed.data)));
}
