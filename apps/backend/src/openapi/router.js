import { OpenAPIHono } from '@hono/zod-openapi';
import { defaultOpenApiHook } from './default-hook.js';
import { historyOpenApiRouter } from './history-routes.js';
/**
 * Root OpenAPI router: mounts history REST APIs and serves the OpenAPI document.
 */
export function createOpenApiApp() {
    const app = new OpenAPIHono({ defaultHook: defaultOpenApiHook });
    app.route('/', historyOpenApiRouter);
    app.doc31('/openapi.json', {
        openapi: '3.1.0',
        info: {
            title: 'Inquiry Agent API',
            version: '0.1.0',
            description: 'REST APIs for conversation, message, and escalation history. Compatible with Orval code generation.',
        },
        servers: [{ url: 'http://localhost:3001', description: 'Local development' }],
        tags: [
            { name: 'Conversation History', description: 'Conversation threads' },
            { name: 'Message History', description: 'Chat messages' },
            { name: 'Escalation History', description: 'Human escalation logs' },
        ],
    });
    return app;
}
export const openApiApp = createOpenApiApp();
