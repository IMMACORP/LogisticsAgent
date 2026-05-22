import { z } from 'zod';
export const notifySlackPrioritySchema = z.enum(['LOW', 'MEDIUM', 'HIGH']);
export const escalationSeveritySchema = z.enum([
    'info',
    'warning',
    'error',
    'critical',
]);
export const notifySlackInputSchema = z.object({
    channel: z
        .string()
        .trim()
        .min(1, 'Slack チャンネル名を入力してください')
        .max(128, 'チャンネル名は128文字以内で入力してください'),
    priority: notifySlackPrioritySchema,
    severity: escalationSeveritySchema.optional(),
    title: z.string().trim().min(1).max(300),
    message: z.string().trim().min(1).max(8000),
    sessionId: z.string().trim().min(1).max(128),
    mentionUsers: z.array(z.string().trim().min(1).max(64)).max(20).optional(),
    metadata: z.record(z.string(), z.unknown()).optional(),
});
