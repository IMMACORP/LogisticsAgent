/**
 * Verifies OPENAI_API_KEY from apps/backend/.env
 * Usage: npx tsx scripts/verify-openai-key.ts
 */
import dotenv from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { describeOpenAIKeySetup } from '../src/lib/openai/openai-env.js';
import {
  maskOpenAIKey,
  validateOpenAIApiKey,
} from '../src/lib/openai/validate-api-key.js';

const backendRoot = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
dotenv.config({ path: path.join(backendRoot, '.env') });

if (process.env.OPENAI_API_KEY) {
  process.env.OPENAI_API_KEY = process.env.OPENAI_API_KEY.trim().replace(/^['"]|['"]$/g, '');
}

console.log(`Loaded key: ${maskOpenAIKey(process.env.OPENAI_API_KEY)}`);
console.log(`Setup:      ${describeOpenAIKeySetup()}`);
console.log(`Env file:   ${path.join(backendRoot, '.env')}`);

const result = await validateOpenAIApiKey();
if (result.ok) {
  console.log(`✓ ${result.message} (…${result.keySuffix})`);
  process.exit(0);
}

console.error(`✗ ${result.message}`);
process.exit(1);
