import type {
  SearchDeliveryIssueInput,
  SearchDeliveryIssueOutput,
  ToolExecutionContext,
  ToolResult,
} from '@inquiry-agent/shared-types';

import { runTool } from '../../lib/tools/tool-result';
import { searchDeliveryIssueInputSchema } from '../../schemas/shipment/shipment.schemas';
import { shipmentService } from '../../services';

export async function searchDeliveryIssue(
  input: SearchDeliveryIssueInput,
  _context?: ToolExecutionContext,
): Promise<ToolResult<SearchDeliveryIssueOutput>> {
  const parsed = searchDeliveryIssueInputSchema.safeParse(input);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? '入力値が不正です',
      errorCode: 'VALIDATION_ERROR',
    };
  }

  return runTool(() => shipmentService.searchDeliveryIssues(parsed.data));
}
