import { priorityToSeverity } from '@inquiry-agent/shared-types';
function severityToEmoji(severity) {
    switch (severity) {
        case 'info':
            return ':information_source:';
        case 'warning':
            return ':warning:';
        case 'error':
            return ':rotating_light:';
        case 'critical':
            return ':bangbang:';
        default:
            return ':bell:';
    }
}
/**
 * Builds a structured Slack message (Block Kit + fallback text) from tool input.
 */
export function createEscalationMessage(input, context) {
    const severity = input.severity ?? priorityToSeverity(input.priority);
    const timestamp = new Date().toISOString();
    const escalation = {
        schemaVersion: '1.0',
        severity,
        priority: input.priority,
        title: input.title,
        message: input.message,
        sessionId: input.sessionId,
        slackChannel: input.channel,
        mentionUsers: input.mentionUsers ?? [],
        context: context
            ? {
                userId: context.userId,
                agentName: context.agentName,
                traceId: context.traceId,
            }
            : undefined,
        metadata: input.metadata,
        timestamp,
    };
    const mentionLine = escalation.mentionUsers.length > 0
        ? escalation.mentionUsers.map((u) => `<@${u}>`).join(' ')
        : '';
    const text = [
        `${severityToEmoji(severity)} *${input.title}*`,
        `*Severity:* ${severity.toUpperCase()} | *Priority:* ${input.priority}`,
        `*Session:* ${input.sessionId} | *Channel:* ${input.channel}`,
        mentionLine ? `*Mentions:* ${mentionLine}` : undefined,
        '',
        input.message,
        '',
        `_Escalation schema ${escalation.schemaVersion} @ ${timestamp}_`,
    ]
        .filter(Boolean)
        .join('\n');
    const blocks = [
        {
            type: 'header',
            text: { type: 'plain_text', text: input.title.slice(0, 150), emoji: true },
        },
        {
            type: 'context',
            elements: [
                {
                    type: 'mrkdwn',
                    text: `${severityToEmoji(severity)} *${severity.toUpperCase()}* · Priority *${input.priority}* · \`${input.channel}\``,
                },
            ],
        },
        {
            type: 'section',
            text: {
                type: 'mrkdwn',
                text: `*Session ID*\n\`${input.sessionId}\``,
            },
        },
        {
            type: 'section',
            text: {
                type: 'mrkdwn',
                text: `*Message*\n${input.message}`,
            },
        },
    ];
    if (context?.userId || context?.agentName || context?.traceId) {
        blocks.push({
            type: 'section',
            fields: [
                context.userId
                    ? { type: 'mrkdwn', text: `*User*\n${context.userId}` }
                    : undefined,
                context.agentName
                    ? { type: 'mrkdwn', text: `*Agent*\n${context.agentName}` }
                    : undefined,
                context.traceId
                    ? { type: 'mrkdwn', text: `*Trace*\n\`${context.traceId}\`` }
                    : undefined,
            ].filter(Boolean),
        });
    }
    if (mentionLine) {
        blocks.push({
            type: 'section',
            text: { type: 'mrkdwn', text: mentionLine },
        });
    }
    blocks.push({ type: 'divider' });
    blocks.push({
        type: 'context',
        elements: [
            {
                type: 'mrkdwn',
                text: `Escalation payload \`${escalation.schemaVersion}\` · ${timestamp}`,
            },
        ],
    });
    return { text, blocks, escalation };
}
