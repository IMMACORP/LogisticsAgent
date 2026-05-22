import { z } from 'zod';
/** Why this escalation was triggered (at least one required to start the workflow). */
export const escalationTriggerSchema = z.enum([
    'low_confidence',
    'missing_shipment_data',
    'tool_execution_failure',
    'repeated_retry_failure',
]);
export const escalationConversationTurnSchema = z.object({
    role: z.enum(['user', 'assistant', 'agent', 'system']),
    content: z.string().min(1).max(16_000),
    at: z.string().datetime().optional(),
});
export const escalationContextSchema = z.object({
    channel: z.string().max(64).optional(),
    agentName: z.string().max(128).optional(),
    /** Model or routing confidence (0–1); used when trigger includes low_confidence */
    confidence: z.number().min(0).max(1).optional(),
    confidenceThreshold: z.number().min(0).max(1).optional(),
    lastUserMessage: z.string().max(12_000).optional(),
    conversationTurns: z.array(escalationConversationTurnSchema).max(100).optional(),
    shipment: z
        .object({
        trackingNumber: z.string().max(128).optional(),
        lookupAttempted: z.boolean().optional(),
        found: z.boolean().optional(),
        errorMessage: z.string().max(2000).optional(),
    })
        .optional(),
    toolFailure: z
        .object({
        toolName: z.string().max(128),
        errorCode: z.string().max(64).optional(),
        message: z.string().max(4000),
    })
        .optional(),
    retryFailure: z
        .object({
        operation: z.string().max(256),
        attempts: z.number().int().min(1).max(32),
        lastError: z.string().max(4000).optional(),
    })
        .optional(),
});
export const escalationWorkflowInputSchema = z.object({
    /** Stable key for idempotent replays (e.g. `${traceId}:${trigger}`). */
    idempotencyKey: z.string().trim().min(8).max(256),
    sessionId: z.string().trim().min(1).max(128),
    userId: z.string().trim().max(255).optional(),
    conversationId: z.string().uuid().optional(),
    triggers: z.array(escalationTriggerSchema).min(1).max(8),
    context: escalationContextSchema,
    category: z.string().trim().max(128).optional(),
    assignedTeam: z.string().trim().max(128).optional(),
    mentionUsers: z.array(z.string().trim().min(1).max(64)).max(20).optional(),
});
export const structuredWorkflowEscalationSchema = z.object({
    schemaVersion: z.literal('1.1'),
    idempotencyKey: z.string(),
    triggers: z.array(escalationTriggerSchema),
    priority: z.enum(['LOW', 'MEDIUM', 'HIGH']),
    severity: z.enum(['info', 'warning', 'error', 'critical']),
    title: z.string(),
    message: z.string(),
    conversationSummary: z.string(),
    sessionId: z.string(),
    slackChannel: z.string(),
    context: z.object({
        userId: z.string().optional(),
        agentName: z.string().optional(),
        traceId: z.string().optional(),
        channel: z.string().optional(),
        workflowRunId: z.string().optional(),
        conversationId: z.string().optional(),
        gatheredAt: z.string().datetime(),
        triggerDetails: z.record(z.string(), z.unknown()).optional(),
    }),
    metadata: z.record(z.string(), z.unknown()).optional(),
});
