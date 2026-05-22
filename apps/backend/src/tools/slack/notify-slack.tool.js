import { runTool } from '../../lib/tools/tool-result';
import { notifySlackInputSchema } from '../../schemas/slack/notify-slack.schemas';
import { slackEscalationService } from '../../services/slack-escalation.service';
export async function notifySlack(input, context) {
    const parsed = notifySlackInputSchema.safeParse(input);
    if (!parsed.success) {
        return {
            success: false,
            error: parsed.error.issues[0]?.message ?? '入力値が不正です',
            errorCode: 'VALIDATION_ERROR',
        };
    }
    return runTool(() => slackEscalationService.notifySlack(parsed.data, context));
}
