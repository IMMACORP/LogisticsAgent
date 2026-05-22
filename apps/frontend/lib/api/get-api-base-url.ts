/**
 * Public API base URL for browser-side streaming (must be NEXT_PUBLIC_*).
 */
export function getApiBaseUrl(): string | undefined {
  const base = process.env.NEXT_PUBLIC_API_BASE_URL?.trim();
  return base && base.length > 0 ? base.replace(/\/$/, "") : undefined;
}
