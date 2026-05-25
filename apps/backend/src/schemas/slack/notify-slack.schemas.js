import { z } from 'zod';
import { agentNullable, stripNullFields } from '../agent-zod.js';
export const notifySlackPrioritySchema = z.enum(['LOW', 'MEDIUM', 'HIGH']);
export const escalationSeveritySchema = z.enum([
    'info',
    'warning',
    'error',
    'critical',
]);
/** OpenAI tool schemas cannot use z.record() (propertyNames). Use JSON string instead. */
const notifySlackInputObjectSchema = z.object({
    channel: z
        .string()
        .trim()
        .min(1, 'Slack チャンネル名を入力してください')
        .max(128, 'チャンネル名は128文字以内で入力してください'),
    priority: notifySlackPrioritySchema,
    severity: agentNullable(escalationSeveritySchema),
    title: z.string().trim().min(1).max(300),
    message: z.string().trim().min(1).max(8000),
    sessionId: z.string().trim().min(1).max(128),
    mentionUsers: agentNullable(z.array(z.string().trim().min(1).max(64)).max(20)),
    metadataJson: agentNullable(z
        .string()
        .max(16_000)
        .describe('Optional extra fields as a JSON object string, e.g. {"inquiryKind":"shipment"}')),
});
/** Plain ZodObject for OpenAI Agents `tool({ parameters })`. */
export const notifySlackToolParametersSchema = notifySlackInputObjectSchema;
function parseMetadataJson(metadataJson) {
    if (metadataJson == null || metadataJson === '') {
        return undefined;
    }
    try {
        const parsed = JSON.parse(metadataJson);
        if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
            return parsed;
        }
    }
    catch {
        return undefined;
    }
    return undefined;
}
/** Maps tool parameters (API-safe) to service-layer NotifySlackInput. */
export function toNotifySlackInput(params) {
    const stripped = stripNullFields(params);
    const { metadataJson, ...rest } = stripped;
    return {
        ...rest,
        metadata: parseMetadataJson(metadataJson),
    };
}
export { stripNullFields };
