import type {
  NotifySlackInput,
  NotifySlackOutput,
  ToolExecutionContext,
  ToolResult,
} from '@inquiry-agent/shared-types';

import { runTool } from '../../lib/tools/tool-result';
import {
  notifySlackToolParametersSchema,
  toNotifySlackInput,
  type NotifySlackToolParameters,
} from '../../schemas/slack/notify-slack.schemas';
import { slackEscalationService } from '../../services/slack-escalation.service';

function normalizeNotifySlackInput(
  input: NotifySlackInput | NotifySlackToolParameters,
): NotifySlackInput {
  if ('metadataJson' in input) {
    const parsed = notifySlackToolParametersSchema.safeParse(input);
    if (!parsed.success) {
      throw new Error(parsed.error.issues[0]?.message ?? 'Invalid notifySlack input');
    }
    return toNotifySlackInput(parsed.data);
  }
  return input;
}

export async function notifySlack(
  input: NotifySlackInput | NotifySlackToolParameters,
  context?: ToolExecutionContext,
): Promise<ToolResult<NotifySlackOutput>> {
  try {
    const payload = normalizeNotifySlackInput(input);
    return runTool(() => slackEscalationService.notifySlack(payload, context));
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'notifySlack 入力値が不正です',
      errorCode: 'VALIDATION_ERROR',
    };
  }
}
