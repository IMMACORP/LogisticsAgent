import { runTool } from '../../lib/tools/tool-result';
import { stripNullFields } from '../../schemas/agent-zod.js';
import { searchShipmentHistoryInputSchema } from '../../schemas/shipment/shipment.schemas';
import { shipmentService } from '../../services';
export async function searchShipmentHistory(input, _context) {
    const parsed = searchShipmentHistoryInputSchema.safeParse(input);
    if (!parsed.success) {
        return {
            success: false,
            error: parsed.error.issues[0]?.message ?? '???????�?',
            errorCode: 'VALIDATION_ERROR',
        };
    }
    return runTool(() => shipmentService.searchShipmentHistory(stripNullFields(parsed.data)));
}
