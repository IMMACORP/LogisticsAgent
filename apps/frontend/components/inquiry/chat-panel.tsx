"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, Loader2, RefreshCw, Send } from "lucide-react";
import { useEffect, useRef } from "react";
import { useForm } from "react-hook-form";

import { EscalationStatusPanel } from "@/components/inquiry/escalation-status-panel";
import { MarkdownMessage } from "@/components/inquiry/markdown-message";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { getApiBaseUrl } from "@/lib/api/get-api-base-url";
import { useChatStream } from "@/lib/hooks/use-chat-stream";
import { chatInputSchema, type ChatInputValues } from "@/lib/schemas/chat";
import type { ChatMessage } from "@/lib/types/chat";
import { cn } from "@/lib/utils";

interface ChatPanelProps {
  className?: string;
}

export function ChatPanel({ className }: ChatPanelProps) {
  const {
    messages,
    isLoading,
    isStreaming,
    lastTraceId,
    sessionId,
    conversationId,
    sendMessage,
    retryLastMessage,
    clearChat,
  } = useChatStream();

  const messagesScrollRef = useRef<HTMLDivElement>(null);
  const apiConfigured = Boolean(getApiBaseUrl());

  const form = useForm<ChatInputValues>({
    resolver: zodResolver(chatInputSchema),
    defaultValues: { prompt: "" },
  });

  const busy = isLoading || isStreaming;

  const scrollToBottom = () => {
    requestAnimationFrame(() => {
      const el = messagesScrollRef.current;
      if (el) {
        el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
      }
    });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isStreaming]);

  const handleSubmit = form.handleSubmit(async (values) => {
    await sendMessage(values.prompt);
    form.reset();
  });

  const lastMessage = messages[messages.length - 1];
  const showRetry =
    lastMessage?.role === "assistant" &&
    lastMessage.status === "error" &&
    lastMessage.recoverable;

  return (
    <aside
      className={cn(
        "flex h-full min-h-0 flex-col overflow-hidden border-l border-border bg-slate-50",
        className,
      )}
    >
      <div className="flex shrink-0 items-center justify-between border-b border-border bg-white px-5 py-4">
        <div>
          <p className="font-semibold text-[#1e3a5f]">ロジスティクス・エージェント</p>
          <p
            className={cn(
              "text-xs",
              busy ? "text-amber-600" : apiConfigured ? "text-emerald-600" : "text-destructive",
            )}
          >
            {busy
              ? "● 応答を生成中…"
              : apiConfigured
                ? "● オンライン（SSE）"
                : "● API 未設定"}
          </p>
          {lastTraceId ? (
            <p className="mt-1 truncate text-[10px] text-muted-foreground">
              trace: {lastTraceId.slice(0, 8)}…
              {sessionId ? ` · session: ${sessionId.slice(0, 8)}…` : null}
            </p>
          ) : null}
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={clearChat}
          disabled={busy}
        >
          新規チャット
        </Button>
      </div>

      {!apiConfigured ? (
        <div className="mx-5 mt-4 shrink-0 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">
          <AlertCircle className="mr-1 inline size-3.5" />
          `NEXT_PUBLIC_API_BASE_URL` を設定してください（例: http://localhost:3001）。
        </div>
      ) : null}

      <EscalationStatusPanel
        conversationId={conversationId}
        className="max-h-[min(32vh,280px)] shrink-0 overflow-y-auto"
      />

      <div
        ref={messagesScrollRef}
        className="min-h-0 flex-1 overflow-y-auto overscroll-contain"
        aria-label="チャットメッセージ"
      >
        <div className="space-y-4 px-5 py-5 pb-8">
          {messages.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border bg-white p-6 text-sm text-muted-foreground">
              物流に関するお問い合わせを入力してください。配送状況の確認、在庫、ルート最適化などをサポートします。
            </div>
          ) : (
            messages.map((message) => (
              <ChatMessageBubble key={message.id} message={message} />
            ))
          )}
        </div>
      </div>

      {showRetry ? (
        <div className="shrink-0 border-t border-border bg-white px-4 py-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="w-full"
            onClick={() => void retryLastMessage()}
            disabled={busy}
          >
            <RefreshCw className="mr-2 size-4" />
            再試行
          </Button>
        </div>
      ) : null}

      <form
        onSubmit={handleSubmit}
        className="shrink-0 border-t border-border bg-white p-4"
      >
        <div className="rounded-xl border border-border bg-slate-50 p-3">
          <Textarea
            {...form.register("prompt")}
            placeholder="物流に関するお問い合わせを入力してください..."
            className="min-h-[100px] resize-none border-0 bg-transparent shadow-none focus-visible:ring-0"
            disabled={busy || !apiConfigured}
          />
          {form.formState.errors.prompt ? (
            <p className="mt-2 text-xs text-destructive">
              {form.formState.errors.prompt.message}
            </p>
          ) : null}
          <div className="mt-3 flex items-center justify-between gap-3">
            <p className="text-xs text-muted-foreground">
              {busy ? "ストリーミング応答中" : "WMS / TMS 連携対応"}
            </p>
            <Button
              type="submit"
              disabled={busy || !apiConfigured}
              className="rounded-full bg-[#1e3a5f] hover:bg-[#152a47]"
            >
              {busy ? (
                <Loader2 className="animate-spin" />
              ) : (
                <Send />
              )}
              送信
            </Button>
          </div>
        </div>
      </form>
    </aside>
  );
}

function ChatMessageBubble({ message }: { message: ChatMessage }) {
  if (message.role === "user") {
    return (
      <div className="flex justify-end">
        <div className="max-w-[90%] rounded-2xl bg-[#1e3a5f] px-4 py-3 text-sm leading-6 text-white shadow">
          {message.content}
        </div>
      </div>
    );
  }

  const isStreaming = message.status === "streaming";
  const isError = message.status === "error";

  return (
    <div
      className={cn(
        "min-w-0 max-w-full rounded-2xl border bg-white p-4 shadow-sm",
        isError ? "border-destructive/40" : "border-border",
      )}
    >
      <div className="mb-2 flex items-center gap-2">
        <p className="text-xs font-semibold text-[#2563eb]">ロジスティクス・エージェント</p>
        {isStreaming ? (
          <span className="inline-flex items-center gap-1 text-[10px] text-muted-foreground">
            <Loader2 className="size-3 animate-spin" />
            入力中
          </span>
        ) : null}
      </div>
      {message.content ? (
        <div aria-live="polite" aria-atomic="false" className="space-y-2">
          {isStreaming ? (
            <p className="whitespace-pre-wrap break-words text-sm leading-7 text-foreground">
              {message.content}
              <span
                className="ml-0.5 inline-block h-[1em] w-0.5 animate-pulse bg-slate-500 align-text-bottom"
                aria-hidden
              />
            </p>
          ) : (
            <MarkdownMessage content={message.content} />
          )}
        </div>
      ) : isStreaming ? (
        <TypingIndicator />
      ) : null}
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
      <span className="h-2 w-2 rounded-full bg-slate-500 animate-pulse" />
      <span>ストリーミング中...</span>
    </div>
  );
}
