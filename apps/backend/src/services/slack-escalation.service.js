import { createEscalationMessage } from '../lib/slack/create-escalation-message';
import { slackWebhookService } from './slack-webhook.service';
export class SlackEscalationService {
    async notifySlack(input, context) {
        const { text, blocks, escalation } = createEscalationMessage(input, context);
        await slackWebhookService.send({
            text,
            blocks,
        });
        return {
            success: true,
            slackChannel: input.channel,
            threadTs: undefined,
            sentAt: new Date().toISOString(),
            severity: escalation.severity,
        };
    }
}
export const slackEscalationService = new SlackEscalationService();
