import { structuredWorkflowEscalationSchema, } from '../../schemas/escalation/escalation.schemas.js';
import { slackEscalationChannelLabel } from '../../agents/reception/reception-thresholds.js';
export function buildEscalationTitle(activeTriggers) {
    const labels = {
        low_confidence: '信頼度低下',
        missing_shipment_data: '配送データ不足',
        tool_execution_failure: 'ツール実行失敗',
        repeated_retry_failure: 'リトライ上限超過',
    };
    const parts = activeTriggers.map((t) => labels[t] ?? t);
    return `エスカレーション: ${parts.join(' / ')}`;
}
export function buildStructuredEscalationPayload(params) {
    const title = buildEscalationTitle(params.evaluation.activeTriggers);
    const message = [
        params.conversationSummary,
        '',
        '---',
        `Requested triggers: ${params.input.triggers.join(', ')}`,
        `Active triggers: ${params.evaluation.activeTriggers.join(', ')}`,
    ].join('\n');
    const payload = {
        schemaVersion: '1.1',
        idempotencyKey: params.input.idempotencyKey,
        triggers: params.evaluation.activeTriggers,
        priority: params.evaluation.priority,
        severity: params.evaluation.severity,
        title,
        message,
        conversationSummary: params.conversationSummary,
        sessionId: params.input.sessionId,
        slackChannel: slackEscalationChannelLabel(),
        context: {
            userId: params.input.userId,
            agentName: params.input.context.agentName,
            traceId: params.traceId,
            channel: params.input.context.channel,
            workflowRunId: params.workflowRunId,
            conversationId: params.input.conversationId,
            gatheredAt: new Date().toISOString(),
            triggerDetails: params.evaluation.triggerDetails,
        },
        metadata: {
            category: params.input.category,
            assignedTeam: params.input.assignedTeam,
            mentionUsers: params.input.mentionUsers,
        },
    };
    return structuredWorkflowEscalationSchema.parse(payload);
}
