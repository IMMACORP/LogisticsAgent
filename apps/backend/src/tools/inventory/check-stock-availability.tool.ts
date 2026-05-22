import type {
  CheckStockAvailabilityInput,
  CheckStockAvailabilityOutput,
  ToolExecutionContext,
  ToolResult,
} from '@inquiry-agent/shared-types';

import { runTool } from '../../lib/tools/tool-result';
import { checkStockAvailabilityInputSchema } from '../../schemas/inventory/inventory.schemas';
import { inventoryService } from '../../services';

export async function checkStockAvailability(
  input: CheckStockAvailabilityInput,
  _context?: ToolExecutionContext,
): Promise<ToolResult<CheckStockAvailabilityOutput>> {
  const parsed = checkStockAvailabilityInputSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? '入力値が不正です',
      errorCode: 'VALIDATION_ERROR',
    };
  }

  return runTool(() => inventoryService.checkStockAvailability(parsed.data));
}
