import { z } from 'zod';

export const chatChannelSchema = z.enum(['reception', 'hr', 'it', 'logistics']);

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

export type ChatStreamRequest = z.infer<typeof chatStreamRequestSchema>;

export type ChatSseEventType =
  | 'meta'
  | 'delta'
  | 'agent_update'
  | 'tool'
  | 'done'
  | 'error';

export interface ChatSseMetaPayload {
  traceId: string;
  sessionId: string;
  conversationId: string;
  channel: string;
  agentName: string;
}

export interface ChatSseDeltaPayload {
  text: string;
}

export interface ChatSseDonePayload {
  traceId: string;
  sessionId: string;
  conversationId: string;
  message: string;
  success: boolean;
  details?: Record<string, unknown>;
}

export interface ChatSseErrorPayload {
  traceId: string;
  code: string;
  message: string;
  recoverable?: boolean;
}
