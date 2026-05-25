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
import { createTypewriterQueue } from "@/lib/hooks/use-typewriter-queue";
import type { TypewriterQueue } from "@/lib/hooks/use-typewriter-queue";

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
  const assistantIdRef = useRef<string | null>(null);
  const typewriterRef = useRef<TypewriterQueue | null>(null);

  const updateAssistantContent = useCallback((assistantId: string, content: string) => {
    setMessages((prev) =>
      prev.map((m) =>
        m.id === assistantId ? { ...m, content, status: "streaming" as const } : m,
      ),
    );
  }, []);

  const markAssistantComplete = useCallback((assistantId: string) => {
    setMessages((prev) =>
      prev.map((m) =>
        m.id === assistantId ? { ...m, status: "complete" as const } : m,
      ),
    );
    setIsStreaming(false);
    assistantIdRef.current = null;
    typewriterRef.current = null;
  }, []);

  const stopTypewriter = useCallback(() => {
    typewriterRef.current?.stop();
    typewriterRef.current = null;
    assistantIdRef.current = null;
  }, []);

  const abortStream = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    stopTypewriter();
    setIsLoading(false);
    setIsStreaming(false);
  }, [stopTypewriter]);

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

      stopTypewriter();
      assistantIdRef.current = assistantId;

      const typewriter = createTypewriterQueue({
        charDelayMs: 80,
        onUpdate: (content) => updateAssistantContent(assistantId, content),
        onComplete: () => markAssistantComplete(assistantId),
      });
      typewriterRef.current = typewriter;

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
              typewriter.enqueue(text);
            },
            onDone: (done) => {
              setLastTraceId(done.traceId);
              if (done.sessionId) {
                setSessionId(done.sessionId);
                saveChatSessionId(done.sessionId);
              }
              if (done.conversationId) {
                setConversationId(done.conversationId);
                saveConversationId(done.conversationId);
              }
              typewriter.complete(done.message);
            },
            onError: (err) => {
              stopTypewriter();
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
              setIsStreaming(false);
            },
          },
        });
      } catch (err) {
        if (controller.signal.aborted) {
          setMessages((prev) => prev.filter((m) => m.id !== assistantId));
          stopTypewriter();
          return;
        }

        stopTypewriter();

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
        setIsStreaming(false);
      } finally {
        setIsLoading(false);
        abortRef.current = null;
      }
    },
    [
      sessionId,
      conversationId,
      stopTypewriter,
      updateAssistantContent,
      markAssistantComplete,
    ],
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
