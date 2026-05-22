import dotenv from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const backendRoot = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
// dotenv.config({ path: path.join(backendRoot, '.env') });
dotenv.config({ path: path.join(backendRoot, '.env'), override: true });

import { getTrimmedOpenAIApiKey } from './lib/openai/openai-env.js';

if (getTrimmedOpenAIApiKey()) {
  console.log("path:", backendRoot);
  console.log("before:", process.env.OPENAI_API_KEY);
  process.env.OPENAI_API_KEY = getTrimmedOpenAIApiKey();
  console.log("after:", process.env.OPENAI_API_KEY);
}

import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { serve } from '@hono/node-server';

import {
  configureOpenAIAgentsSdk,
  isOpenAIAgentsSdkEnabled,
  logOpenAISetupHint,
} from './agents/runtime/sdk-config.js';
import { agentRouter } from './routes/agent';
import { chatRouter } from './routes/chat.js';
import { healthRouter } from './routes/health';
import { workflowsRouter } from './routes/workflows.js';
import { openApiApp } from './openapi/router.js';
import {
  maskOpenAIKey,
  validateOpenAIApiKey,
} from './lib/openai/validate-api-key.js';

void (async () => {
  if (!isOpenAIAgentsSdkEnabled()) {
    return;
  }
  console.log(
    `[startup] OPENAI_API_KEY loaded: ${maskOpenAIKey(getTrimmedOpenAIApiKey())} (from ${path.join(backendRoot, '.env')})`,
  );
  logOpenAISetupHint();
  try {
    configureOpenAIAgentsSdk();
  } catch (err) {
    console.error(
      `[startup] ${err instanceof Error ? err.message : String(err)}`,
    );
    return;
  }
  const check = await validateOpenAIApiKey();
  if (!check.ok) {
    console.error(`[startup] ${check.message}`);
  } else {
    console.log(`[startup] ${check.message}`);
  }
})();

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

serve({
  fetch: app.fetch,
  port: 3001,
});

console.log('Server running at http://localhost:3001');

export default app;
