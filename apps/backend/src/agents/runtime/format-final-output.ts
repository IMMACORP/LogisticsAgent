/**
 * Normalizes SDK `finalOutput` (plain text or structured) for HTTP `message` fields.
 */
export function formatFinalOutputMessage(value: unknown): string {
  if (typeof value === 'string') {
    return value;
  }
  if (value == null) {
    return '';
  }
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
}
