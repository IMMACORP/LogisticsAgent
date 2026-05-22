import { z } from 'zod';
export const chatChannelSchema = z.enum(['reception', 'hr', 'it', 'logistics', 'accounting']);
export const chatStreamRequestSchema = z.object({
    userId: z.string().min(1).max(255),
    channel: chatChannelSchema,
    message: z.string().min(1).max(32_000),
    /** Stable thread id for SDK `MemorySession` (generated if omitted). */
    sessionId: z.string().min(1).max(128).optional(),
    /** Durable conversation row id (created if omitted). */
    conversationId: z.string().uuid().optional(),
    traceId: z.string().min(1).max(128).optional(),
    metadata: z.record(z.string(), z.unknown()).optional(),
});
