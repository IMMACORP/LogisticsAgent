import { getApiBaseUrl } from "@/lib/api/get-api-base-url";
import type {
  EscalationHistoryItem,
  PaginatedEscalationHistory,
} from "@/lib/types/escalation";

export interface ListEscalationsParams {
  conversationId?: string;
  status?: "open" | "acknowledged" | "resolved";
  page?: number;
  pageSize?: number;
}

export async function listEscalations(
  params: ListEscalationsParams,
): Promise<PaginatedEscalationHistory> {
  const base = getApiBaseUrl();
  if (!base) {
    throw new Error("NEXT_PUBLIC_API_BASE_URL is not configured");
  }

  const search = new URLSearchParams();
  if (params.page) {
    search.set("page", String(params.page));
  }
  if (params.pageSize) {
    search.set("pageSize", String(params.pageSize));
  }
  if (params.conversationId) {
    search.set("conversationId", params.conversationId);
  }
  if (params.status) {
    search.set("status", params.status);
  }

  const qs = search.toString();
  const url = `${base}/api/escalations${qs ? `?${qs}` : ""}`;

  const response = await fetch(url, {
    method: "GET",
    headers: { Accept: "application/json" },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Failed to load escalations (${response.status})`);
  }

  return response.json() as Promise<PaginatedEscalationHistory>;
}

/** Latest escalation for a conversation (most recent first). */
export async function fetchLatestEscalationForConversation(
  conversationId: string,
): Promise<EscalationHistoryItem | null> {
  const result = await listEscalations({
    conversationId,
    page: 1,
    pageSize: 1,
  });
  return result.data[0] ?? null;
}

export async function fetchEscalationById(
  escalationId: string,
): Promise<EscalationHistoryItem | null> {
  const base = getApiBaseUrl();
  if (!base) {
    throw new Error("NEXT_PUBLIC_API_BASE_URL is not configured");
  }

  const response = await fetch(`${base}/api/escalations/${escalationId}`, {
    method: "GET",
    headers: { Accept: "application/json" },
    cache: "no-store",
  });

  if (response.status === 404) {
    return null;
  }
  if (!response.ok) {
    throw new Error(`Failed to load escalation (${response.status})`);
  }

  return response.json() as Promise<EscalationHistoryItem>;
}
