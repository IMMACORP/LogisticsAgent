import { buildOpenAIAuthHeaders, describeOpenAIKeySetup, getTrimmedOpenAIApiKey, isProjectScopedApiKey, getOpenAIProjectId, } from './openai-env.js';
export function maskOpenAIKey(key) {
    if (!key) {
        return '(not set)';
    }
    const trimmed = key.trim();
    if (trimmed.length <= 8) {
        return '****';
    }
    return `${trimmed.slice(0, 7)}…${trimmed.slice(-4)}`;
}
/**
 * Lightweight check against the OpenAI API (models list).
 */
export async function validateOpenAIApiKey() {
    const key = getTrimmedOpenAIApiKey();
    if (!key) {
        return { ok: false, message: 'OPENAI_API_KEY is not set in apps/backend/.env' };
    }
    if (!key.startsWith('sk-')) {
        return {
            ok: false,
            message: 'OPENAI_API_KEY must start with sk- (check for typos or wrong variable)',
            keySuffix: key.slice(-4),
        };
    }
    if (isProjectScopedApiKey(key) && !getOpenAIProjectId()) {
        return {
            ok: false,
            message: 'Project API key (sk-proj-*) requires OPENAI_PROJECT_ID=proj_... in apps/backend/.env. ' +
                'Copy the Project ID from the OpenAI dashboard (same as your other project).',
            keySuffix: key.slice(-4),
        };
    }
    try {
        const response = await fetch('https://api.openai.com/v1/models', {
            method: 'GET',
            headers: buildOpenAIAuthHeaders(),
            signal: AbortSignal.timeout(15_000),
        });
        if (response.status === 401) {
            return {
                ok: false,
                message: 'OpenAI returned 401. If the key works elsewhere, set OPENAI_PROJECT_ID (and OPENAI_ORG_ID if needed) ' +
                    'in apps/backend/.env to match that project. See: npm run check:openai',
                keySuffix: key.slice(-4),
            };
        }
        if (!response.ok) {
            return {
                ok: false,
                message: `OpenAI API returned HTTP ${response.status}`,
                keySuffix: key.slice(-4),
            };
        }
        return {
            ok: true,
            message: `OpenAI API key accepted (${describeOpenAIKeySetup()})`,
            keySuffix: key.slice(-4),
        };
    }
    catch (err) {
        return {
            ok: false,
            message: err instanceof Error ? err.message : 'OpenAI API check failed',
            keySuffix: key.slice(-4),
        };
    }
}
