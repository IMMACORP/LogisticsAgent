/**
 * Feature flag: when true, `runAgent` executes via OpenAI Agents SDK (`run`).
 * Requires `OPENAI_API_KEY`.
 */
export function isOpenAIAgentsSdkEnabled() {
    return process.env.INQUIRY_USE_AGENTS_SDK === 'true';
}
export function assertOpenAIKeyPresent() {
    if (!process.env.OPENAI_API_KEY) {
        throw new Error('OPENAI_API_KEY is required when INQUIRY_USE_AGENTS_SDK=true');
    }
}
export function resolveAgentsModel() {
    const m = process.env.INQUIRY_AGENTS_MODEL;
    return m && m.length > 0 ? m : undefined;
}
