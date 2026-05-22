import { createRoute, OpenAPIHono, z } from '@hono/zod-openapi';
import { defaultOpenApiHook } from './default-hook.js';
import { apiErrorSchema, conversationHistoryItemSchema, conversationIdParamSchema, escalationHistoryItemSchema, listConversationMessagesQuerySchema, listConversationsQuerySchema, listEscalationsQuerySchema, listMessagesQuerySchema, paginatedConversationHistorySchema, paginatedEscalationHistorySchema, paginatedMessageHistorySchema, } from '../schemas/history/history.schemas.js';
import { conversationHistoryService } from '../services/conversation-history.service.js';
import { messageHistoryService } from '../services/message-history.service.js';
import { escalationHistoryService } from '../services/escalation-history.service.js';
const escalationIdParamSchema = z.object({
    escalationId: z.string().uuid().openapi({
        param: { name: 'escalationId', in: 'path' },
    }),
});
const listConversationsRoute = createRoute({
    method: 'get',
    path: '/api/conversations',
    tags: ['Conversation History'],
    summary: 'List conversations for a user',
    request: {
        query: listConversationsQuerySchema,
    },
    responses: {
        200: {
            description: 'Paginated conversation history',
            content: {
                'application/json': { schema: paginatedConversationHistorySchema },
            },
        },
        400: {
            description: 'Validation error',
            content: { 'application/json': { schema: apiErrorSchema } },
        },
    },
});
const getConversationRoute = createRoute({
    method: 'get',
    path: '/api/conversations/{conversationId}',
    tags: ['Conversation History'],
    summary: 'Get a single conversation',
    request: {
        params: conversationIdParamSchema,
        query: z.object({
            userId: z.string().min(1).max(255).optional(),
        }),
    },
    responses: {
        200: {
            description: 'Conversation',
            content: {
                'application/json': { schema: conversationHistoryItemSchema },
            },
        },
        404: {
            description: 'Not found',
            content: { 'application/json': { schema: apiErrorSchema } },
        },
    },
});
const listConversationMessagesRoute = createRoute({
    method: 'get',
    path: '/api/conversations/{conversationId}/messages',
    tags: ['Message History'],
    summary: 'List messages in a conversation',
    request: {
        params: conversationIdParamSchema,
        query: listConversationMessagesQuerySchema,
    },
    responses: {
        200: {
            description: 'Paginated messages for conversation',
            content: {
                'application/json': { schema: paginatedMessageHistorySchema },
            },
        },
        400: {
            description: 'Validation error',
            content: { 'application/json': { schema: apiErrorSchema } },
        },
    },
});
const listMessagesRoute = createRoute({
    method: 'get',
    path: '/api/messages',
    tags: ['Message History'],
    summary: 'List messages (filterable)',
    request: {
        query: listMessagesQuerySchema,
    },
    responses: {
        200: {
            description: 'Paginated message history',
            content: {
                'application/json': { schema: paginatedMessageHistorySchema },
            },
        },
        400: {
            description: 'Validation error',
            content: { 'application/json': { schema: apiErrorSchema } },
        },
    },
});
const listEscalationsRoute = createRoute({
    method: 'get',
    path: '/api/escalations',
    tags: ['Escalation History'],
    summary: 'List escalation logs',
    request: {
        query: listEscalationsQuerySchema,
    },
    responses: {
        200: {
            description: 'Paginated escalation history',
            content: {
                'application/json': { schema: paginatedEscalationHistorySchema },
            },
        },
        400: {
            description: 'Validation error',
            content: { 'application/json': { schema: apiErrorSchema } },
        },
    },
});
const getEscalationRoute = createRoute({
    method: 'get',
    path: '/api/escalations/{escalationId}',
    tags: ['Escalation History'],
    summary: 'Get a single escalation log',
    request: {
        params: escalationIdParamSchema,
    },
    responses: {
        200: {
            description: 'Escalation log',
            content: {
                'application/json': { schema: escalationHistoryItemSchema },
            },
        },
        404: {
            description: 'Not found',
            content: { 'application/json': { schema: apiErrorSchema } },
        },
    },
});
export function createHistoryOpenApiRouter() {
    const app = new OpenAPIHono({ defaultHook: defaultOpenApiHook });
    app.openapi(listConversationsRoute, async (c) => {
        const query = c.req.valid('query');
        const result = await conversationHistoryService.listConversations(query);
        return c.json(result, 200);
    });
    app.openapi(getConversationRoute, async (c) => {
        const { conversationId } = c.req.valid('param');
        const { userId } = c.req.valid('query');
        const row = await conversationHistoryService.getConversation(conversationId, userId);
        if (!row) {
            return c.json({
                success: false,
                error: { code: 'NOT_FOUND', message: 'Conversation not found' },
            }, 404);
        }
        return c.json(row, 200);
    });
    app.openapi(listConversationMessagesRoute, async (c) => {
        const { conversationId } = c.req.valid('param');
        const query = c.req.valid('query');
        const result = await messageHistoryService.listMessages({
            ...query,
            conversationId,
        });
        return c.json(result, 200);
    });
    app.openapi(listMessagesRoute, async (c) => {
        const query = c.req.valid('query');
        const result = await messageHistoryService.listMessages(query);
        return c.json(result, 200);
    });
    app.openapi(listEscalationsRoute, async (c) => {
        const query = c.req.valid('query');
        const result = await escalationHistoryService.listEscalations(query);
        return c.json(result, 200);
    });
    app.openapi(getEscalationRoute, async (c) => {
        const { escalationId } = c.req.valid('param');
        const row = await escalationHistoryService.getEscalation(escalationId);
        if (!row) {
            return c.json({
                success: false,
                error: { code: 'NOT_FOUND', message: 'Escalation not found' },
            }, 404);
        }
        return c.json(row, 200);
    });
    return app;
}
export const historyOpenApiRouter = createHistoryOpenApiRouter();
