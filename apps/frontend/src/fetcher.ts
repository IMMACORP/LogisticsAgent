export async function fetcher<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, init);
  if (!response.ok) {
    throw new Error(`Request failed: ${response.statusText}`);
  }
  return response.json() as Promise<T>;
}
