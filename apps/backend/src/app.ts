import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { agentRouter } from './routes/agent';
import { healthRouter } from './routes/health';
import { serve } from '@hono/node-server';

const app = new Hono();

app.use('*', cors());
app.get('/', (c) => {
  return c.text('Hello Logistics Agent!')
})

app.route('/health', healthRouter);
app.route('/agent', agentRouter);

app.get('/openapi.json', async (c) => {
  return c.json({
    openapi: '3.1.0',
    info: { title: 'Inquiry Agent API', version: '0.1.0' }
  });
});

// サーバー起動
serve({
  fetch: app.fetch,
  port: 3001
})

console.log('? Server running at http://localhost:3001')


export default app;


