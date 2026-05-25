import { setDefaultOpenAIClient } from '@openai/agents-openai';
import OpenAI from 'openai';
import { describeOpenAIKeySetup, getOpenAIOrganizationId, getOpenAIProjectId, getTrimmedOpenAIApiKey, isProjectScopedApiKey, } from '../../lib/openai/openai-env.js';
/**
 * Feature flag: when true, `runAgent` executes via OpenAI Agents SDK (`run`).
 * Requires `OPENAI_API_KEY` (and `OPENAI_PROJECT_ID` for `sk-proj-*` keys).
 */
export function isOpenAIAgentsSdkEnabled() {
    return process.env.INQUIRY_USE_AGENTS_SDK === 'true';
}
export function assertOpenAIKeyPresent() {
    if (!getTrimmedOpenAIApiKey()) {
        throw new Error('OPENAI_API_KEY is required when INQUIRY_USE_AGENTS_SDK=true');
    }
    const key = getTrimmedOpenAIApiKey();
    if (isProjectScopedApiKey(key) && !getOpenAIProjectId()) {
        throw new Error('OPENAI_PROJECT_ID is required when using a project API key (sk-proj-*). ' +
            'Set it in apps/backend/.env (Project ID from OpenAI dashboard).');
    }
}
export function resolveAgentsModel() {
    const m = process.env.INQUIRY_AGENTS_MODEL;
    return m && m.length > 0 ? m : undefined;
}
let openAIClientConfigured = false;
/**
 * Registers a default OpenAI client for @openai/agents (apiKey + project + org).
 * Safe to call multiple times.
 */
export function configureOpenAIAgentsSdk() {
    if (openAIClientConfigured) {
        return;
    }
    assertOpenAIKeyPresent();
    const client = new OpenAI({
        apiKey: getTrimmedOpenAIApiKey(),
        project: getOpenAIProjectId(),
        organization: getOpenAIOrganizationId(),
    });
    setDefaultOpenAIClient(client);
    openAIClientConfigured = true;
}
export function logOpenAISetupHint() {
    console.log(`[startup] OpenAI config: ${describeOpenAIKeySetup()}`);
}
