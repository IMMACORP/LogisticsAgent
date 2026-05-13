import type { SlackNotificationPayload } from '@inquiry-agent/shared-types';

const slackToken = process.env.SLACK_BOT_TOKEN;

export async function sendSlackNotification(payload: SlackNotificationPayload) {
  if (!slackToken) {
    throw new Error('SLACK_BOT_TOKEN is required');
  }

  const response = await fetch('https://slack.com/api/chat.postMessage', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${slackToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      channel: payload.channelId,
      text: payload.text,
      blocks: payload.blocks
    })
  });

  const data = await response.json();
  if (!data.ok) {
    throw new Error(`Slack error: ${data.error}`);
  }

  return data;
}
