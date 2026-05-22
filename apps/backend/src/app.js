import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { agentRouter } from './routes/agent';
import { chatRouter } from './routes/chat.js';
import { healthRouter } from './routes/health';
import { workflowsRouter } from './routes/workflows.js';
import { openApiApp } from './openapi/router.js';
import { serve } from '@hono/node-server';
const app = new Hono();
app.use('*', cors());
app.get('/', (c) => {
    return c.text('Hello Logistics Agent!');
});
app.route('/health', healthRouter);
app.route('/agent', agentRouter);
app.route('/chat', chatRouter);
app.route('/workflows', workflowsRouter);
app.route('/', openApiApp);
// ?T?[?o?[?N??
serve({
    fetch: app.fetch,
    port: 3001
});
console.log('? Server running at http://localhost:3001');
export default app;
