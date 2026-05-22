const SESSION_KEY = "inquiry-chat-session-id";
const CONVERSATION_KEY = "inquiry-chat-conversation-id";

export function loadChatSessionId(): string | undefined {
  if (typeof window === "undefined") {
    return undefined;
  }
  return sessionStorage.getItem(SESSION_KEY) ?? undefined;
}

export function saveChatSessionId(sessionId: string): void {
  sessionStorage.setItem(SESSION_KEY, sessionId);
}

export function loadConversationId(): string | undefined {
  if (typeof window === "undefined") {
    return undefined;
  }
  return sessionStorage.getItem(CONVERSATION_KEY) ?? undefined;
}

export function saveConversationId(conversationId: string): void {
  sessionStorage.setItem(CONVERSATION_KEY, conversationId);
}

export function clearChatPersistence(): void {
  sessionStorage.removeItem(SESSION_KEY);
  sessionStorage.removeItem(CONVERSATION_KEY);
}
