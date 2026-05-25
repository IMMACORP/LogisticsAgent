import { Hono } from 'hono';
export const healthRouter = new Hono();
healthRouter.get('/', (c) => c.json({
    status: 'pass',
    timestamp: new Date().toISOString(),
    services: ['reception', 'hr', 'it', 'logistics']
}));
