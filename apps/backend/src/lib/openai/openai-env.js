/**
 * Auth headers / client options for OpenAI Platform (including sk-proj-* keys).
 */
export function getTrimmedOpenAIApiKey() {
    const key = process.env.OPENAI_API_KEY?.trim().replace(/^['"]|['"]$/g, '');
    return key && key.length > 0 ? key : undefined;
}
export function getOpenAIProjectId() {
    const id = process.env.OPENAI_PROJECT_ID?.trim();
    return id && id.length > 0 ? id : undefined;
}
export function getOpenAIOrganizationId() {
    const id = process.env.OPENAI_ORG_ID?.trim();
    return id && id.length > 0 ? id : undefined;
}
export function isProjectScopedApiKey(key) {
    return Boolean(key?.startsWith('sk-proj-'));
}
/** HTTP headers for raw fetch calls (models list, health checks). */
export function buildOpenAIAuthHeaders() {
    const key = getTrimmedOpenAIApiKey();
    if (!key) {
        throw new Error('OPENAI_API_KEY is not set');
    }
    const headers = {
        Authorization: `Bearer ${key}`,
    };
    const project = getOpenAIProjectId();
    const organization = getOpenAIOrganizationId();
    if (project) {
        headers['OpenAI-Project'] = project;
    }
    if (organization) {
        headers['OpenAI-Organization'] = organization;
    }
    return headers;
}
export function describeOpenAIKeySetup() {
    const key = getTrimmedOpenAIApiKey();
    if (!key) {
        return 'OPENAI_API_KEY is not set';
    }
    if (isProjectScopedApiKey(key) && !getOpenAIProjectId()) {
        return ('sk-proj-* key detected but OPENAI_PROJECT_ID is missing. ' +
            'Add OPENAI_PROJECT_ID=proj_... from https://platform.openai.com/settings/organization/projects ' +
            '(same project as in your other app).');
    }
    const parts = [`key suffix …${key.slice(-4)}`];
    if (getOpenAIProjectId()) {
        parts.push(`project ${getOpenAIProjectId()}`);
    }
    if (getOpenAIOrganizationId()) {
        parts.push(`org ${getOpenAIOrganizationId()}`);
    }
    return parts.join(', ');
}
