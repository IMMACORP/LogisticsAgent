import { z } from 'zod';

/**
 * OpenAI Agents SDK / Structured Outputs require optional fields to be `.nullable()`,
 * not `.optional()` alone. See:
 * https://platform.openai.com/docs/guides/structured-outputs#all-fields-must-be-required
 */
export function agentNullable<T extends z.ZodType>(schema: T): z.ZodNullable<T> {
  return schema.nullable();
}

/** Converts `null` tool arguments to `undefined` for service-layer types. */
export function stripNullFields<T extends Record<string, unknown>>(value: T): any {
  const out = { ...value };
  for (const key of Object.keys(out) as (keyof T)[]) {
    if (out[key] === null) {
      delete out[key];
    }
  }
  return out as any;
}
