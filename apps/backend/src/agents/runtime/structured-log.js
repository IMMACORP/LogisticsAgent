/**
 * Single-line JSON logs for grep-friendly ingestion (Datadog, CloudWatch, etc.).
 */
export function structuredLog(level, event, fields) {
    const line = JSON.stringify({
        ts: new Date().toISOString(),
        level,
        event,
        ...fields,
    });
    if (level === 'error') {
        console.error(line);
    }
    else if (level === 'warn') {
        console.warn(line);
    }
    else {
        console.log(line);
    }
}
