export type ChatRole = "user" | "assistant";

/** Delivery state for optimistic UI and streaming. */
export type ChatMessageStatus = "complete" | "streaming" | "error";

export interface ChatMessage {
  id: string;
  role: ChatRole;
  content: string;
  createdAt: string;
  status?: ChatMessageStatus;
  /** Set when status is error — allows retry of the paired user turn. */
  errorCode?: string;
  recoverable?: boolean;
}
