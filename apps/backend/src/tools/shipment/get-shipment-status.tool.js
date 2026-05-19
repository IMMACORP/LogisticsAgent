import { runTool, ToolExecutionError } from '../../lib/tools/tool-result';
import { getShipmentStatusInputSchema } from '../../schemas/shipment/shipment.schemas';
import { shipmentService } from '../../services';
export async function getShipmentStatus(input, _context) {
    const parsed = getShipmentStatusInputSchema.safeParse(input);
    if (!parsed.success) {
        return {
            success: false,
            error: parsed.error.issues[0]?.message ?? '入力値が不正です',
            errorCode: 'VALIDATION_ERROR',
        };
    }
    return runTool(() => shipmentService.getShipmentStatus(parsed.data.trackingNumber));
}
export { ToolExecutionError };
