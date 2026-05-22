import { z } from '@hono/zod-openapi';

import {
  createPaginatedSchema,
  paginationQuerySchema,
} from '../pagination/pagination.schemas.js';

export const apiErrorSchema = z
  .object({
    success: z.literal(false),
    error: z.object({
      code: z.string().openapi({ example: 'VALIDATION_ERROR' }),
      message: z.string(),
      details: z.unknown().optional(),
    }),
  })
  .openapi('ApiError');

export const conversationHistoryItemSchema = z
  .object({
    id: z.string().uuid(),
    userId: z.string(),
    status: z.string(),
    currentAgent: z.string().nullable(),
    summary: z.string().nullable(),
    metadata: z.record(z.string(), z.unknown()).nullable(),
    createdAt: z.string().datetime(),
    updatedAt: z.string().datetime(),
  })
  .openapi('ConversationHistoryItem');

export const listConversationsQuerySchema = paginationQuerySchema.extend({
  userId: z.string().min(1).max(255).openapi({
    description: 'Filter by owning user',
    example: 'user-1',
  }),
  status: z.enum(['active', 'closed']).optional().openapi({
    description: 'Filter by conversation status',
  }),
  currentAgent: z.string().max(64).optional().openapi({
    description: 'Filter by current agent key (e.g. logistics)',
  }),
});

export const paginatedConversationHistorySchema = createPaginatedSchema(
  conversationHistoryItemSchema,
  'PaginatedConversationHistory',
);

export const conversationIdParamSchema = z.object({
  conversationId: z.string().uuid().openapi({ param: { name: 'conversationId', in: 'path' } }),
});

export const messageHistoryItemSchema = z
  .object({
    id: z.string().uuid(),
    conversationId: z.string().uuid(),
    userId: z.string().nullable(),
    role: z.string(),
    agentType: z.string().nullable(),
    content: z.string(),
    intent: z.string().nullable(),
    metadata: z.record(z.string(), z.unknown()).nullable(),
    createdAt: z.string().datetime(),
    updatedAt: z.string().datetime(),
  })
  .openapi('MessageHistoryItem');

export const listMessagesQuerySchema = paginationQuerySchema.extend({
  conversationId: z.string().uuid().optional().openapi({
    description: 'Filter by conversation',
  }),
  userId: z.string().min(1).max(255).optional().openapi({
    description: 'Filter by message author user id',
  }),
  role: z.enum(['user', 'assistant', 'agent', 'system']).optional(),
});

export const paginatedMessageHistorySchema = createPaginatedSchema(
  messageHistoryItemSchema,
  'PaginatedMessageHistory',
);

export const listConversationMessagesQuerySchema = paginationQuerySchema;

export const escalationHistoryItemSchema = z
  .object({
    id: z.string().uuid(),
    conversationId: z.string().uuid().nullable(),
    category: z.string(),
    priority: z.string(),
    escalationReason: z.string().nullable(),
    assignedTeam: z.string().nullable(),
    slackThreadTs: z.string().nullable(),
    status: z.string(),
    resolvedAt: z.string().datetime().nullable(),
    metadata: z.record(z.string(), z.unknown()).nullable(),
    createdAt: z.string().datetime(),
    updatedAt: z.string().datetime(),
  })
  .openapi('EscalationHistoryItem');

export const listEscalationsQuerySchema = paginationQuerySchema.extend({
  conversationId: z.string().uuid().optional(),
  status: z.enum(['open', 'acknowledged', 'resolved']).optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH']).optional(),
  category: z.string().max(128).optional(),
});

export const paginatedEscalationHistorySchema = createPaginatedSchema(
  escalationHistoryItemSchema,
  'PaginatedEscalationHistory',
);

export type ApiError = z.infer<typeof apiErrorSchema>;
export type ConversationHistoryItem = z.infer<typeof conversationHistoryItemSchema>;
export type MessageHistoryItem = z.infer<typeof messageHistoryItemSchema>;
export type EscalationHistoryItem = z.infer<typeof escalationHistoryItemSchema>;
