/**
 * OpenAI Agents SDK / Structured Outputs require optional fields to be `.nullable()`,
 * not `.optional()` alone. See:
 * https://platform.openai.com/docs/guides/structured-outputs#all-fields-must-be-required
 */
export function agentNullable(schema) {
    return schema.nullable();
}
/** Converts `null` tool arguments to `undefined` for service-layer types. */
export function stripNullFields(value) {
    const out = { ...value };
    for (const key of Object.keys(out)) {
        if (out[key] === null) {
            delete out[key];
        }
    }
    return out;
}
