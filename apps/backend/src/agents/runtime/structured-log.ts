export type StructuredLogLevel = 'debug' | 'info' | 'warn' | 'error';

/**
 * Single-line JSON logs for grep-friendly ingestion (Datadog, CloudWatch, etc.).
 */
export function structuredLog(
  level: StructuredLogLevel,
  event: string,
  fields: Record<string, unknown>,
): void {
  const line = JSON.stringify({
    ts: new Date().toISOString(),
    level,
    event,
    ...fields,
  });
  if (level === 'error') {
    console.error(line);
  } else if (level === 'warn') {
    console.warn(line);
  } else {
    console.log(line);
  }
}
