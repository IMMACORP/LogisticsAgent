const encoder = new TextEncoder();
export function formatSseEvent(event, data) {
    const payload = typeof data === 'string' ? data : JSON.stringify(data);
    return encoder.encode(`event: ${event}\ndata: ${payload}\n\n`);
}
export function formatSseComment(comment) {
    return encoder.encode(`: ${comment}\n\n`);
}
