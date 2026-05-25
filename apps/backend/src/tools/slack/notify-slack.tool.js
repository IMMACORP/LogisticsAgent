import { runTool } from '../../lib/tools/tool-result';
import { notifySlackToolParametersSchema, toNotifySlackInput, } from '../../schemas/slack/notify-slack.schemas';
import { slackEscalationService } from '../../services/slack-escalation.service';
function normalizeNotifySlackInput(input) {
    if ('metadataJson' in input) {
        const parsed = notifySlackToolParametersSchema.safeParse(input);
        if (!parsed.success) {
            throw new Error(parsed.error.issues[0]?.message ?? 'Invalid notifySlack input');
        }
        return toNotifySlackInput(parsed.data);
    }
    return input;
}
export async function notifySlack(input, context) {
    try {
        const payload = normalizeNotifySlackInput(input);
        return runTool(() => slackEscalationService.notifySlack(payload, context));
    }
    catch (err) {
        return {
            success: false,
            error: err instanceof Error ? err.message : 'notifySlack 入力値が不正です',
            errorCode: 'VALIDATION_ERROR',
        };
    }
}
