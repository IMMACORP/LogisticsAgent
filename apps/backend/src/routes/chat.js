import { Hono } from 'hono';
import { chatStreamRequestSchema } from '../schemas/chat/chat-stream.schemas.js';
import { ChatStreamError, runChatStream } from '../agents/chat/stream-chat.js';
import { formatSseComment, formatSseEvent } from '../lib/sse/sse-encoder.js';
import { randomUUID } from 'node:crypto';
const chatRouter = new Hono();
const SSE_HEADERS = {
    'Content-Type': 'text/event-stream; charset=utf-8',
    'Cache-Control': 'no-cache, no-transform',
    Connection: 'keep-alive',
    'X-Accel-Buffering': 'no',
};
chatRouter.post('/stream', async (c) => {
    let body;
    try {
        body = await c.req.json();
    }
    catch {
        return c.json({ success: false, message: 'Invalid JSON body' }, 400);
    }
    const parsed = chatStreamRequestSchema.safeParse(body);
    if (!parsed.success) {
        return c.json({ success: false, error: parsed.error.flatten() }, 400);
    }
    const traceId = parsed.data.traceId ?? randomUUID();
    const request = { ...parsed.data, traceId };
    const stream = new ReadableStream({
        async start(controller) {
            const send = async (event, data) => {
                controller.enqueue(formatSseEvent(event, data));
            };
            controller.enqueue(formatSseComment('connected'));
            try {
                await runChatStream({
                    request,
                    send,
                    signal: c.req.raw.signal,
                });
            }
            catch (err) {
                const payload = err instanceof ChatStreamError
                    ? {
                        traceId: err.traceId,
                        code: err.code,
                        message: err.message,
                        recoverable: err.recoverable,
                    }
                    : {
                        traceId,
                        code: 'INTERNAL_ERROR',
                        message: err instanceof Error ? err.message : 'Chat stream failed',
                        recoverable: false,
                    };
                controller.enqueue(formatSseEvent('error', payload));
            }
            finally {
                controller.close();
            }
        },
    });
    return new Response(stream, { headers: SSE_HEADERS });
});
export { chatRouter };
