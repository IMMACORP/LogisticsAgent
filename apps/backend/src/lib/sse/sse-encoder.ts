const encoder = new TextEncoder();

export function formatSseEvent(event: string, data: unknown): Uint8Array {
  const payload = typeof data === 'string' ? data : JSON.stringify(data);
  return encoder.encode(`event: ${event}\ndata: ${payload}\n\n`);
}

export function formatSseComment(comment: string): Uint8Array {
  return encoder.encode(`: ${comment}\n\n`);
}
