import { Hono } from 'hono';
import { z } from 'zod';
import { runAgent } from '../agents/index';
const agentRouter = new Hono();
const requestBody = z.object({
    userId: z.string().min(1),
    channel: z.enum(['reception', 'hr', 'it', 'logistics', 'accounting']),
    prompt: z.string().min(1),
    metadata: z.record(z.string(), z.unknown()).optional()
});
agentRouter.post('/', async (c) => {
    const body = await c.req.json();
    const parseResult = requestBody.safeParse(body);
    if (!parseResult.success) {
        return c.json({ success: false, error: parseResult.error.flatten() }, 400);
    }
    const result = await runAgent(parseResult.data);
    return c.json(result);
});
export { agentRouter };
