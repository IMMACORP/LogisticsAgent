import { tool } from '@openai/agents';
import { notifySlackToolParametersSchema, toNotifySlackInput } from '../../schemas/slack/notify-slack.schemas';
import { notifySlack } from './notify-slack.tool';
export const notifySlackAgentTool = tool({
    name: 'notifySlack',
    description: 'エスカレーションを Slack Incoming Webhook へ通知します。優先度（LOW/MEDIUM/HIGH）と深刻度（severity 省略時は自動マッピング）、セッションID、メンションをサポートします。追加メタデータは metadataJson に JSON 文字列で渡します。',
    parameters: notifySlackToolParametersSchema,
    execute: async (input, runContext) => {
        const c = runContext?.context;
        return notifySlack(toNotifySlackInput(input), c);
    },
});
export const slackAgentTools = [notifySlackAgentTool];
export { notifySlack } from './notify-slack.tool';
