"use client";

import { useCallback, useRef, useState } from "react";

import { ChatStreamClientError, streamChat } from "@/lib/api/chat-stream";
import {
  clearChatPersistence,
  loadChatSessionId,
  loadConversationId,
  saveChatSessionId,
  saveConversationId,
} from "@/lib/chat/session-storage";
import type { ChatMessage } from "@/lib/types/chat";

const USER_ID = "web-guest";

function createMessage(
  role: ChatMessage["role"],
  content: string,
  status: ChatMessage["status"] = "complete",
): ChatMessage {
  return {
    id: crypto.randomUUID(),
    role,
    content,
    createdAt: new Date().toISOString(),
    status,
  };
}

export interface UseChatStreamResult {
  messages: ChatMessage[];
  setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
  isLoading: boolean;
  isStreaming: boolean;
  lastTraceId: string | undefined;
  sessionId: string | undefined;
  conversationId: string | undefined;
  sendMessage: (prompt: string) => Promise<void>;
  retryLastMessage: () => Promise<void>;
  clearChat: () => void;
  abortStream: () => void;
}

export function useChatStream(initialMessages: ChatMessage[] = []): UseChatStreamResult {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [isLoading, setIsLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [lastTraceId, setLastTraceId] = useState<string | undefined>();
  const [sessionId, setSessionId] = useState<string | undefined>(loadChatSessionId);
  const [conversationId, setConversationId] = useState<string | undefined>(
    loadConversationId,
  );

  const abortRef = useRef<AbortController | null>(null);
  const lastUserPromptRef = useRef<string | null>(null);

  const abortStream = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    setIsLoading(false);
    setIsStreaming(false);
  }, []);

  const runStream = useCallback(
    async (prompt: string) => {
      const userMessage = createMessage("user", prompt, "complete");
      const assistantId = crypto.randomUUID();
      const assistantPlaceholder: ChatMessage = {
        id: assistantId,
        role: "assistant",
        content: "",
        createdAt: new Date().toISOString(),
        status: "streaming",
      };

      setMessages((prev) => [...prev, userMessage, assistantPlaceholder]);
      setIsLoading(true);
      setIsStreaming(true);

      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      try {
        await streamChat({
          userId: USER_ID,
          channel: "logistics",
          message: prompt,
          sessionId,
          conversationId,
          signal: controller.signal,
          callbacks: {
            onMeta: (meta) => {
              setSessionId(meta.sessionId);
              setConversationId(meta.conversationId);
              setLastTraceId(meta.traceId);
              saveChatSessionId(meta.sessionId);
              saveConversationId(meta.conversationId);
            },
            onDelta: (text) => {
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === assistantId
                    ? { ...m, content: m.content + text, status: "streaming" }
                    : m,
                ),
              );
            },
            onDone: (done) => {
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === assistantId
                    ? {
                        ...m,
                        content: done.message,
                        status: "complete",
                      }
                    : m,
                ),
              );
              setLastTraceId(done.traceId);
              if (done.sessionId) {
                setSessionId(done.sessionId);
                saveChatSessionId(done.sessionId);
              }
              if (done.conversationId) {
                setConversationId(done.conversationId);
                saveConversationId(done.conversationId);
              }
            },
            onError: (err) => {
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === assistantId
                    ? {
                        ...m,
                        content: `**エラー**: ${err.message}`,
                        status: "error",
                        errorCode: err.code,
                        recoverable: err.recoverable ?? false,
                      }
                    : m,
                ),
              );
              setLastTraceId(err.traceId);
            },
          },
        });
      } catch (err) {
        if (controller.signal.aborted) {
          setMessages((prev) => prev.filter((m) => m.id !== assistantId));
          return;
        }

        const message =
          err instanceof ChatStreamClientError
            ? err.message
            : err instanceof Error
              ? err.message
              : "接続に失敗しました";

        const recoverable =
          err instanceof ChatStreamClientError ? err.recoverable : true;

        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId
              ? {
                  ...m,
                  content: `**エラー**: ${message}`,
                  status: "error",
                  errorCode:
                    err instanceof ChatStreamClientError ? err.code : "CLIENT_ERROR",
                  recoverable,
                }
              : m,
          ),
        );
      } finally {
        setIsLoading(false);
        setIsStreaming(false);
        abortRef.current = null;
      }
    },
    [sessionId, conversationId],
  );

  const sendMessage = useCallback(
    async (prompt: string) => {
      const trimmed = prompt.trim();
      if (!trimmed || isLoading || isStreaming) {
        return;
      }
      lastUserPromptRef.current = trimmed;
      await runStream(trimmed);
    },
    [isLoading, isStreaming, runStream],
  );

  const retryLastMessage = useCallback(async () => {
    const prompt = lastUserPromptRef.current;
    if (!prompt) {
      return;
    }
    setMessages((prev) => {
      const last = prev[prev.length - 1];
      if (last?.role === "assistant" && last.status === "error") {
        return prev.slice(0, -1);
      }
      return prev;
    });
    await runStream(prompt);
  }, [runStream]);

  const clearChat = useCallback(() => {
    abortStream();
    setMessages([]);
    setSessionId(undefined);
    setConversationId(undefined);
    setLastTraceId(undefined);
    lastUserPromptRef.current = null;
    clearChatPersistence();
  }, [abortStream]);

  return {
    messages,
    setMessages,
    isLoading,
    isStreaming,
    lastTraceId,
    sessionId,
    conversationId,
    sendMessage,
    retryLastMessage,
    clearChat,
    abortStream,
  };
}
