/**
 * Writes packages/openapi/openapi.yaml from Zod-defined routes (Orval input).
 *
 * Usage: npm run openapi:generate --workspace apps/backend
 */
import { writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import { openApiApp } from '../src/openapi/router.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const outDir = resolve(__dirname, '../../../packages/openapi');
const outYaml = resolve(outDir, 'openapi.yaml');
const outJson = resolve(outDir, 'openapi.json');

const doc = openApiApp.getOpenAPI31Document({
  openapi: '3.1.0',
  info: {
    title: 'Inquiry Agent API',
    version: '0.1.0',
    description:
      'REST APIs for conversation, message, and escalation history. Compatible with Orval code generation.',
  },
  servers: [{ url: 'http://localhost:3001', description: 'Local development' }],
  tags: [
    { name: 'Conversation History' },
    { name: 'Message History' },
    { name: 'Escalation History' },
  ],
});

writeFileSync(outJson, JSON.stringify(doc, null, 2), 'utf8');

try {
  const { stringify } = await import('yaml');
  writeFileSync(outYaml, stringify(doc), 'utf8');
  console.log(`Wrote ${outYaml}`);
} catch {
  console.warn('yaml package not installed; wrote openapi.json only');
}

console.log(`Wrote ${outJson}`);
